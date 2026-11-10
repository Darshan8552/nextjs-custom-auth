import type { ReactNode } from "react";

type AccountMastheadProps = {
  eyebrow: ReactNode;
  title: string;
  description: string;
  aside?: ReactNode;
};

export function AccountMasthead({
  eyebrow,
  title,
  description,
  aside,
}: AccountMastheadProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase sm:text-[10px]">
          <span aria-hidden="true" className="size-1.5 shrink-0 bg-signal" />
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[32px] leading-[1.04] font-semibold tracking-[-0.035em] text-balance sm:text-[38px]">
          {title}
        </h1>
        <p className="mt-2.5 max-w-lg text-[13.5px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}
