import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsView } from "@/components/account/settings-view";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Security settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const user = await requireUser();

  return <SettingsView user={user} />;
}

function SettingsSkeleton() {
  return (
    <output className="block space-y-8">
      <span className="sr-only">Loading security settings…</span>
      <div className="border-b border-border pb-7">
        <div className="h-3 w-32 animate-pulse bg-muted" />
        <div className="mt-4 h-9 w-64 max-w-full animate-pulse bg-muted" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-[5px] border border-border bg-card">
          <div className="space-y-2 border-b border-border px-5 py-4 sm:px-6">
            <div className="h-2.5 w-20 animate-pulse bg-muted" />
            <div className="h-5 w-40 animate-pulse bg-muted" />
            <div className="h-3 w-56 animate-pulse bg-muted" />
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            {["current", "new", "confirm"].map((field) => (
              <div key={field} className="space-y-2">
                <div className="h-3 w-32 animate-pulse bg-muted" />
                <div className="h-10 animate-pulse bg-muted" />
              </div>
            ))}
            <div className="h-11 w-full animate-pulse bg-muted sm:w-44" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-32 animate-pulse rounded-[5px] border border-border bg-card" />
          <div className="h-48 animate-pulse rounded-[5px] border border-border bg-card" />
        </div>
      </div>
    </output>
  );
}
