"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authConfig } from "@/lib/auth/config";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { callAction, showFailure } from "./form-utils";
import { PasswordChecklist } from "./password-checklist";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [linkInvalid, setLinkInvalid] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  async function onSubmit(values: ResetPasswordInput) {
    const result = await callAction(() => resetPassword(values));
    if (!result) return;
    if (!result.success) {
      if (result.code === "RESET_TOKEN_INVALID") setLinkInvalid(true);
      showFailure(result, setError);
      return;
    }
    toast.success("Password updated. Please log in with your new password.");
    router.replace(authConfig.routes.login);
  }

  if (linkInvalid) {
    return (
      <div className="space-y-4">
        <p
          role="alert"
          className="border-l-2 border-signal bg-signal/[0.06] px-3 py-2.5 text-[13px] leading-5"
        >
          This reset link is invalid or has expired. Request a new link to
          continue.
        </p>
        <Button
          render={<Link href={authConfig.routes.forgotPassword} />}
          nativeButton={false}
          size="lg"
          className="w-full"
        >
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("token")} />
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-[13px]">
          New password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <PasswordChecklist password={password} confirm={confirmPassword} />
        <FieldError message={errors.password?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-[13px]">
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        Reset password
      </Button>
    </form>
  );
}
