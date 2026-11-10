"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { forgotPassword } from "@/actions/auth/forgot-password";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/lib/validations/auth";
import { callAction, showFailure } from "./form-utils";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    const result = await callAction(() => forgotPassword(values));
    if (!result) return;
    if (!result.success) {
      showFailure(result, setError);
      return;
    }
    setMessage(result.data.message);
  }

  if (message) {
    return (
      <output className="block border border-border bg-background p-4">
        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          Reset link sent
        </p>
        <p className="mt-2 text-[13px] leading-5">
          {message}. The link is valid for 1 hour.
        </p>
      </output>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-[13px]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        Send reset link
      </Button>
    </form>
  );
}
