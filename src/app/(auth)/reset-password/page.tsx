import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Reset password" };

async function ResetPasswordContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token: rawToken } = await searchParams;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          You&apos;ll be logged out of all devices after resetting
        </CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              This reset link is invalid or incomplete.
            </p>
            <Button
              render={<Link href="/forgot-password" />}
              nativeButton={false}
              className="w-full"
            >
              Request a new link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we load the reset form
            </CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}
