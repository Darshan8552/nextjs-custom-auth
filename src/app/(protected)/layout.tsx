import { SessionProvider } from "@/components/auth/session-provider";
import { UserMenu } from "@/components/auth/user-menu";
import { requireUser } from "@/lib/auth/guards";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/dashboard" className="font-semibold">
            Auth App
          </Link>
          <Suspense fallback={<UserMenuSkeleton />}>
            <AuthenticatedUserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 py-8">
        {children}
      </main>
    </>
  );
}

async function AuthenticatedUserMenu() {
  const user = await requireUser();

  return (
    <SessionProvider user={user}>
      <UserMenu />
    </SessionProvider>
  );
}

function UserMenuSkeleton() {
  return (
    <div
      aria-hidden
      className="size-8 animate-pulse rounded-full bg-muted"
    />
  );
}
