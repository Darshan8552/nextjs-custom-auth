import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/lib/types";
import { AccessPass } from "./access-pass";
import { AccountMasthead } from "./masthead";
import { StatusChip } from "./status-chip";

const SECURITY_ROWS = [
  { label: "Password", detail: "Set and ready to use", value: "Set" },
  { label: "Email", detail: "Primary recovery channel", value: "Verified" },
  { label: "Session", detail: "This device", value: "Active" },
] as const;

export function DashboardOverview({ user }: { user: SessionUser }) {
  return (
    <div className="space-y-8">
      <AccountMasthead
        eyebrow="Account / Overview"
        title="Access overview"
        description="Your credential is active. Review the pass and keep its security details current."
        aside={<StatusChip label="Verified" />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <AccessPass user={user} />

        <div className="space-y-6">
          <section
            aria-labelledby="security-heading"
            className="rounded-[5px] border border-border bg-card"
          >
            <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
              <h2
                id="security-heading"
                className="flex items-center gap-2 font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase"
              >
                <span aria-hidden="true" className="size-1.5 bg-signal" />
                Security
              </h2>
              <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                SEC-01
              </span>
            </header>

            <ul className="divide-y divide-border">
              {SECURITY_ROWS.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{row.label}</p>
                    <p className="mt-0.5 text-[11.5px] leading-4 text-muted-foreground">
                      {row.detail}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] text-verified uppercase">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-verified"
                    />
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-border p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                render={<Link href="/settings" />}
                nativeButton={false}
              >
                Manage security
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground"
                />
              </Button>
            </div>
          </section>

          <aside className="border-l-2 border-signal bg-card px-4 py-4">
            <p className="font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Recovery channel
            </p>
            <p className="mt-2 text-[12.5px] leading-5 text-muted-foreground">
              Keep access to{" "}
              <span className="break-all text-foreground">{user.email}</span>.
              It is the address used to reset this pass.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
