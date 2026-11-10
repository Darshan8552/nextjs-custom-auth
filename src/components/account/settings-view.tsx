import Link from "next/link";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import type { SessionUser } from "@/lib/auth/types";
import { AccountMasthead } from "./masthead";
import { StatusChip } from "./status-chip";

const monthYearFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
});

export function SettingsView({ user }: { user: SessionUser }) {
  return (
    <div className="space-y-8">
      <AccountMasthead
        eyebrow={
          <>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <span>Security</span>
          </>
        }
        title="Security settings"
        description="Rotate the password attached to your pass. Other sessions close when you do."
        aside={<StatusChip label="Session active" />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
        <section
          aria-labelledby="change-password-heading"
          className="rounded-[5px] border border-border bg-card"
        >
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div>
              <p className="flex items-center gap-2 font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                <span aria-hidden="true" className="size-1.5 bg-signal" />
                Key rotation
              </p>
              <h2
                id="change-password-heading"
                className="mt-2 text-[19px] font-semibold tracking-[-0.025em]"
              >
                Change password
              </h2>
              <p className="mt-1 text-[12.5px] leading-5 text-muted-foreground">
                Choose a new password for this credential.
              </p>
            </div>
            <span className="mt-0.5 font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
              SEC-01
            </span>
          </header>

          <div className="p-5 sm:p-6">
            <ChangePasswordForm />
          </div>
        </section>

        <div className="space-y-6">
          <section
            aria-labelledby="holder-heading"
            className="rounded-[5px] border border-border bg-card"
          >
            <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
              <h2
                id="holder-heading"
                className="font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase"
              >
                Holder
              </h2>
              <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                ID-01
              </span>
            </header>
            <div className="p-4">
              <p className="text-[13.5px] leading-5 font-medium break-all">
                {user.email}
              </p>
              <p className="mt-2 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] text-verified uppercase">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-verified"
                />
                Verified
              </p>
              <p className="mt-3 font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
                Member since {monthYearFormatter.format(user.createdAt)}
              </p>
            </div>
          </section>

          <section
            aria-labelledby="session-policy-heading"
            className="rounded-[5px] border border-border bg-card"
          >
            <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
              <h2
                id="session-policy-heading"
                className="font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase"
              >
                Session policy
              </h2>
              <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                SES-01
              </span>
            </header>
            <ul className="divide-y divide-border">
              <li className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-[12.5px]">Other devices</span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] text-verified uppercase">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-verified"
                  />
                  Signed out
                </span>
              </li>
              <li className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-[12.5px]">This device</span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] text-verified uppercase">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-verified"
                  />
                  Stays active
                </span>
              </li>
            </ul>
            <p className="border-t border-dashed border-border px-4 py-3 text-[11.5px] leading-4 text-muted-foreground">
              Changing your password revokes every other session tied to this
              account.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
