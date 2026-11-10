import z from "zod";
import { isCommonPassword } from "./common-passwords";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    (p) => new TextEncoder().encode(p).length <= 72,
    "Password is too long (max 72 bytes)",
  )
  .refine(
    (p) => !isCommonPassword(p),
    "This password is too common. Please choose another one",
  );

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});

export const resendOtpSchema = z.object({
  email: emailSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
