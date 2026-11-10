import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      kind="recovery"
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link."
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
      <ForgotPasswordForm />
    </AuthCard>
  );
}
