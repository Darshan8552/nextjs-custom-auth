"use server"

import { ActionResult } from "@/lib/auth/result"
import { runAction } from "./helpers"
import { signUpSchema } from "@/lib/validations/auth"
import { AuthError } from "@/lib/auth/errors"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth/password"
import { enforceRateLimit, getClientIp } from "@/lib/auth/rate-limit"
import { issueEmailOtp } from "@/lib/auth/verification"

export async function signUp(input: unknown):  Promise<ActionResult<{ email: string }>>  {
    return runAction(signUpSchema, input, async ({ email, password }) => {
            await enforceRateLimit(`signup:${await getClientIp()}`, 10, 60 * 60);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.emailVerified) {
      throw new AuthError("EMAIL_TAKEN", "An account with this email already exists. Try logging in.", {
        fieldErrors: { email: ["An account with this email already exists"] },
      });
    }

    const passwordHash = await hashPassword(password);
        const user = existing
      ? await prisma.user.update({ where: { id: existing.id }, data: { passwordHash } })
      : await prisma.user.create({ data: { email, passwordHash } });

      try {
        await issueEmailOtp(user);
      } catch (err) {
        if (!(err instanceof AuthError && err.code === "RATE_LIMITED")) throw err;
      }

      return { email };
    })
}