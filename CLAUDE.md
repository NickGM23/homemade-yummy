# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                    # start dev server (localhost:3000)
npm run build                  # next build (ESLint + TS errors now fail the build, see below)
npm run start                  # start production server (after build)
npm run lint                   # next lint
npm run format                 # prettier --write . (config is .prettierrc.json, actually picked up)
npm run prisma:migrate         # prisma migrate dev — generates + applies a new migration against the local DATABASE_URL (localhost dev DB)
npm run prisma:migrate:deploy  # prisma migrate deploy — applies pending migrations to whatever DATABASE_URL is set (used against the prod Neon DB; not run automatically by Vercel — see below)
npm run prisma:studio          # prisma studio
npx prisma generate            # regenerate the Prisma client after editing schema.prisma
npx tsc --noEmit               # typecheck (no dedicated npm script exists)
```

There is no test runner configured in this repository (no `test` script, no Jest/Vitest/Playwright config, no test files).

Vercel's build command (`.vercel/project.json`) is `npx prisma generate && next build` — a plain local `npm run build` does **not** regenerate the Prisma client, so run `npx prisma generate` manually after schema changes before building locally. **This build command does not run `prisma migrate deploy`** — after merging a schema change, `npm run prisma:migrate:deploy` must be run manually against the prod `DATABASE_URL` (no `vercel.json` exists to wire this into the deploy pipeline).

## Architecture

Next.js 15 App Router + React 19 + TypeScript (strict), Prisma 6 (PostgreSQL/Neon), NextAuth v4 (JWT), Zustand, Zod + react-hook-form, Tailwind + shadcn/ui ("new-york" style, see `components.json`). Path alias `@/*` maps to the repo root (`tsconfig.json`).

### Route structure

Three App Router route groups under `app/`, each with its own `layout.tsx`/header: `(home)`, `(site)` (profile, orders, product detail, not-auth), `(checkout)`. API route handlers live under `app/api/**/route.ts`.

### Two parallel data-access paths

- **Server Components** query Prisma directly via the singleton exported from `libs/prisma.ts`.
- **Client Components** go through `services/*.ts` — a thin axios wrapper (`services/instance.ts`) aggregated into a single `Api` object in `services/api-client.ts` — which calls the `app/api/**` route handlers.
- `libs/orderHelpers.ts`'s `fetchPaginatedOrders` is shared between the server-side branch of `services/orders.ts` (`typeof window === 'undefined'`) and `app/api/orders/search/route.ts`, so order-search logic lives in one place even though it's reached two different ways.

### Auth

NextAuth v4 is configured in `shared/constants/auth-options.ts` (JWT strategy, Credentials + GitHub + Google providers, bcrypt password hashing) — the route handler at `app/api/auth/[...nextauth]/route.ts` just imports it. `components/shared/lib/get-user-session.ts` wraps `getServerSession(authOptions)` for use in Server Components and route handlers. `middleware.ts` (repo root) centralizes admin-gating for `/orders/**` and `/api/orders/**` — everything under those paths requires `token.role === 'admin'` (read via `next-auth/jwt`'s `getToken()`, Edge-safe) except the single carve-out `POST /api/orders` (public order creation); any new route added under these paths is protected by default. `libs/requireAdmin.ts` (Prisma-backed, re-checks `User.isAdmin` fresh from the DB) is still called inside the admin API route handlers and `app/(site)/orders/page.tsx` as a second line of defense against the JWT staleness window (the token's `role` claim only refreshes when a session is re-read, not the instant DB access is revoked) — don't remove these when touching that code, they're intentionally redundant with the middleware.

### Validation

Zod schemas are colocated near their forms (e.g. `components/constants/checkout-form-schema.ts`, `components/shared/modals/auth-modal/forms/schemas.ts`) and wired to `react-hook-form` through a custom `hooks/useZodForm.ts` wrapper plus `@hookform/resolvers/zod`. Server-side, `libs/validation/{order,product,user}.ts` holds separate Zod schemas (not reused from the client ones, which have client-only transform/UX semantics) for the mutating API routes and `app/actions.ts`'s `updateUserInfo`; `libs/withErrorHandling.ts` catches `ZodError` centrally and maps it to a 400 with `error.flatten().fieldErrors`, so route handlers just call `schema.parse(body)`.

### State

Zustand only, two small stores under `store/`: `cart-store.ts` (persisted to `localStorage`, holds just `{productId, quantity}[]`, not full product data) and `category.ts` (UI-only active-category id for nav highlighting). Full product details for cart items are re-fetched from the server via `hooks/useCartProducts.ts`.

### API route error handling

Every handler in `app/api/**/route.ts` is wrapped via `libs/withErrorHandling.ts`, which takes a map of method handlers (e.g. `{ GET, POST }`) and catches unhandled exceptions into a generic 500 response.

### Prisma schema

`prisma/schema.prisma` defines `User`, `ProductGroup`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`. Schema changes go through `prisma/migrations/` (baselined from the pre-migrate `db push` state as `0_init`) — run `npm run prisma:migrate` locally to generate+apply a new migration, then `npm run prisma:migrate:deploy` against the prod `DATABASE_URL` to apply it there (see Commands above; this is a manual step, not wired into the Vercel build).

### Folder-naming gotcha: five similarly-named "shared" locations

Know which one you need before adding a helper — these are not interchangeable:
- `lib/` — just the shadcn-generated `cn()` helper, imported everywhere as `@/lib/utils`.
- `libs/` (plural, unrelated to `lib/`) — server-only infrastructure: the Prisma client singleton, Firebase init, `withErrorHandling`, `requireAdmin`, `orderHelpers`.
- `shared/` (repo root) — a handful of constants modules (`auth-options.ts`, `order-status.ts`, `units.ts`).
- `components/shared/` — UI feature components (checkout, orders, modals, product-details, form primitives, etc.), unrelated in purpose to root `shared/`.
- `components/shared/lib/` — holds `get-user-session.ts` and `send-email.ts` plus a near-duplicate copy of `lib/utils.ts`'s `cn()` (the duplicate is not the one actually imported elsewhere).

## Known gotchas

- **`.eslintrc.json` is the only ESLint config** (the legacy format; flat config would need `ESLINT_USE_FLAT_CONFIG=true`, not set). `no-unused-vars` is enforced (`@typescript-eslint/no-unused-vars` with `argsIgnorePattern`/`varsIgnorePattern: '^_'` for intentionally-unused params), `react/prop-types` is off (redundant with TS-typed props). `next.config.mjs` no longer sets `eslint.ignoreDuringBuilds`, so ESLint errors fail `next build`; `<img>`/a11y/`exhaustive-deps` rules are left as warnings (non-blocking) pending the `next/image` migration.
- Installed Prisma is `6.6.0` (`^6.6.0` in `package.json`). The Prisma VS Code extension may surface Prisma-7-era warnings (e.g. about `datasource.url` being unsupported) that don't apply to the version actually installed here.
- `middleware.ts`'s admin gate relies on the JWT `role` claim (`next-auth/jwt`'s `getToken()`), which is only as fresh as the last time a session was actually read — see the Auth section above for why `requireAdmin()`'s DB check is kept as a second line of defense rather than removed.
