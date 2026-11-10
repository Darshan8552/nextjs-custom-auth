import { cn } from "cn";

export function FieldError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={cn("text-[12.5px] leading-4 text-destructive", className)}
    >
      {message}
    </p>
  );
}
