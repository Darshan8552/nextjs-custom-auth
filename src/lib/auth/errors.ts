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

type AuthErrorExtra = {
  retryAfter?: number;
  fieldErrors?: Record<string, string[]>;
};

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly retryAfter?: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    code: AuthErrorCode,
    message: string,
    extra: AuthErrorExtra = {},
  ) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.retryAfter = extra.retryAfter;
    this.fieldErrors = extra.fieldErrors;
  }
}
