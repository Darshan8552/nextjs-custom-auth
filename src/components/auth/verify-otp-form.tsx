"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { resendOtp } from "@/actions/auth/resend-otp";
import { verifyOtp } from "@/actions/auth/verify-otp";
import { type VerifyOtpInput, verifyOtpSchema } from "@/lib/validations/auth";
import { Button } from "../ui/button";
import { FieldError } from "../ui/field-error";
import { callAction, showFailure } from "./form-utils";
import { OtpInput } from "./otp-input";

const INITIAL_COOLDOWN = 60;

export function VerifyOtpForm({ email }: { email: string }) {
  const router = useRouter();
  const [cooldown, setCooldown] = useState(INITIAL_COOLDOWN);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const {
    control,
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email, code: "" },
  });

  async function onSubmit(values: VerifyOtpInput) {
    const result = await callAction(() => verifyOtp(values));
    if (!result) return;
    if (!result.success) {
      showFailure(result, setError);
      if (
        result.code === "OTP_TOO_MANY_ATTEMPTS" ||
        result.code === "OTP_EXPIRED"
      )
        resetField("code");
      return;
    }
    toast.success("Email verified. Welcome!");
    router.replace("/dashboard");
    router.refresh();
  }

  async function onResend() {
    setResending(true);
    const result = await callAction(() => resendOtp({ email }));
    setResending(false);
    if (!result) return;
    if (!result.success) {
      if (result.retryAfter) setCooldown(result.retryAfter);
      showFailure(result);
      return;
    }
    resetField("code");
    setCooldown(result.data.cooldownSeconds);
    toast.success("A new code is on its way.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("email")} />
      <div className="space-y-2">
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <OtpInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              aria-invalid={!!errors.code}
              autoFocus
            />
          )}
        />
        <FieldError message={errors.code?.message} className="text-center" />
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        Verify email
      </Button>
      <div className="flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
        <p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
          Code not received?
        </p>
        <p className="sr-only" aria-live="polite">
          {cooldown === 0 ? "You can resend the code now." : ""}
        </p>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 font-mono text-[11px] tracking-[0.02em] disabled:no-underline"
          onClick={onResend}
          disabled={cooldown > 0 || resending}
        >
          {resending
            ? "Sending…"
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend code"}
        </Button>
      </div>
    </form>
  );
}
