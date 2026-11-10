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

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
