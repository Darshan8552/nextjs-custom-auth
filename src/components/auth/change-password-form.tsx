"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { changePassword } from "@/actions/auth/change-password";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/auth";
import { callAction, showFailure } from "./form-utils";
import { useRequireAuth } from "./session-provider";

export function ChangePasswordForm() {
  const user = useRequireAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ChangePasswordInput) {
    const result = await callAction(() => changePassword(values));
    if (!result) return;
    if (!result.success) {
      showFailure(result, setError);
      if (result.code === "UNAUTHORIZED") router.replace("/login");
      return;
    }
    reset();
    toast.success("Password changed. Your other devices were logged out.");
  }

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.currentPassword}
          {...register("currentPassword")}
        />
        <FieldError message={errors.currentPassword?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...register("newPassword")}
        />
        <FieldError message={errors.newPassword?.message} />
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
      <Button type="submit" disabled={isSubmitting}>
        Change password
      </Button>
    </form>
  );
}
