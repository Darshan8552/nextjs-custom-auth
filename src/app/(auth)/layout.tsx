import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { ModeToggle } from "@/components/ui/toggle-mode";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <Link
            href="/"
            className="rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <Wordmark />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase sm:flex">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full border border-muted-foreground/70"
              />
              Guest access
            </span>
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[27rem]">{children}</div>
      </main>
    </div>
  );
}
