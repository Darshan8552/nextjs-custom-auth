# Sallyport

A custom authentication system built with Next.js, Prisma, and PostgreSQL.
Email/password accounts, six-digit email verification, password recovery, and
server-side sessions — with no identity provider.

The auth implementation lives in [`src/lib/auth`](./src/lib/auth), with server
actions in [`src/actions/auth.ts`](./src/actions/auth.ts) and validation in
[`src/lib/validations/auth.ts`](./src/lib/validations/auth.ts). See
[`docs/auth.md`](./docs/auth.md) for the architecture, the Prisma models,
environment variables, and instructions for reusing it in another project.

## Getting started

```bash
pnpm install
pnpm exec prisma migrate dev
pnpm dev
```

Create `.env` from `.env.example` and fill in the values before starting.

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev      # development server
pnpm build    # production build
pnpm start    # production server
pnpm lint     # Biome check
pnpm format   # Biome format
```

## Structure

```
src/
├── app/
│   ├── (auth)/          # login, signup, verify, recovery
│   ├── (protected)/     # dashboard and settings
│   └── page.tsx         # public landing page
├── actions/
│   └── auth.ts          # server actions
├── components/
│   ├── auth/            # auth forms and auth UI
│   ├── providers/       # session and theme providers
│   └── ...              # shared UI, marketing, account views
├── emails/              # transactional email templates
├── lib/
│   ├── auth/            # auth core: flows, session, guards, config
│   ├── types/           # shared type definitions
│   ├── validations/     # zod schemas and password policy
│   ├── email.ts         # email transport
│   ├── env.ts           # validated environment
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # class-name helper
└── proxy.ts             # auth proxy (cookie check + redirects)
```
