import { AuthErrorCode } from "./errors";

export type ActionFailure = {
  success: false;
  code: AuthErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
  retryAfter?: number;
};

export type ActionSuccess<T> = { success: true; data: T };

export type ActionResult<T = null> = ActionSuccess<T> | ActionFailure;
