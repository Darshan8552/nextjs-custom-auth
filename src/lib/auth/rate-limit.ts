import "server-only";

import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { AuthError } from "./errors";

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const EXPIRED_WINDOW_MS = 24 * 60 * 60 * 1000;

let lastCleanup = 0;

function cleanupExpiredLimits(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  void prisma.rateLimit
    .deleteMany({
      where: { windowStart: { lt: new Date(now - EXPIRED_WINDOW_MS) } },
    })
    .catch(() => {});
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; retryAfter: number }> {
  const rows = await prisma.$queryRaw<
    { count: number; retryAfter: number }[]
  >(Prisma.sql`
    INSERT INTO "RateLimit" ("key", "count", "windowStart")
    VALUES (${key}, 1, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimit"."windowStart" <= now() - make_interval(secs => ${windowSeconds}::double precision)
        THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE
        WHEN "RateLimit"."windowStart" <= now() - make_interval(secs => ${windowSeconds}::double precision)
        THEN now() ELSE "RateLimit"."windowStart" END
    RETURNING
      "count",
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM ("windowStart" + make_interval(secs => ${windowSeconds}::double precision) - now()))))::int AS "retryAfter"
  `);

  cleanupExpiredLimits();

  const row = rows[0];
  return {
    allowed: Number(row.count) <= limit,
    retryAfter: Number(row.retryAfter),
  };
}

function humanWait(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const { allowed, retryAfter } = await consumeRateLimit(
    key,
    limit,
    windowSeconds,
  );
  if (!allowed) {
    throw new AuthError(
      "RATE_LIMITED",
      `Too many attempts. Please try again in ${humanWait(retryAfter)}.`,
      { retryAfter },
    );
  }
}

function lastHeaderValue(value: string | null): string | undefined {
  if (!value) return undefined;
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.at(-1);
}

export async function getClientIp(): Promise<string> {
  const h = await headers();

  const trustedHeader = env().TRUSTED_IP_HEADER;
  if (trustedHeader) {
    const trusted = lastHeaderValue(h.get(trustedHeader));
    if (trusted) return trusted;
  }

  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return lastHeaderValue(h.get("x-forwarded-for")) ?? "unknown";
}
