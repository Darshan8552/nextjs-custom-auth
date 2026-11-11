import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardOverview } from "@/components/account/dashboard-overview";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Access overview" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const user = await requireUser();

  return <DashboardOverview user={user} />;
}

function DashboardSkeleton() {
  return (
    <output className="block space-y-8">
      <span className="sr-only">Loading your access overview…</span>
      <div className="border-b border-border pb-7">
        <div className="h-3 w-28 animate-pulse bg-muted" />
        <div className="mt-4 h-9 w-72 max-w-full animate-pulse bg-muted" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-[5px] border border-border bg-card">
          <div className="h-11 rounded-t-lg bg-muted" />
          <div className="space-y-5 p-5 sm:p-6">
            <div className="h-2.5 w-16 animate-pulse bg-muted" />
            <div className="h-7 w-3/4 animate-pulse bg-muted" />
            <div className="h-3 w-40 animate-pulse bg-muted" />
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-5">
              {["issued", "pass-id", "scope"].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="h-2.5 w-12 animate-pulse bg-muted" />
                  <div className="h-3 w-16 animate-pulse bg-muted" />
                </div>
              ))}
            </div>
            <div className="h-7 w-36 animate-pulse bg-muted" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-[5px] border border-border bg-card" />
          <div className="h-24 animate-pulse border-l-2 border-border bg-card" />
        </div>
      </div>
    </output>
  );
}
