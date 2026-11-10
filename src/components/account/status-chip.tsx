import { cn } from "@/lib/utils";

export function StatusChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-[2px] border border-verified/30 bg-verified/[0.06] px-2.5 font-mono text-[9px] font-medium tracking-[0.14em] text-verified uppercase",
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-verified" />
      {label}
    </span>
  );
}
