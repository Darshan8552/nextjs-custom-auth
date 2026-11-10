"use server";

import { redirect } from "next/navigation";
import { destroyCurrentSession } from "@/lib/auth/session";

export async function logout(): Promise<void> {
  try {
    await destroyCurrentSession();
  } catch (err) {
    console.error("[auth] logout failed:", err);
  }
  redirect("/login");
}
