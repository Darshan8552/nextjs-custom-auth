"use server";

import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth/config";
import { runAction } from "@/lib/auth/result";
import * as service from "@/lib/auth/service";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resendOtpSchema,
  resetPasswordSchema,
  signUpSchema,
  verifyOtpSchema,
} from "@/lib/validations/auth";

export async function signUp(input: unknown) {
  return runAction(signUpSchema, input, service.signUp);
}

export async function login(input: unknown) {
  return runAction(loginSchema, input, service.login);
}

export async function verifyOtp(input: unknown) {
  return runAction(verifyOtpSchema, input, service.verifyOtp);
}

export async function resendOtp(input: unknown) {
  return runAction(resendOtpSchema, input, service.resendOtp);
}

export async function forgotPassword(input: unknown) {
  return runAction(forgotPasswordSchema, input, service.requestPasswordReset);
}

export async function resetPassword(input: unknown) {
  return runAction(resetPasswordSchema, input, service.resetPassword);
}

export async function changePassword(input: unknown) {
  return runAction(changePasswordSchema, input, service.changePassword);
}

export async function logout(): Promise<void> {
  await service.logout();
  redirect(authConfig.routes.afterLogout);
}
