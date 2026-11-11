import "server-only";

export type {
  ActionFailure,
  ActionResult,
  AuthErrorCode,
  LoginResult,
  SessionUser,
} from "@/lib/types";
export { authConfig } from "./config";
export { AuthError } from "./errors";
export { redirectIfAuthenticated, requireUser } from "./guards";
export {
  createSession,
  destroyCurrentSession,
  getCurrentSession,
  getCurrentUser,
  invalidateUserSessions,
} from "./session";
