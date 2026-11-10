"use server";

import { ActionResult } from "@/lib/auth/result";
import { runAction } from "./helpers";
import { prisma } from "@/lib/prisma";
import { OTP_MAX_PER_HOUR, OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/auth/constants";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { issueEmailOtp } from "@/lib/auth/verification";
import { resendOtpSchema } from "@/lib/validations/auth";

export async function resendOtp(input: unknown): Promise<ActionResult<{ cooldownSeconds: number }>> {
  return runAction(resendOtpSchema, input, async ({ email }) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      await enforceRateLimit(`otp-cooldown:${email}`, 1, OTP_RESEND_COOLDOWN_SECONDS);
      await enforceRateLimit(`otp-hour:${email}`, OTP_MAX_PER_HOUR, 60 * 60);
    } else {
      await issueEmailOtp(user);
    }

    return { cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS };
  });
}