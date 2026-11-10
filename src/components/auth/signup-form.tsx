"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signUp } from "@/actions/auth/sign-up";
import { type SignUpInput, signUpSchema } from "@/lib/validations/auth";
import { Button } from "../ui/button";
import { FieldError } from "../ui/field-error";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { callAction, showFailure } from "./form-utils";
import { PasswordChecklist } from "./password-checklist";

export function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "" },
  });

  const password = watch("password");

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
        <PasswordChecklist password={password} />
        <FieldError message={errors.password?.message} />
      </div>
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
