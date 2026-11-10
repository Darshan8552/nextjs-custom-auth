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
    <Suspense fallback={<ProtectedLayoutFallback />}>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </Suspense>
  );
}

async function ProtectedLayoutContent({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <SessionProvider user={user}>
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/dashboard" className="font-semibold">
            Auth App
          </Link>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 py-8">
        {children}
      </main>
    </SessionProvider>
  );
}

function ProtectedLayoutFallback() {
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <Link href="/dashboard" className="font-semibold">
            Auth App
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 py-8">
        <div
          aria-hidden="true"
          className="h-24 animate-pulse rounded-md bg-muted"
        />
      </main>
    </>
  );
}
