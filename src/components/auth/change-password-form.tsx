"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { changePassword } from "@/actions/auth";
import { useRequireAuth } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authConfig } from "@/lib/auth/config";
import {
  type ChangePasswordInput,
  changePasswordSchema,
} from "@/lib/validations/auth";
import { callAction, showFailure } from "./form-utils";
import { PasswordChecklist } from "./password-checklist";

export function ChangePasswordForm() {
  const user = useRequireAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  async function onSubmit(values: ChangePasswordInput) {
    const result = await callAction(() => changePassword(values));
    if (!result) return;
    if (!result.success) {
      showFailure(result, setError);
      if (result.code === "UNAUTHORIZED")
        router.replace(authConfig.routes.login);
      return;
    }
    reset();
    toast.success("Password changed. Your other devices were logged out.");
  }

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword" className="text-[13px]">
          Current password
        </Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.currentPassword}
          {...register("currentPassword")}
        />
        <FieldError message={errors.currentPassword?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-[13px]">
          New password
        </Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...register("newPassword")}
        />
        <PasswordChecklist password={newPassword} confirm={confirmPassword} />
        <FieldError message={errors.newPassword?.message} />
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
        className="w-full sm:w-auto sm:min-w-44"
        disabled={isSubmitting}
      >
        Change password
      </Button>
    </form>
  );
}
