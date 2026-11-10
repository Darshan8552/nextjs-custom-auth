import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function OtpInput({
  className,
  onChange,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      placeholder="••••••"
      className={cn(
        "h-12 text-center font-mono text-2xl tracking-[0.5em]",
        className,
      )}
      onChange={(e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
        onChange?.(e);
      }}
      {...props}
    />
  );
}
