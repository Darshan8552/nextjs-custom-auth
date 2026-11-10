import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/toggle-mode";
import { SamplePass } from "./sample-pass";

const HERO_FACTS = [
  "Email verification",
  "One-time codes",
  "Server-side sessions",
] as const;

const GATES = [
  {
    index: "Gate 01",
    title: "Issue",
    copy: "Create an account with an email address and a password. Password rules are checked before the account is created.",
    stamp: "Issued",
    tone: "signal",
  },
  {
    index: "Gate 02",
    title: "Verify",
    copy: "A six-digit code confirms the address. It expires in ten minutes, allows five attempts, and can be resent once a minute.",
    stamp: "Checked",
    tone: "ink",
  },
  {
    index: "Gate 03",
    title: "Enter",
    copy: "The session is stored on the server and sent as an HTTP-only cookie. Changing the password closes every other session.",
    stamp: "Open",
    tone: "verified",
  },
] as const;

const CONTROLS = [
  {
    control: "Email verification",
    method: "Six-digit code, 10-minute expiry",
    status: "Required",
  },
  {
    control: "Password storage",
    method: "bcrypt hash, 72-byte limit",
    status: "Hashed",
  },
  {
    control: "Session token",
    method: "Server-side record, HTTP-only cookie",
    status: "Enforced",
  },
  {
    control: "Password recovery",
    method: "Single-use link, 1-hour expiry",
    status: "Timed",
  },
  {
    control: "Sign-in attempts",
    method: "Rate-limited by key",
    status: "Limited",
  },
  {
    control: "Identity",
    method: "Local accounts only",
    status: "Local",
  },
] as const;

const TONE_CLASS = {
  signal: "bg-signal",
  ink: "border border-foreground/45",
  verified: "bg-verified",
} as const;

export function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <GateSequence />
        <SecurityManifest />
        <AccessRequest />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          aria-label="Sallyport home"
          className="rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <Wordmark />
        </Link>

        <nav
          aria-label="Page sections"
          className="hidden items-center gap-7 md:flex"
        >
          <a
            href="#sequence"
            className="rounded-[2px] text-[12.5px] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:outline-none"
          >
            How it works
          </a>
          <a
            href="#security"
            className="rounded-[2px] text-[12.5px] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:outline-none"
          >
            Security
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="hidden items-center gap-2 pr-1 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase lg:flex">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full border border-muted-foreground/70"
            />
            Public access
          </span>
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/login" />}
            nativeButton={false}
          >
            Sign in
          </Button>
          <Button
            size="sm"
            render={<Link href="/signup" />}
            nativeButton={false}
          >
            Create account
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            <span aria-hidden="true" className="size-1.5 bg-signal" />
            Custom authentication
          </p>

          <h1 className="mt-6 text-[clamp(2.3rem,6.5vw,4.5rem)] leading-[0.94] font-semibold tracking-[-0.05em] text-balance">
            Built like a gate.
            <br />
            Issued like a pass.
          </h1>

          <p className="mt-6 max-w-[46ch] text-[15px] leading-6 text-muted-foreground">
            Sallyport is a self-contained authentication system. Create an
            account, verify your email with a one-time code, and sign in with a
            session that stays on the server.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              render={<Link href="/signup" />}
              nativeButton={false}
            >
              Create your pass
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/login" />}
              nativeButton={false}
            >
              Sign in
            </Button>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-border pt-4">
            {HERO_FACTS.map((fact) => (
              <li
                key={fact}
                className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase"
              >
                <span
                  aria-hidden="true"
                  className="size-1 shrink-0 bg-verified"
                />
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-2">
            <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
              Specimen / Access pass
            </span>
            <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
              Rev 01
            </span>
          </div>
          <div className="mt-4">
            <SamplePass />
          </div>
          <p className="mt-3 text-[11px] leading-4 text-muted-foreground">
            Issued on sign-up. Activated only after the email address is
            verified.
          </p>
        </div>
      </div>
    </section>
  );
}

function GateSequence() {
  return (
    <section
      id="sequence"
      aria-labelledby="sequence-heading"
      className="border-b border-border bg-card"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              <span aria-hidden="true" className="size-1.5 bg-signal" />
              Gate sequence
            </p>
            <h2
              id="sequence-heading"
              className="mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
            >
              Three checks before entry.
            </h2>
          </div>
          <p className="max-w-xl text-[13.5px] leading-5 text-muted-foreground lg:justify-self-end">
            A pass only matters if the gate checks it. Each step below is
            enforced on the server, not hidden in the interface.
          </p>
        </div>

        <ol className="mt-10 border-t border-border">
          {GATES.map((gate) => (
            <li
              key={gate.index}
              className="grid gap-2.5 border-b border-border py-6 sm:grid-cols-[5rem_minmax(0,7.5rem)_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6 sm:py-7"
            >
              <span className="font-mono text-[9.5px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {gate.index}
              </span>
              <h3 className="text-[18px] font-semibold tracking-[-0.025em]">
                {gate.title}
              </h3>
              <p className="max-w-lg text-[13px] leading-5 text-muted-foreground">
                {gate.copy}
              </p>
              <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase sm:justify-self-end">
                <span
                  aria-hidden="true"
                  className={`size-1.5 shrink-0 ${
                    gate.tone === "ink" ? TONE_CLASS.ink : TONE_CLASS[gate.tone]
                  }`}
                />
                {gate.stamp}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SecurityManifest() {
  return (
    <section
      id="security"
      aria-labelledby="security-heading"
      className="border-b border-border"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:py-16 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-16">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            <span aria-hidden="true" className="size-1.5 bg-signal" />
            Security manifest
          </p>
          <h2
            id="security-heading"
            className="mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
          >
            What stands behind the gate.
          </h2>
          <p className="mt-4 max-w-md text-[13.5px] leading-5 text-muted-foreground">
            Every control is part of the application. Passwords are hashed,
            sessions live on the server, and verification codes are single use.
          </p>

          <div className="mt-7 border-l-2 border-signal pl-4">
            <p className="font-mono text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              No identity provider
            </p>
            <p className="mt-1.5 max-w-sm text-[12.5px] leading-5 text-muted-foreground">
              Accounts are local to Sallyport. Nothing is delegated to a
              third-party login.
            </p>
          </div>
        </div>

        <div>
          <div className="hidden grid-cols-[1.05fr_1.5fr_auto] gap-4 border-b border-border pb-2 font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase sm:grid">
            <span>Control</span>
            <span>Method</span>
            <span className="text-right">Status</span>
          </div>
          <ul className="divide-y divide-border border-t border-border sm:border-t-0">
            {CONTROLS.map((row) => (
              <li
                key={row.control}
                className="grid gap-1.5 py-3.5 sm:grid-cols-[1.05fr_1.5fr_auto] sm:items-center sm:gap-4"
              >
                <p className="text-[13px] font-medium">{row.control}</p>
                <p className="text-[12px] leading-4 text-muted-foreground">
                  {row.method}
                </p>
                <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] text-verified uppercase sm:justify-self-end">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-verified"
                  />
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AccessRequest() {
  return (
    <section className="bg-band text-band-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.16em] text-band-foreground/55 uppercase">
            <span aria-hidden="true" className="size-1.5 bg-signal" />
            Access request
          </p>
          <h2 className="mt-4 text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance">
            Request your access pass.
          </h2>
          <p className="mt-3 max-w-xl text-[13.5px] leading-5 text-band-foreground/65">
            Create an account, verify your email, and the pass is active. It
            takes about a minute.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            className="bg-band-foreground text-band hover:bg-band-foreground/90"
            render={<Link href="/signup" />}
            nativeButton={false}
          >
            Create account
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-band-foreground/25 text-band-foreground hover:bg-band-foreground/10 hover:text-band-foreground"
            render={<Link href="/login" />}
            nativeButton={false}
          >
            Sign in
          </Button>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Wordmark />
          <span aria-hidden="true" className="h-4 w-px bg-border" />
          <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
            Access control
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
          <Link
            href="/login"
            className="rounded-[2px] transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:outline-none"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-[2px] transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:outline-none"
          >
            Create account
          </Link>
          <span className="font-mono text-[9px] tracking-[0.14em] uppercase">
            Keep private
          </span>
        </div>
      </div>
    </footer>
  );
}
