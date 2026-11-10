import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import type { SessionUser } from "./types";

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function redirectIfAuthenticated(): Promise<void> {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
}