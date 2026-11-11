import z from "zod";
import { authConfig } from "@/lib/auth/config";

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password12",
  "password123",
  "password1234",
  "passw0rd",
  "p@ssw0rd",
  "p@ssword",
  "12345678",
  "123456789",
  "1234567890",
  "123123123",
  "11111111",
  "00000000",
  "87654321",
  "12341234",
  "qwertyui",
  "qwerty123",
  "qwertyuiop",
  "qwerty12",
  "1q2w3e4r",
  "1q2w3e4r5t",
  "q1w2e3r4",
  "zxcvbnm1",
  "abcd1234",
  "abc12345",
  "abcdefgh",
  "letmein1",
  "letmein123",
  "welcome1",
  "welcome123",
  "iloveyou",
  "iloveyou1",
  "admin123",
  "admin1234",
  "administrator",
  "changeme",
  "changeme123",
  "default123",
  "monkey123",
  "dragon123",
  "football1",
  "baseball1",
  "superman1",
  "sunshine1",
  "princess1",
  "master123",
  "shadow123",
  "trustno1",
  "whatever1",
  "starwars1",
  "hello123",
  "hello1234",
  "freedom1",
  "test1234",
  "testtest",
  "guest1234",
  "login123",
  "pass1234",
  "passpass",
  "secret123",
  "internet1",
  "computer1",
]);

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.trim().toLowerCase());
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

export const passwordSchema = z
  .string()
  .min(
    authConfig.password.minLength,
    `Password must be at least ${authConfig.password.minLength} characters`,
  )
  .refine(
    (p) => new TextEncoder().encode(p).length <= authConfig.password.maxBytes,
    `Password is too long (max ${authConfig.password.maxBytes} bytes)`,
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
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export const verifyOtpSchema = z
  .object({
    email: emailSchema,
    code: otpCodeSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const resendOtpSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is missing"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current one",
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
