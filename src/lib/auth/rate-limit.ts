import "server-only";
import { headers } from "next/headers";
import { AuthError } from "./errors";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "../prisma";

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; retryAfter: number }> {
  const rows = await prisma.$queryRaw<{ count: number; retryAfter: number }[]>(Prisma.sql`
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

  if (Math.random() < 0.01) {
    void prisma.rateLimit
      .deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
      .catch(() => {});
  }

  const row = rows[0];
  return { allowed: Number(row.count) <= limit, retryAfter: Number(row.retryAfter) };
}

function humanWait(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export async function enforceRateLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
  const { allowed, retryAfter } = await consumeRateLimit(key, limit, windowSeconds);
  if (!allowed) {
    throw new AuthError("RATE_LIMITED", `Too many attempts. Please try again in ${humanWait(retryAfter)}.`, {
      retryAfter,
    });
  }
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}