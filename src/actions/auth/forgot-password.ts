"use server";

import { after } from "next/server";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import type { ActionResult } from "@/lib/auth/result";
import { issuePasswordReset } from "@/lib/auth/verification";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { runAction } from "./helpers";
import { prisma } from "@/lib/prisma";

const GENERIC_MESSAGE = "If an account exists, we sent an email";

export async function forgotPassword(
  input: unknown,
): Promise<ActionResult<{ message: string }>> {
  return runAction(forgotPasswordSchema, input, async ({ email }) => {
    await enforceRateLimit(`forgot:${email}`, 3, 60 * 60);
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

    return { message: GENERIC_MESSAGE };
  });
}
