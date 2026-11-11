export const authConfig = {
  appName: "Sallyport",

  routes: {
    login: "/login",
    signup: "/signup",
    verify: "/verify",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    settings: "/settings",
    afterLogin: "/dashboard",
    afterVerify: "/dashboard",
    afterLogout: "/login",
  },

  protectedPaths: ["/dashboard", "/settings"],

  session: {
    cookieName: "session_token",
    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    refreshAfterMs: 24 * 60 * 60 * 1000, // refresh once per day
  },

  password: {
    minLength: 8,
    maxBytes: 72,
    bcryptCost: 12,
  },

  otp: {
    ttlMs: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 5,
    resendCooldownSeconds: 60,
    maxPerHour: 5,
  },

  passwordReset: {
    ttlMs: 60 * 60 * 1000, // 1 hour
  },

  rateLimits: {
    signup: { limit: 10, windowSeconds: 60 * 60 },
    login: { limit: 5, windowSeconds: 60 },
    loginAccount: { limit: 20, windowSeconds: 60 * 60 },
    forgotPassword: { limit: 3, windowSeconds: 60 * 60 },
    forgotPasswordIp: { limit: 10, windowSeconds: 60 * 60 },
    changePassword: { limit: 5, windowSeconds: 15 * 60 },
  },
} as const;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: authConfig.session.maxAgeSeconds,
  };
}
