import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { redirectIfAuthenticated } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>
      <AuthCard
        kind="issue"
        title="Create your account"
        description="Enter your email and we'll send a 6-digit code. You'll choose a password after the code confirms your address."
        footer={
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              Log in
            </Link>
          </>
        }
      >
        <SignupForm />
      </AuthCard>
    </>
  );
}

async function AuthRedirect() {
  await redirectIfAuthenticated();
  return null;
}
