import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";
import { emailSchema } from "@/lib/validations/auth";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyContent searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifyContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { email: rawEmail } = await searchParams;
  const parsed = emailSchema.safeParse(
    Array.isArray(rawEmail) ? rawEmail[0] : rawEmail,
  );

  if (!parsed.success) redirect("/signup");

  return (
    <AuthCard
      kind="verification"
      title="Check your email"
      description={
        <>
          We sent a 6-digit code to{" "}
          <span className="font-mono text-[12.5px] text-foreground break-all">
            {parsed.data}
          </span>
          . It expires in 10 minutes.
        </>
      }
      footer={
        <>
          Wrong address?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Use a different email
          </Link>
        </>
      }
    >
      <VerifyOtpForm email={parsed.data} />
    </AuthCard>
  );
}

function VerifyFallback() {
  return (
    <AuthCard
      kind="verification"
      title="Check your email"
      description="Loading verification details…"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-1.5">
          {["one", "two", "three", "four", "five", "six"].map((cell) => (
            <div
              key={cell}
              className="h-12 animate-pulse rounded-[4px] bg-muted"
            />
          ))}
        </div>
        <div className="h-11 animate-pulse rounded-[4px] bg-muted" />
      </div>
    </AuthCard>
  );
}
