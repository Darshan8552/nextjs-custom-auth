"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";
import { SignUpInput, signUpSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "../ui/field-error";
import { callAction, showFailure } from "./form-utils";
import { toast } from "sonner";
import { signUp } from "@/actions/auth/sign-up";

export function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignUpInput) {
    const result = await callAction(() => signUp(values));
    if (!result) return;
    if (!result.success) {
      showFailure(result, setError);
      return;
    }

    toast.success("We sent a 6-digit code to your email.");
    router.push(`/verify?email=${encodeURIComponent(result.data.email)}`);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        <FieldError message={errors.password?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Create account
      </Button>
    </form>
  );
}
