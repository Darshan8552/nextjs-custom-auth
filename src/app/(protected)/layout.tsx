import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { SessionProvider } from "@/components/auth/session-provider";
import { UserMenu } from "@/components/auth/user-menu";
import { Wordmark } from "@/components/brand/wordmark";
import { ModeToggle } from "@/components/ui/toggle-mode";
import { requireUser } from "@/lib/auth/guards";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
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
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link
            href="/dashboard"
            className="rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <Wordmark />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 pr-1 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase sm:flex">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-verified"
              />
              Signed in
            </span>
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-12">
        {children}
      </main>
    </SessionProvider>
  );
}

function ProtectedLayoutFallback() {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-5">
          <Wordmark />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-12">
        <div
          aria-hidden="true"
          className="h-24 animate-pulse rounded-[4px] bg-muted"
        />
      </main>
    </>
  );
}
