"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetPassword } from "@/actions/auth/reset-password";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { callAction, showFailure } from "./form-utils";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [linkInvalid, setLinkInvalid] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    const result = await callAction(() => resetPassword(values));
    if (!result) return;
    if (!result.success) {
      if (result.code === "RESET_TOKEN_INVALID") setLinkInvalid(true);
      showFailure(result, setError);
      return;
    }
    toast.success("Password updated. Please log in with your new password.");
    router.replace("/login");
  }

  if (linkInvalid) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          This reset link is invalid or has expired.
        </p>
        <Button
          render={<Link href="/forgot-password" />}
          nativeButton={false}
          className="w-full"
        >
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register("token")} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Reset password
      </Button>
    </form>
  );
}
