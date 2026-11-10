import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BREVO_API_KEY: z.string().min(1, "BREVO_API_KEY is required"),
  EMAIL_FROM: z.string().min(3, "EMAIL_FROM is required"),
  APP_URL: z.url("APP_URL must be a full URL").transform((v) => v.replace(/\/+$/, "")),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = Object.entries(z.flattenError(parsed.error).fieldErrors)
      .map(([key, msgs]) => `${key}: ${msgs?.join(", ")}`)
      .join("; ");
    throw new Error(`Invalid environment variables -> ${problems}`);
  }
  cached = parsed.data;
  return cached;
}
