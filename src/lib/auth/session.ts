import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/types";
import { authConfig, sessionCookieOptions } from "./config";
import { generateToken, hashToken } from "./tokens";

const MAX_AGE_MS = authConfig.session.maxAgeSeconds * 1000;
const REFRESH_AFTER_MS = authConfig.session.refreshAfterMs;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

let lastSessionCleanup = 0;

function cleanupExpiredSessions(): void {
  const now = Date.now();
  if (now - lastSessionCleanup < CLEANUP_INTERVAL_MS) return;
  lastSessionCleanup = now;
  void prisma.session
    .deleteMany({ where: { expiresAt: { lt: new Date(now) } } })
    .catch(() => {});
}

export async function createSession(userId: string): Promise<void> {
  const token = generateToken(32);
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + MAX_AGE_MS),
    },
  });
  cleanupExpiredSessions();
  (await cookies()).set(
    authConfig.session.cookieName,
    token,
    sessionCookieOptions(),
  );
}

export const getCurrentSession = cache(
  async (): Promise<{ sessionId: string; user: SessionUser } | null> => {
    const token = (await cookies()).get(authConfig.session.cookieName)?.value;
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
    if (remaining < MAX_AGE_MS - REFRESH_AFTER_MS) {
      await prisma.session.update({
        where: { id: session.id },
        data: { expiresAt: new Date(now + MAX_AGE_MS) },
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
  const token = store.get(authConfig.session.cookieName)?.value;
  try {
    if (token) {
      await prisma.session.deleteMany({
        where: { tokenHash: hashToken(token) },
      });
    }
  } finally {
    store.delete(authConfig.session.cookieName);
  }
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
