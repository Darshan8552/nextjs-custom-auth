"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { login } from "@/actions/auth/login";
import { type LoginInput, loginSchema } from "@/lib/validations/auth";
import { Button } from "../ui/button";
import { FieldError } from "../ui/field-error";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { callAction, showFailure } from "./form-utils";

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    const result = await callAction(() => login(values));
    if (!result) return;
    if (!result.success) {
      showFailure(result, setError);
      return;
    }
    if (result.data.status === "VERIFY_REQUIRED") {
      toast.info("Please verify your email first. We sent you a new code.");
      router.push(`/verify?email=${encodeURIComponent(result.data.email)}`);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
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
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password" className="text-[13px]">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-[12px] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        Log in
      </Button>
    </form>
  );
}
