import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Reset password" };

async function ResetPasswordContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token: rawToken } = await searchParams;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  return (
    <AuthCard
      kind="recovery"
      title="Choose a new password"
      description="You'll be logged out of all devices after resetting."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Back to log in
          </Link>
        </>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-4">
          <p
            role="alert"
            className="border-l-2 border-signal bg-signal/[0.06] px-3 py-2.5 text-[13px] leading-5"
          >
            This reset link is invalid or incomplete. Request a new link to
            continue.
          </p>
          <Button
            render={<Link href="/forgot-password" />}
            nativeButton={false}
            size="lg"
            className="w-full"
          >
            Request a new link
          </Button>
        </div>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense
      fallback={
        <AuthCard
          kind="recovery"
          title="Choose a new password"
          description="Loading your reset form…"
        >
          <div className="space-y-4">
            <div className="h-10 animate-pulse rounded-[4px] bg-muted" />
            <div className="h-10 animate-pulse rounded-[4px] bg-muted" />
            <div className="h-11 animate-pulse rounded-[4px] bg-muted" />
          </div>
        </AuthCard>
      }
    >
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}
