import type { ReactNode } from "react";
import { PassMark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

const KIND_LABEL = {
  access: "Access pass",
  issue: "New issue",
  verification: "Verification",
  recovery: "Recovery",
} as const;

type AuthCardProps = {
  kind: keyof typeof KIND_LABEL;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthCard({
  kind,
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <section
      className={cn(
        "rounded-[5px] border border-border bg-card text-card-foreground",
        className,
      )}
    >
      <div className="flex h-11 items-center justify-between rounded-t-[4px] bg-band px-4 text-band-foreground">
        <span className="flex items-center gap-2">
          <PassMark className="h-[14px] w-5" />
          <span className="text-[13px] font-semibold tracking-[-0.015em]">
            Sallyport
          </span>
        </span>
        <span className="flex items-center gap-[7px] font-mono text-[10px] font-medium tracking-[0.16em] text-band-foreground/60 uppercase">
          <span aria-hidden="true" className="size-1.5 bg-signal" />
          {KIND_LABEL[kind]}
        </span>
      </div>

      <div className="px-5 pt-5 pb-6 sm:px-6 sm:pt-6">
        <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.03em] text-balance">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-[13.5px] leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className={description ? "mt-6" : "mt-5"}>{children}</div>
      </div>

      {footer ? (
        <div className="relative rounded-b-[4px] border-t border-dashed border-border bg-background/60 px-5 py-3.5 text-center text-[13px] text-muted-foreground">
          <span
            aria-hidden="true"
            className="absolute -top-[6.5px] -left-[6.5px] size-3 rounded-full bg-background"
          />
          <span
            aria-hidden="true"
            className="absolute -top-[6.5px] -right-[6.5px] size-3 rounded-full bg-background"
          />
          {footer}
        </div>
      ) : null}
    </section>
  );
}
