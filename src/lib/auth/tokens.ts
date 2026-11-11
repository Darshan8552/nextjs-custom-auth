import "server-only";

import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { env } from "@/lib/env";

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashToken(value: string): string {
  return createHmac("sha256", env().SESSION_SECRET).update(value).digest("hex");
}

export function hashOtp(userId: string, code: string): string {
  return hashToken(`otp:${userId}:${code}`);
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
