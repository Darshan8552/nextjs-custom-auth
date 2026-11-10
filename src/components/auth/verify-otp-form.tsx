"use client";
import { VerifyOtpInput, verifyOtpSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "../ui/field-error";
import { Button } from "../ui/button";
import { OtpInput } from "./otp-input";
import { toast } from "sonner";
import { callAction, showFailure } from "./form-utils";
import { verifyOtp } from "@/actions/auth/verify-otp";
import { resendOtp } from "@/actions/auth/resend-otp";

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
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register("email")} />
        <div className="space-y-2">
          <OtpInput
            aria-label="6-digit code"
            aria-invalid={!!errors.code}
            autoFocus
            {...register("code")}
          />
          <FieldError message={errors.code?.message} className="text-center" />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Verify email
        </Button>
      </form>
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onResend}
          disabled={cooldown > 0 || resending}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>
      </div>
    </div>
  );
}
