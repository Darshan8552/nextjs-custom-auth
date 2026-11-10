export const SESSION_COOKIE = "session_token";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;
export const SESSION_REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_PER_HOUR = 5;

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export const BCRYPT_COST = 12;

export const PROTECTED_PATH_PREFIXES = ["/dashboard", "/settings"];

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

