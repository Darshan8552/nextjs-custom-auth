import "server-only";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { otpEmail } from "@/emails/otp-email";
import {
  OTP_MAX_PER_HOUR,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_MS,
  RESET_TOKEN_TTL_MS,
} from "./constants";
import { AuthError } from "./errors";
import { generateOtp, generateToken, hashOtp, hashToken } from "./tokens";
import { prisma } from "../prisma";
import { resetPasswordEmail } from "@/emails/reset-password-email";

const HOUR_MS = 60 * 60 * 1000;

export async function issueEmailOtp(user: {
  id: string;
  email: string;
}): Promise<void> {
  const now = Date.now();

  const recent = await prisma.verificationToken.findMany({
    where: {
      userId: user.id,
      type: "EMAIL_OTP",
      createdAt: { gt: new Date(now - HOUR_MS) },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const last = recent[0];
  if (last) {
    const wait =
      OTP_RESEND_COOLDOWN_SECONDS -
      Math.floor((now - last.createdAt.getTime()) / 1000);
    if (wait > 0) {
      throw new AuthError(
        "RATE_LIMITED",
        `Please wait ${wait}s before requesting another code.`,
        {
          retryAfter: wait,
        },
      );
    }
  }
  if (recent.length >= OTP_MAX_PER_HOUR) {
    const oldest = recent[recent.length - 1];
    const wait = Math.ceil((oldest.createdAt.getTime() + HOUR_MS - now) / 1000);
    throw new AuthError(
      "RATE_LIMITED",
      `You've requested too many codes. Try again in ${Math.ceil(wait / 60)} minute(s).`,
      { retryAfter: wait },
    );
  }

  const code = generateOtp();
  const record = await prisma.verificationToken.create({
    data: {
      userId: user.id,
      type: "EMAIL_OTP",
      tokenHash: hashOtp(user.id, code),
      expiresAt: new Date(now + OTP_TTL_MS),
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

export async function issuePasswordReset(user: {
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
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    }),
  ]);

  const url = `${env().APP_URL}/reset-password?token=${rawToken}`;
  await sendEmail(user.email, resetPasswordEmail(url));
}
