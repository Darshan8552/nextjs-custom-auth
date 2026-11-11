import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>
      <AuthCard
        kind="access"
        title="Welcome back"
        description="Log in to your account."
        footer={
          <>
            No account yet?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              Sign up
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthCard>
    </>
  );
}

async function AuthRedirect() {
  await redirectIfAuthenticated();
  return null;
}
