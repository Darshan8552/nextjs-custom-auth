import type { AuthErrorCode } from "@/lib/types";

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
