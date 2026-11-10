"use client";

import { LoginInput, loginSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FieldError } from "../ui/field-error";
import { callAction, showFailure } from "./form-utils";
import { login } from "@/actions/auth/login";
import { toast } from "sonner";
import { Button } from "../ui/button";
import Link from "next/link";

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
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
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Log in
      </Button>
    </form>
  );
}
