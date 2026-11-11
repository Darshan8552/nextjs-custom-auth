# Auth module

A self-contained, copy-paste authentication module for Next.js App Router
projects. Email/password accounts, email verification with one-time codes,
password recovery, server-side sessions, and Postgres-backed rate limiting.

The server-side core lives in `src/lib/auth`. The app talks to it through these
entry points:

| Import | Use it for |
| --- | --- |
| `@/lib/auth` | Server code: session, guards, `AuthError`, config |
| `@/actions/auth` | Server actions imported by forms |
| `@/lib/validations/auth` | Zod schemas, input types, and common-password policy (client + server) |
| `@/lib/types` | Shared domain and result types (client + server) |
| `@/components/auth/*` | Optional forms, auth card, and user menu |
| `@/components/providers/session-provider` | Optional session context for protected UI |

## Requirements

- Next.js App Router (built against Next 16) and React 19
- PostgreSQL
- Prisma 7 (the module expects the `prisma-client` generator)
- `zod`, `bcryptjs`
- An email provider. Brevo is the default; see [Swapping providers](#swapping-providers).
- Optional UI: `react-hook-form`, `@hookform/resolvers`, `sonner`,
  `lucide-react`, and shadcn-style `button`, `input`, `label`, `field-error`,
  and `dropdown-menu` primitives.

## Install in another project

1. Copy `src/lib/auth`, `src/lib/validations/auth.ts`, `src/lib/email.ts`,
   `src/lib/env.ts`, `src/lib/types`, and `src/emails` into your project. Copy
   `src/actions/auth.ts` too, or create your own three-line actions. If you want
   the bundled forms, also copy `src/components/auth` and
   `src/components/providers`.

2. Add the models from [`prisma/schema.prisma`](../prisma/schema.prisma) to
   your schema (keep your own generator/datasource block):

   ```prisma
   model User {
     id            String    @id @default(cuid())
     email         String    @unique
     passwordHash  String
     emailVerified DateTime?
     createdAt     DateTime  @default(now())
     updatedAt     DateTime  @updatedAt

     sessions Session[]
     tokens   VerificationToken[]
   }

   model Session {
     id        String   @id @default(cuid())
     userId    String
     tokenHash String   @unique
     expiresAt DateTime
     createdAt DateTime @default(now())

     user User @relation(fields: [userId], references: [id], onDelete: Cascade)

     @@index([userId])
     @@index([expiresAt])
   }

   enum TokenType {
     EMAIL_OTP
     PASSWORD_RESET
   }

   model VerificationToken {
     id        String    @id @default(cuid())
     userId    String
     tokenHash String
     type      TokenType
     expiresAt DateTime
     attempts  Int       @default(0)
     createdAt DateTime  @default(now())

     user User @relation(fields: [userId], references: [id], onDelete: Cascade)

     @@index([userId, type, createdAt])
     @@index([tokenHash])
   }

   model RateLimit {
     key         String   @id
     count       Int
     windowStart DateTime
   }
   ```

3. Run the migration and generate the client:

   ```bash
   pnpm exec prisma migrate dev --name auth
   pnpm exec prisma generate
   ```

4. Point [`src/lib/prisma.ts`](../src/lib/prisma.ts) at your Prisma client. The
   auth core imports `prisma` directly from it.

5. Set the environment variables:

   ```bash
   DATABASE_URL="postgres://..."
   DATABASE_URL_UNPOOLED="postgres://..."   # used by prisma7.config.ts
   APP_URL="http://localhost:3000"          # no trailing slash
   SESSION_SECRET="replace-with-a-long-random-secret"
   EMAIL_FROM="Sallyport <auth@example.com>"
   BREVO_API_KEY="..."
   # TRUSTED_IP_HEADER="cf-connecting-ip"
   ```

   `APP_URL` must use `https://` when `NODE_ENV=production`, so reset links are
   never sent over an insecure origin. `TRUSTED_IP_HEADER` is optional but
   recommended in production: set it to the header your proxy overwrites with
   the real client address (for example `cf-connecting-ip` on Cloudflare or
   `x-vercel-forwarded-for` on Vercel).

   The schema for these lives in [`src/lib/env.ts`](../src/lib/env.ts). Rename or
   remove variables there if your project differs.

6. Mount the routes. The pages are app-owned (they use your layout and
   metadata); the forms come from `@/components/auth`. Minimal example:

   ```tsx
   // src/app/(auth)/login/page.tsx
   import { AuthCard } from "@/components/auth/auth-card";
   import { LoginForm } from "@/components/auth/login-form";

   export default function LoginPage() {
     return (
       <AuthCard kind="access" title="Welcome back">
         <LoginForm />
       </AuthCard>
     );
   }
   ```

   The routes currently expected are `/login`, `/signup`, `/verify`,
   `/forgot-password`, and `/reset-password`. If you change them, update
   [`src/lib/auth/config.ts`](../src/lib/auth/config.ts) and the page files
   together.

7. Protect app routes. Wrap a layout in `requireUser()` and pass the user to
   `SessionProvider`:

   ```tsx
   import { requireUser } from "@/lib/auth";
   import { SessionProvider } from "@/components/providers/session-provider";

   export default async function ProtectedLayout({ children }) {
     const user = await requireUser();
     return <SessionProvider user={user}>{children}</SessionProvider>;
   }
   ```

8. Add the proxy to your app's `src/proxy.ts` (Next 16; use `src/middleware.ts`
   for older versions). It is app-owned wiring, not part of this folder, and
   Next.js requires the matcher `config` to be a literal:

   ```ts
   import type { NextRequest } from "next/server";
   import { NextResponse } from "next/server";
   import { authConfig, sessionCookieOptions } from "@/lib/auth/config";

   export function proxy(request: NextRequest) {
     const { pathname } = request.nextUrl;
     const token = request.cookies.get(authConfig.session.cookieName)?.value;

     const isProtected = authConfig.protectedPaths.some(
       (p) => pathname === p || pathname.startsWith(`${p}/`),
     );
     if (!token && isProtected) {
       return NextResponse.redirect(
         new URL(authConfig.routes.login, request.url),
       );
     }

     const response = NextResponse.next();
     const isServerAction = request.headers.has("next-action");
     if (token && !isServerAction) {
       response.cookies.set(
         authConfig.session.cookieName,
         token,
         sessionCookieOptions(),
       );
     }
     return response;
   }

   export const config = {
     matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
   };
   ```

   If your app needs other middleware logic, add it to `proxy` and keep the
   matcher as-is.

## How it works

```
Browser form
  → @/actions/auth          (thin "use server" boundary)
  → runAction               (zod validation + typed errors)
  → lib/auth/service.ts     (the flow)
  → prisma / email / session (replaceable seams)
```

- **`src/lib/auth/config.ts`** — routes, cookie, token lifetimes, rate limits,
  password rules, protected paths. Tune the module here.
- **`src/lib/auth/service.ts`** — every flow in one file: sign up, log in,
  verify, resend, forgot, reset, change password, log out.
- **`src/actions/auth.ts`** — the only server actions forms call. Each one is
  three lines because validation and error mapping are centralized.
- **`src/lib/auth/result.ts`** — `runAction` turns `AuthError`s into
  `{ success: false, code, message, fieldErrors?, retryAfter? }` and logs
  unexpected failures.
- **`src/lib/auth/session.ts`** — creates, reads, refreshes, and deletes
  sessions. The cookie stores a random token; the database stores its
  HMAC-SHA256 hash.
- **`src/lib/auth/guards.ts`** — `requireUser()` for protected pages,
  `redirectIfAuthenticated()` for auth pages.
- **`src/lib/auth/rate-limit.ts`** — atomic fixed-window limiter using a single
  `INSERT ... ON CONFLICT` query. **Postgres-specific.**
- **`src/lib/validations/auth.ts`** — shared client/server validation,
  including the common-password blocklist.
- **`src/emails/`** — OTP, reset, and welcome templates plus the shared layout.
- **`src/lib/types`** — shared `SessionUser`, `ActionResult`, `AuthErrorCode`,
  and `EmailContent` definitions. No runtime code.

The optional UI lives in `src/components/auth`, and the session provider in
`src/components/providers/session-provider.tsx`.

## Behavior reference

| Flow | Rule |
| --- | --- |
| Sign up | 10 attempts/hour/IP; email only, password is chosen at verification |
| Log in | 5 attempts/60 seconds/IP, plus 20 failed credentials/hour/account |
| Forgot password | 3 attempts/hour/email, 10 attempts/hour/IP |
| Change password | 5 attempts/15 minutes/user; rotates every session |
| OTP | 6 digits, 10-minute expiry, 5 attempts, 60-second resend cooldown, max 5/hour |
| Reset link | Single use, 1-hour expiry; success revokes every session |
| Session | 30-day HttpOnly, SameSite=Lax cookie; Secure in production; refreshed after 24h |
| Password storage | bcrypt, cost 12, 8–72 bytes |
| Unverified login | Issues a fresh OTP and returns `VERIFY_REQUIRED` |
| Forgot password response | Always the same generic message |
| Protected routes | Proxy checks cookie presence; `requireUser` validates the session |

Sign-up deliberately does not accept a password. The account is created in a
pending state with an unusable random hash, and the password entered alongside
the emailed code is committed only when the address is proven. This closes the
pre-hijacking window where an unverified account's password could otherwise be
overwritten by whoever signed up last.

The per-account login limit only counts failed credentials, so a legitimate user
with the correct password is never locked out by an attacker.

All values above come from [`src/lib/auth/config.ts`](../src/lib/auth/config.ts).
Changing them there updates both the service and the UI hints (password
checklist, resend cooldown).

## Customization

### Routes and limits

Edit [`src/lib/auth/config.ts`](../src/lib/auth/config.ts). The form components
read redirect targets and hints from it, so you usually do not need to touch the
UI.

### Swapping providers

- **Database**: edit [`src/lib/prisma.ts`](../src/lib/prisma.ts). It exports
  `prisma`; every query in the auth core goes through it.
- **Email**: edit [`src/lib/email.ts`](../src/lib/email.ts) and keep the
  `sendEmail(to, { subject, html, text })` signature. Remove Brevo from
  `package.json` and delete `BREVO_API_KEY` from `src/lib/env.ts` if you switch.
- **Rate limit store**: replace
  [`src/lib/auth/rate-limit.ts`](../src/lib/auth/rate-limit.ts) if you are not
  on Postgres. Keep `enforceRateLimit(key, limit, windowSeconds)` and
  `getClientIp()`. Expired rows are removed at most once an hour per server
  instance; a scheduled `DELETE` works too.
- **Emails**: edit [`src/emails/`](../src/emails) — the templates are branded
  for Sallyport.
- **UI branding**: [`src/components/auth/auth-card.tsx`](../src/components/auth/auth-card.tsx)
  is the one app-specific piece (wordmark, pass styling). Forms use
  `@/components/ui/*` primitives and `@/lib/utils`; point those imports at your
  design system.

### Extending the module

Add a flow in `src/lib/auth/service.ts`, add its schema to
`src/lib/validations/auth.ts`, then export a three-line action from
`src/actions/auth.ts`. Do not call the database directly from forms or pages;
keep server logic in the service.

## Security notes

- Session and reset tokens are stored as HMAC-SHA256 hashes keyed by
  `SESSION_SECRET`. Rotating the secret invalidates every session and token.
- OTPs are stored as hashes scoped to the user id, never in plain text.
- Login uses a dummy bcrypt comparison for missing accounts so timing does not
  reveal whether an email exists.
- Forgot-password always returns the same response, whether or not the account
  exists.
- Per-IP limits read `TRUSTED_IP_HEADER` when configured, otherwise fall back to
  `x-real-ip` and the right-most `x-forwarded-for` entry. Set the variable in
  production; the left-most forwarded entry is client-controlled.
- OTP cooldown and hourly caps are enforced with the same atomic
  `INSERT ... ON CONFLICT` limiter, so parallel requests cannot bypass them.
- Logout always clears the session cookie, even if database revocation fails.
- Password changes and resets delete every session; change-password then creates
  a fresh session for the current device and deletes outstanding reset links.
- `next.config.ts` sets CSP, HSTS (production), `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and
  disables `X-Powered-By`.
- The proxy is a fast cookie-presence check, not authorization. Pages must call
  `requireUser()`.
