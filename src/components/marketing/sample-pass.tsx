import { PassMark } from "@/components/brand/wordmark";

const SAMPLE_CODE = ["4", "8", "1", "2", "0", "6"];

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
        className={
          mono
            ? "mt-1 font-mono text-[11px] tracking-[0.04em] text-foreground uppercase"
            : "mt-1 text-[12px] whitespace-nowrap text-foreground uppercase"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export function SamplePass() {
  return (
    <figure className="m-0 rounded-[5px] border border-border bg-card">
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
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Holder
            </p>
            <p className="mt-2 text-[20px] leading-[1.2] font-semibold tracking-[-0.03em] break-words sm:text-[22px]">
              holder@example.com
            </p>
          </div>
          <span className="mt-0.5 hidden shrink-0 border border-signal/35 px-2 py-1 font-mono text-[8px] font-medium tracking-[0.14em] text-signal uppercase sm:inline-block">
            Specimen
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] text-signal uppercase">
            <span aria-hidden="true" className="size-1.5 bg-signal" />
            Awaiting verification
          </span>
          <span
            aria-hidden="true"
            className="hidden h-3 w-px bg-border sm:block"
          />
          <span className="hidden font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase sm:block">
            Not yet active
          </span>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              One-time code
            </p>
            <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
              Expires in 10 min
            </p>
          </div>
          <div
            aria-hidden="true"
            className="mt-2 grid max-w-[21rem] grid-cols-6 gap-1.5"
          >
            {SAMPLE_CODE.map((digit) => (
              <span
                key={digit}
                className="flex h-11 items-center justify-center border border-border bg-background font-mono text-[18px] font-medium"
              >
                {digit}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] leading-4 text-muted-foreground">
            Entered after sign-up to activate the pass. Single use.
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
          <Detail label="Issued" value="On sign-up" />
          <Detail label="Pass ID" value="Pending" mono />
          <Detail label="Scope" value="Account" />
        </dl>

        <div className="mt-7 flex items-end justify-between gap-4">
          <div
            aria-hidden="true"
            className="h-7 w-28 opacity-75 sm:w-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--foreground) 0 1px, transparent 1px 3px, var(--foreground) 3px 5px, transparent 5px 6px, var(--foreground) 6px 9px, transparent 9px 12px)",
            }}
          />
          <span className="font-mono text-[8.5px] tracking-[0.16em] text-muted-foreground uppercase">
            Keep private
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
          Sample only
        </span>
      </div>
    </figure>
  );
}
