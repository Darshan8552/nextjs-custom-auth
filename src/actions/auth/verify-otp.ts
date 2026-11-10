"use server";

import { after } from "next/server";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/emails/welcome-email";
import { OTP_MAX_ATTEMPTS } from "@/lib/auth/constants";
import { AuthError } from "@/lib/auth/errors";
import type { ActionResult } from "@/lib/auth/result";
import { createSession } from "@/lib/auth/session";
import { hashOtp, safeEqual } from "@/lib/auth/tokens";
import { verifyOtpSchema } from "@/lib/validations/auth";
import { runAction } from "./helpers";
import { prisma } from "@/lib/prisma";

const EXPIRED = "This code has expired or is no longer valid. Request a new one.";

export async function verifyOtp(input: unknown): Promise<ActionResult> {
  return runAction(verifyOtpSchema, input, async ({ email, code }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) {
      throw new AuthError("OTP_EXPIRED", EXPIRED);
    }
    const token = await prisma.verificationToken.findFirst({
      where: { userId: user.id, type: "EMAIL_OTP" },
      orderBy: { createdAt: "desc" },
    });
    if (!token || token.expiresAt.getTime() <= Date.now()) {
      throw new AuthError("OTP_EXPIRED", EXPIRED);
    }

    const claimed = await prisma.verificationToken.updateMany({
      where: { id: token.id, attempts: { lt: OTP_MAX_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
    if (claimed.count === 0) {
      await prisma.verificationToken.deleteMany({ where: { id: token.id } });
      throw new AuthError("OTP_TOO_MANY_ATTEMPTS", "Too many wrong attempts. Please request a new code.");
    }

    if (!safeEqual(token.tokenHash, hashOtp(user.id, code))) {
      const attemptsLeft = OTP_MAX_ATTEMPTS - (token.attempts + 1);
      if (attemptsLeft <= 0) {
        await prisma.verificationToken.deleteMany({ where: { id: token.id } });
        throw new AuthError("OTP_TOO_MANY_ATTEMPTS", "Too many wrong attempts. Please request a new code.");
      }
      throw new AuthError(
        "OTP_INVALID",
        `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left.`,
        { fieldErrors: { code: ["Incorrect code"] } },
      );
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } }),
      prisma.verificationToken.deleteMany({ where: { userId: user.id, type: "EMAIL_OTP" } }),
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
  });
}
