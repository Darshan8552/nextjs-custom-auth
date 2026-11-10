import { cn } from "@/lib/utils";

export function PassMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 26 18"
      fill="none"
      aria-hidden="true"
      className={cn("h-4 w-[23px]", className)}
    >
      <rect
        x="1"
        y="1"
        width="24"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="15.5"
        y="4.75"
        width="4.5"
        height="3.25"
        rx="0.75"
        fill="var(--signal)"
      />
      <path
        d="M5 11.5h7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <PassMark />
      <span className="text-[15px] font-semibold tracking-[-0.025em]">
        Sallyport
      </span>
    </span>
  );
}
