"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth/types";

type SessionContextValue = { user: SessionUser | null };

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  return <SessionContext.Provider value={{ user }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return { user: ctx.user, isAuthenticated: ctx.user !== null };
}

export function useRequireAuth() {
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  return user;
}
