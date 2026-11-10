"use server";

import { AuthError } from "@/lib/auth/errors";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import type { ActionResult } from "@/lib/auth/result";
import { getCurrentSession, invalidateUserSessions } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validations/auth";
import { runAction } from "./helpers";
import { prisma } from "@/lib/prisma";

export async function changePassword(input: unknown): Promise<ActionResult> {
  return runAction(changePasswordSchema, input, async ({ currentPassword, newPassword }) => {
    const current = await getCurrentSession();
    if (!current) {
      throw new AuthError("UNAUTHORIZED", "Your session has expired. Please log in again.");
    }
    const userId = current.user.id;

    await enforceRateLimit(`change-password:${userId}`, 5, 15 * 60);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new AuthError("INVALID_CREDENTIALS", "Current password is incorrect", {
        fieldErrors: { currentPassword: ["Current password is incorrect"] },
      });
    }

    await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
    await invalidateUserSessions(userId, current.sessionId);
    return null;
  });
}
