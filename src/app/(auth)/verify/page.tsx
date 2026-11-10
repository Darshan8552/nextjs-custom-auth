import { VerifyOtpForm } from "@/components/auth/verify-otp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { emailSchema } from "@/lib/validations/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
    <Card>
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{parsed.data}</span>. It
          expires in 10 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyOtpForm email={parsed.data} />
      </CardContent>
    </Card>
  );
}

function VerifyFallback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>Loading verification details...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-28 animate-pulse bg-muted rounded-md" />
      </CardContent>
    </Card>
  );
}