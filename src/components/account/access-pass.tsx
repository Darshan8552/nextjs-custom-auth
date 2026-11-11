import { PassMark } from "@/components/brand/wordmark";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function passId(id: string) {
  let hash = 2166136261;

  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
  return `${hex.slice(0, 4)}-${hex.slice(4)}`;
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-[12.5px] whitespace-nowrap text-foreground uppercase",
          mono && "font-mono text-[12px] tracking-[0.04em]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function AccessPass({ user }: { user: SessionUser }) {
  const serial = passId(user.id);

  return (
    <section
      aria-label="Access pass"
      className="rounded-[5px] border border-border bg-card"
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
          Access pass
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <p className="font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Holder
        </p>
        <p className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.03em] break-all sm:text-[24px]">
          {user.email}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] text-verified uppercase">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-verified"
            />
            Verified
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
            Active credential
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
          <Detail label="Issued" value={dateFormatter.format(user.createdAt)} />
          <Detail label="Pass ID" value={serial} mono />
          <Detail label="Scope" value="Account" />
        </dl>

        <div className="mt-7 flex items-end justify-between gap-4">
          <div
            aria-hidden="true"
            className="h-7 w-36 opacity-75"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--foreground) 0 1px, transparent 1px 3px, var(--foreground) 3px 5px, transparent 5px 6px, var(--foreground) 6px 9px, transparent 9px 12px)",
            }}
          />
          <span className="font-mono text-[8.5px] tracking-[0.16em] text-muted-foreground uppercase">
            Valid while active
          </span>
        </div>
      </div>

      <div className="relative flex items-center justify-between gap-3 rounded-b-[4px] border-t border-dashed border-border bg-background/60 px-4 py-3">
        <span
          aria-hidden="true"
          className="absolute -top-[6.5px] -left-[6.5px] size-3 rounded-full bg-background"
        />
        <span
          aria-hidden="true"
          className="absolute -top-[6.5px] -right-[6.5px] size-3 rounded-full bg-background"
        />
        <span className="font-mono text-[8.5px] tracking-[0.14em] text-muted-foreground uppercase">
          Sallyport access control
        </span>
        <span className="font-mono text-[8.5px] tracking-[0.14em] text-muted-foreground uppercase">
          Keep private
        </span>
      </div>
    </section>
  );
}
