"use server";

import { AuthError } from "@/lib/auth/errors";
import { hashPassword } from "@/lib/auth/password";
import type { ActionResult } from "@/lib/auth/result";
import { hashToken } from "@/lib/auth/tokens";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { runAction } from "./helpers";
import { prisma } from "@/lib/prisma";

const INVALID_LINK = "This reset link is invalid or has expired. Request a new one.";

export async function resetPassword(input: unknown): Promise<ActionResult> {
  return runAction(resetPasswordSchema, input, async ({ token, password }) => {
    const record = await prisma.verificationToken.findFirst({
      where: { tokenHash: hashToken(token), type: "PASSWORD_RESET" },
    });
    if (!record || record.expiresAt.getTime() <= Date.now()) {
      throw new AuthError("RESET_TOKEN_INVALID", INVALID_LINK);
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      const consumed = await tx.verificationToken.deleteMany({
        where: { id: record.id, expiresAt: { gt: new Date() } },
      });
      if (consumed.count !== 1) {
        throw new AuthError("RESET_TOKEN_INVALID", INVALID_LINK);
      }

      await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
      await tx.session.deleteMany({ where: { userId: record.userId } });
      await tx.verificationToken.deleteMany({ where: { userId: record.userId, type: "PASSWORD_RESET" } });
    });

    return null;
  });
}
