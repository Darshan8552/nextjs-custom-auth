export type AuthErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "OTP_EXPIRED"
  | "OTP_INVALID"
  | "OTP_TOO_MANY_ATTEMPTS"
  | "RESET_TOKEN_INVALID"
  | "RATE_LIMITED"
  | "EMAIL_SERVICE_UNAVAILABLE"
  | "UNAUTHORIZED"
  | "INTERNAL";

export type SessionUser = {
  id: string;
  email: string;
  emailVerified: Date | null;
  createdAt: Date;
};

export type ActionFailure = {
  success: false;
  code: AuthErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
  retryAfter?: number;
};

export type ActionSuccess<T> = { success: true; data: T };

export type ActionResult<T = null> = ActionSuccess<T> | ActionFailure;

export type LoginResult =
  | { status: "OK" }
  | { status: "VERIFY_REQUIRED"; email: string };
