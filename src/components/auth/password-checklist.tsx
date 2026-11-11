"use client";

import { Check, Minus } from "lucide-react";
import { authConfig } from "@/lib/auth/config";
import { cn } from "@/lib/utils";
import { isCommonPassword } from "@/lib/validations/auth";

type PasswordChecklistProps = {
  password: string;
  confirm?: string;
};

export function PasswordChecklist({
  password,
  confirm,
}: PasswordChecklistProps) {
  const checks = [
    {
      label: `${authConfig.password.minLength} characters or more`,
      met: password.length >= authConfig.password.minLength,
    },
    {
      label: "Not a common password",
      met: password.length > 0 && !isCommonPassword(password),
    },
    ...(confirm === undefined
      ? []
      : [
          {
            label: "Passwords match",
            met: password.length > 0 && password === confirm,
          },
        ]),
  ];

  return (
    <ul aria-label="Password requirements" className="space-y-1.5 pt-0.5">
      {checks.map((check) => (
        <li
          key={check.label}
          className={cn(
            "flex items-center gap-1.5 font-mono text-[11px] leading-4",
            check.met ? "text-verified" : "text-muted-foreground",
          )}
        >
          {check.met ? (
            <Check aria-hidden="true" className="size-3" strokeWidth={2.5} />
          ) : (
            <Minus aria-hidden="true" className="size-3" strokeWidth={2} />
          )}
          <span>{check.label}</span>
          <span className="sr-only">{check.met ? " met" : " not met"}</span>
        </li>
      ))}
    </ul>
  );
}
