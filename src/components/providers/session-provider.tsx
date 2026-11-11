"use client";

import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import { authConfig } from "@/lib/auth/config";
import type { SessionUser } from "@/lib/types";

type SessionContextValue = { user: SessionUser | null };

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={{ user }}>
      {children}
    </SessionContext.Provider>
  );
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
    if (!user) router.replace(authConfig.routes.login);
  }, [user, router]);

  return user;
}
