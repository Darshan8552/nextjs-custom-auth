import "server-only";

import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/types";
import { authConfig } from "./config";
import { getCurrentUser } from "./session";

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(authConfig.routes.login);
  return user;
}

export async function redirectIfAuthenticated(): Promise<void> {
  const user = await getCurrentUser();
  if (user) redirect(authConfig.routes.afterLogin);
}
