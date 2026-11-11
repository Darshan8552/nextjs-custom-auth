import "server-only";

import { after } from "next/server";
import { otpEmail } from "@/emails/otp-email";
import { resetPasswordEmail } from "@/emails/reset-password-email";
import { welcomeEmail } from "@/emails/welcome-email";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import type { LoginResult } from "@/lib/types";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResendOtpInput,
  ResetPasswordInput,
  SignUpInput,
  VerifyOtpInput,
} from "@/lib/validations/auth";
import { authConfig } from "./config";
import { AuthError } from "./errors";
import {
  hashPassword,
  verifyPassword,
  verifyPasswordOrDummy,
} from "./password";
import { enforceRateLimit, getClientIp } from "./rate-limit";
import {
  createSession,
  destroyCurrentSession,
  getCurrentSession,
} from "./session";
import {
  generateOtp,
  generateToken,
  hashOtp,
  hashToken,
  safeEqual,
} from "./tokens";

const HOUR_MS = 60 * 60 * 1000;

const OTP_EXPIRED =
  "This code has expired or is no longer valid. Request a new one.";
const RESET_INVALID =
  "This reset link is invalid or has expired. Request a new one.";
const RESET_SENT = "If an account exists, we sent an email";

// ---------------------------------------------------------------------------
// Sign up / log in / log out
// ---------------------------------------------------------------------------

export async function signUp({
  email,
}: SignUpInput): Promise<{ email: string }> {
  const { limit, windowSeconds } = authConfig.rateLimits.signup;
  await enforceRateLimit(`signup:${await getClientIp()}`, limit, windowSeconds);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.emailVerified) {
    throw new AuthError(
      "EMAIL_TAKEN",
      "An account with this email already exists. Try logging in.",
      {
        fieldErrors: { email: ["An account with this email already exists"] },
      },
    );
  }

  const user =
    existing ??
    (await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(generateToken(32)),
      },
    }));

  try {
    await issueEmailOtp(user);
  } catch (err) {
    if (!(err instanceof AuthError && err.code === "RATE_LIMITED")) throw err;
  }

  return { email };
}

export async function login({
  email,
  password,
}: LoginInput): Promise<LoginResult> {
  const { limit, windowSeconds } = authConfig.rateLimits.login;
  await enforceRateLimit(`login:${await getClientIp()}`, limit, windowSeconds);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await verifyPasswordOrDummy(password, null);
    await recordFailedLogin(email);
    throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");
  }

  if (!user.emailVerified) {
    await verifyPasswordOrDummy(password, user.passwordHash);
    try {
      await issueEmailOtp(user);
    } catch (err) {
      if (!(err instanceof AuthError && err.code === "RATE_LIMITED")) throw err;
    }
    return { status: "VERIFY_REQUIRED", email: user.email };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await recordFailedLogin(email);
    throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");
  }

  await createSession(user.id);
  return { status: "OK" };
}

async function recordFailedLogin(email: string): Promise<void> {
  const { limit, windowSeconds } = authConfig.rateLimits.loginAccount;
  await enforceRateLimit(`login-account:${email}`, limit, windowSeconds);
}

export async function logout(): Promise<void> {
  try {
    await destroyCurrentSession();
  } catch (err) {
    console.error("[auth] logout failed:", err);
  }
}

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------

export async function verifyOtp({
  email,
  code,
  password,
}: VerifyOtpInput): Promise<null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) {
    throw new AuthError("OTP_EXPIRED", OTP_EXPIRED);
  }

  const token = await prisma.verificationToken.findFirst({
    where: { userId: user.id, type: "EMAIL_OTP" },
    orderBy: { createdAt: "desc" },
  });
  if (!token || token.expiresAt.getTime() <= Date.now()) {
    throw new AuthError("OTP_EXPIRED", OTP_EXPIRED);
  }

  const claimed = await prisma.verificationToken.updateMany({
    where: { id: token.id, attempts: { lt: authConfig.otp.maxAttempts } },
    data: { attempts: { increment: 1 } },
  });
  if (claimed.count === 0) {
    await prisma.verificationToken.deleteMany({ where: { id: token.id } });
    throw new AuthError(
      "OTP_TOO_MANY_ATTEMPTS",
      "Too many wrong attempts. Please request a new code.",
    );
  }

  if (!safeEqual(token.tokenHash, hashOtp(user.id, code))) {
    const attemptsLeft = authConfig.otp.maxAttempts - (token.attempts + 1);
    if (attemptsLeft <= 0) {
      await prisma.verificationToken.deleteMany({ where: { id: token.id } });
      throw new AuthError(
        "OTP_TOO_MANY_ATTEMPTS",
        "Too many wrong attempts. Please request a new code.",
      );
    }
    throw new AuthError(
      "OTP_INVALID",
      `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left.`,
      { fieldErrors: { code: ["Incorrect code"] } },
    );
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), passwordHash },
    }),
    prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: "EMAIL_OTP" },
    }),
  ]);

  after(async () => {
    try {
      await sendEmail(user.email, welcomeEmail(env().APP_URL));
    } catch (err) {
      console.error("[auth] welcome email failed:", err);
    }
  });

  await createSession(user.id);
  return null;
}

export async function resendOtp({
  email,
}: ResendOtpInput): Promise<{ cooldownSeconds: number }> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.emailVerified) {
    await enforceRateLimit(
      `otp-cooldown:anon:${email}`,
      1,
      authConfig.otp.resendCooldownSeconds,
    );
    await enforceRateLimit(
      `otp-hour:anon:${email}`,
      authConfig.otp.maxPerHour,
      60 * 60,
    );
  } else {
    await issueEmailOtp(user);
  }

  return { cooldownSeconds: authConfig.otp.resendCooldownSeconds };
}

// ---------------------------------------------------------------------------
// Password recovery
// ---------------------------------------------------------------------------

export async function requestPasswordReset({
  email,
}: ForgotPasswordInput): Promise<{ message: string }> {
  const ipLimit = authConfig.rateLimits.forgotPasswordIp;
  await enforceRateLimit(
    `forgot-ip:${await getClientIp()}`,
    ipLimit.limit,
    ipLimit.windowSeconds,
  );

  const { limit, windowSeconds } = authConfig.rateLimits.forgotPassword;
  await enforceRateLimit(`forgot:${email}`, limit, windowSeconds);

  after(async () => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user?.emailVerified) {
        await issuePasswordReset(user);
      }
    } catch (err) {
      console.error("[auth] forgot-password failed:", err);
    }
  });

  return { message: RESET_SENT };
}

export async function resetPassword({
  token,
  password,
}: ResetPasswordInput): Promise<null> {
  const record = await prisma.verificationToken.findFirst({
    where: { tokenHash: hashToken(token), type: "PASSWORD_RESET" },
  });
  if (!record || record.expiresAt.getTime() <= Date.now()) {
    throw new AuthError("RESET_TOKEN_INVALID", RESET_INVALID);
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.verificationToken.deleteMany({
      where: { id: record.id, expiresAt: { gt: new Date() } },
    });
    if (consumed.count !== 1) {
      throw new AuthError("RESET_TOKEN_INVALID", RESET_INVALID);
    }

    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await tx.session.deleteMany({ where: { userId: record.userId } });
    await tx.verificationToken.deleteMany({
      where: { userId: record.userId, type: "PASSWORD_RESET" },
    });
  });

  return null;
}

export async function changePassword({
  currentPassword,
  newPassword,
}: ChangePasswordInput): Promise<null> {
  const current = await getCurrentSession();
  if (!current) {
    throw new AuthError(
      "UNAUTHORIZED",
      "Your session has expired. Please log in again.",
    );
  }
  const userId = current.user.id;

  const { limit, windowSeconds } = authConfig.rateLimits.changePassword;
  await enforceRateLimit(`change-password:${userId}`, limit, windowSeconds);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new AuthError(
      "INVALID_CREDENTIALS",
      "Current password is incorrect",
      {
        fieldErrors: { currentPassword: ["Current password is incorrect"] },
      },
    );
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.verificationToken.deleteMany({
      where: { userId, type: "PASSWORD_RESET" },
    }),
    prisma.session.deleteMany({ where: { userId } }),
  ]);

  await createSession(userId);
  return null;
}

// ---------------------------------------------------------------------------
// Token issuing
// ---------------------------------------------------------------------------

async function issueEmailOtp(user: {
  id: string;
  email: string;
}): Promise<void> {
  const now = Date.now();
  const { ttlMs, maxPerHour, resendCooldownSeconds } = authConfig.otp;

  await enforceRateLimit(`otp-cooldown:${user.id}`, 1, resendCooldownSeconds);
  await enforceRateLimit(`otp-hour:${user.id}`, maxPerHour, 60 * 60);

  const code = generateOtp();
  const record = await prisma.verificationToken.create({
    data: {
      userId: user.id,
      type: "EMAIL_OTP",
      tokenHash: hashOtp(user.id, code),
      expiresAt: new Date(now + ttlMs),
    },
  });

  try {
    await sendEmail(user.email, otpEmail(code));
  } catch (err) {
    await prisma.verificationToken
      .delete({ where: { id: record.id } })
      .catch(() => {});
    throw err;
  }

  void prisma.verificationToken
    .deleteMany({
      where: {
        userId: user.id,
        type: "EMAIL_OTP",
        createdAt: { lt: new Date(now - 24 * HOUR_MS) },
      },
    })
    .catch(() => {});
}

async function issuePasswordReset(user: {
  id: string;
  email: string;
}): Promise<void> {
  const rawToken = generateToken(32);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: "PASSWORD_RESET" },
    }),
    prisma.verificationToken.create({
      data: {
        userId: user.id,
        type: "PASSWORD_RESET",
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + authConfig.passwordReset.ttlMs),
      },
    }),
  ]);

  const url = `${env().APP_URL}${authConfig.routes.resetPassword}?token=${rawToken}`;
  await sendEmail(user.email, resetPasswordEmail(url));
}
