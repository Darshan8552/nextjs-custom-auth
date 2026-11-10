"use server";

import { AuthError } from "@/lib/auth/errors";
import { verifyPasswordOrDummy } from "@/lib/auth/password";
import { enforceRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import type { ActionResult } from "@/lib/auth/result";
import { createSession } from "@/lib/auth/session";
import { issueEmailOtp } from "@/lib/auth/verification";
import { loginSchema } from "@/lib/validations/auth";
import { runAction } from "./helpers";
import { prisma } from "@/lib/prisma";

export type LoginData =
  | { status: "OK" }
  | { status: "VERIFY_REQUIRED"; email: string };

export async function login(input: unknown): Promise<ActionResult<LoginData>> {
  return runAction(
    loginSchema,
    input,
    async ({ email, password }): Promise<LoginData> => {
      await enforceRateLimit(`login:${await getClientIp()}`, 5, 60);

      const user = await prisma.user.findUnique({ where: { email } });
      const valid = await verifyPasswordOrDummy(
        password,
        user?.passwordHash ?? null,
      );
      if (!user || !valid) {
        throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");
      }

      if (!user.emailVerified) {
        try {
          await issueEmailOtp(user);
        } catch (err) {
          if (!(err instanceof AuthError && err.code === "RATE_LIMITED"))
            throw err;
        }
        return { status: "VERIFY_REQUIRED", email: user.email };
      }

      await createSession(user.id);
      return { status: "OK" };
    },
  );
}
