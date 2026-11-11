"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { resendOtp, verifyOtp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authConfig } from "@/lib/auth/config";
import { type VerifyOtpInput, verifyOtpSchema } from "@/lib/validations/auth";
import { callAction, showFailure } from "./form-utils";
import { OtpInput } from "./otp-input";
import { PasswordChecklist } from "./password-checklist";

export function VerifyOtpForm({
  email,
  initialCooldown,
}: {
  email: string;
  initialCooldown: number;
}) {
  const router = useRouter();
  const [cooldown, setCooldown] = useState<number>(initialCooldown);
  const [resending, setResending] = useState(false);
  const cooldownEndsAt = useRef<number | null>(null);

  useEffect(() => {
    cooldownEndsAt.current = Date.now() + initialCooldown * 1000;
    const tick = () => {
      const endsAt = cooldownEndsAt.current;
      if (endsAt === null) return;
      setCooldown(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [initialCooldown]);

  function startCooldown(seconds: number) {
    cooldownEndsAt.current = Date.now() + seconds * 1000;
    setCooldown(seconds);
  }

  const {
    control,
    register,
    handleSubmit,
    setError,
    resetField,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email, code: "", password: "", confirmPassword: "" },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  async function onSubmit(values: VerifyOtpInput) {
    const result = await callAction(() => verifyOtp(values));
    if (!result) return;
    if (!result.success) {
      showFailure(result, setError);
      if (
        result.code === "OTP_TOO_MANY_ATTEMPTS" ||
        result.code === "OTP_EXPIRED"
      ) {
        resetField("code");
      }
      return;
    }
    toast.success("Email verified. Welcome!");
    router.replace(authConfig.routes.afterVerify);
    router.refresh();
  }

  async function onResend() {
    setResending(true);
    const result = await callAction(() => resendOtp({ email }));
    setResending(false);
    if (!result) return;
    if (!result.success) {
      if (result.retryAfter) startCooldown(result.retryAfter);
      showFailure(result);
      return;
    }
    resetField("code");
    startCooldown(result.data.cooldownSeconds);
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
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-[13px]">
          Password
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
          Confirm password
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
        Verify and continue
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
