import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
  SESSION_REFRESH_AFTER_MS,
  sessionCookieOptions,
} from "./constants";
import { generateToken, hashToken } from "./tokens";
import type { SessionUser } from "./types";
import { prisma } from "../prisma";

export async function createSession(userId: string): Promise<void> {
  const token = generateToken(32);
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
    },
  });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions());
}

export const getCurrentSession = cache(
  async (): Promise<{ sessionId: string; user: SessionUser } | null> => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (!session) return null;

    const now = Date.now();
    if (session.expiresAt.getTime() <= now) {
      await prisma.session.deleteMany({ where: { id: session.id } });
      return null;
    }
    if (!session.user.emailVerified) return null;

    const remaining = session.expiresAt.getTime() - now;
    if (remaining < SESSION_MAX_AGE_MS - SESSION_REFRESH_AFTER_MS) {
      await prisma.session.update({
        where: { id: session.id },
        data: { expiresAt: new Date(now + SESSION_MAX_AGE_MS) },
      });
    }

    const { id, email, emailVerified, createdAt } = session.user;
    return {
      sessionId: session.id,
      user: { id, email, emailVerified, createdAt },
    };
  },
);

export async function getCurrentUser(): Promise<SessionUser | null> {
  const current = await getCurrentSession();
  return current?.user ?? null;
}

export async function destroyCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

export async function invalidateUserSessions(
  userId: string,
  exceptSessionId?: string,
): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      userId,
      ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
    },
  });
}
