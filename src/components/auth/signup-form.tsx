"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authConfig } from "@/lib/auth/config";
import { type SignUpInput, signUpSchema } from "@/lib/validations/auth";
import { callAction, showFailure } from "./form-utils";

export function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: SignUpInput) {
    const result = await callAction(() => signUp(values));
    if (!result) return;
    if (!result.success) {
      showFailure(result, setError);
      return;
    }

    toast.success("We sent a 6-digit code to your email.");
    router.push(
      `${authConfig.routes.verify}?email=${encodeURIComponent(result.data.email)}&sent=1`,
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        You&apos;ll choose a password after the code confirms your address.
      </p>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        Create account
      </Button>
    </form>
  );
}
