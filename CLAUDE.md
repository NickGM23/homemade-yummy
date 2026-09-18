# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # start dev server (localhost:3000)
npm run build           # next build
npm run start            # start production server (after build)
npm run lint              # next lint (see ESLint gotcha below — this does not gate the build)
npm run format            # prettier --write . (see Prettier gotcha below — config is not actually picked up)
npm run prisma:push      # prisma db push — applies prisma/schema.prisma to the DB (no migrations/ dir exists)
npm run prisma:studio   # prisma studio
npx prisma generate      # regenerate the Prisma client after editing schema.prisma
npx tsc --noEmit          # typecheck (no dedicated npm script exists)
```

There is no test runner configured in this repository (no `test` script, no Jest/Vitest/Playwright config, no test files).

Vercel's build command (`.vercel/project.json`) is `npx prisma generate && next build` — a plain local `npm run build` does **not** regenerate the Prisma client, so run `npx prisma generate` manually after schema changes before building locally.

## Architecture

Next.js 15 App Router + React 19 + TypeScript (strict), Prisma 6 (PostgreSQL/Neon), NextAuth v4 (JWT), Zustand, Zod + react-hook-form, Tailwind + shadcn/ui ("new-york" style, see `components.json`). Path alias `@/*` maps to the repo root (`tsconfig.json`).

### Route structure

Three App Router route groups under `app/`, each with its own `layout.tsx`/header: `(home)`, `(site)` (profile, orders, product detail, not-auth), `(checkout)`. API route handlers live under `app/api/**/route.ts`.

### Two parallel data-access paths

- **Server Components** query Prisma directly via the singleton exported from `libs/prisma.ts`.
- **Client Components** go through `services/*.ts` — a thin axios wrapper (`services/instance.ts`) aggregated into a single `Api` object in `services/api-client.ts` — which calls the `app/api/**` route handlers.
- `libs/orderHelpers.ts`'s `fetchPaginatedOrders` is shared between the server-side branch of `services/orders.ts` (`typeof window === 'undefined'`) and `app/api/orders/search/route.ts`, so order-search logic lives in one place even though it's reached two different ways.

### Auth

NextAuth v4 is configured in `shared/constants/auth-options.ts` (JWT strategy, Credentials + GitHub + Google providers, bcrypt password hashing) — the route handler at `app/api/auth/[...nextauth]/route.ts` just imports it. `components/shared/lib/get-user-session.ts` wraps `getServerSession(authOptions)` for use in Server Components and route handlers. There is no `middleware.ts`; authorization is instead checked per-route/per-page. Admin-only API routes call `libs/requireAdmin.ts`, which throws `'UNAUTHORIZED'`/`'FORBIDDEN'` — callers catch it and map to a 401/403 response themselves (this try/catch is duplicated in each protected route rather than centralized).

### Validation

Zod schemas are colocated near their forms (e.g. `components/constants/checkout-form-schema.ts`, `components/shared/modals/auth-modal/forms/schemas.ts`) and wired to `react-hook-form` through a custom `hooks/useZodForm.ts` wrapper plus `@hookform/resolvers/zod`. Validation currently runs client-side only; Server Actions (`app/actions.ts`) and API routes do not re-run these schemas.

### State

Zustand only, two small stores under `store/`: `cart-store.ts` (persisted to `localStorage`, holds just `{productId, quantity}[]`, not full product data) and `category.ts` (UI-only active-category id for nav highlighting). Full product details for cart items are re-fetched from the server via `hooks/useCartProducts.ts`.

### API route error handling

Every handler in `app/api/**/route.ts` is wrapped via `libs/withErrorHandling.ts`, which takes a map of method handlers (e.g. `{ GET, POST }`) and catches unhandled exceptions into a generic 500 response.

### Prisma schema

`prisma/schema.prisma` defines `User`, `ProductGroup`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`. Schema changes are applied via `prisma db push` — there is no `prisma/migrations/` directory, so there's no migration history to consult or extend.

### Folder-naming gotcha: five similarly-named "shared" locations

Know which one you need before adding a helper — these are not interchangeable:
- `lib/` — just the shadcn-generated `cn()` helper, imported everywhere as `@/lib/utils`.
- `libs/` (plural, unrelated to `lib/`) — server-only infrastructure: the Prisma client singleton, Firebase init, `withErrorHandling`, `requireAdmin`, `orderHelpers`.
- `shared/` (repo root) — a handful of constants modules (`auth-options.ts`, `order-status.ts`, `units.ts`).
- `components/shared/` — UI feature components (checkout, orders, modals, product-details, form primitives, etc.), unrelated in purpose to root `shared/`.
- `components/shared/lib/` — holds `get-user-session.ts` and `send-email.ts` plus a near-duplicate copy of `lib/utils.ts`'s `cn()` (the duplicate is not the one actually imported elsewhere).

## Known gotchas

- **ESLint does not gate anything.** `next.config.mjs` sets `eslint.ignoreDuringBuilds: true`. Three ESLint config files exist (`.eslintrc.json`, `eslint.config.js`, `eslint.config.mjs`); only `.eslintrc.json` is actually read, since the project pins ESLint 8 and flat config requires `ESLINT_USE_FLAT_CONFIG=true`, which is not set anywhere. `.eslintrc.json` also disables `no-unused-vars`.
- **Prettier config is not applied.** `prettierrc.json` is missing its leading dot (should be `.prettierrc.json`), so `npm run format` runs on Prettier's defaults rather than the configured `singleQuote`/`printWidth`/`prettier-plugin-tailwindcss` settings.
- **`libs/prisma.ts` does not use the `globalThis` dev-hot-reload cache pattern** — expect a fresh `PrismaClient`/connection pool on every dev-server hot reload rather than a reused singleton.
- Installed Prisma is `6.6.0` (`^6.6.0` in `package.json`). The Prisma VS Code extension may surface Prisma-7-era warnings (e.g. about `datasource.url` being unsupported) that don't apply to the version actually installed here.
