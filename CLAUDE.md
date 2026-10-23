# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                    # start dev server (localhost:3000)
npm run build                  # next build (ESLint + TS errors now fail the build, see below)
npm run start                  # start production server (after build)
npm run lint                   # next lint
npm run format                 # prettier --write . (config is .prettierrc.json, actually picked up)
npm test                       # vitest run
npm run prisma:migrate         # prisma migrate dev — generates + applies a new migration against the local DATABASE_URL (localhost dev DB)
npm run prisma:migrate:deploy  # prisma migrate deploy — applies pending migrations to whatever DATABASE_URL is set (used against the prod Neon DB; not run automatically by Vercel — see below)
npm run prisma:studio          # prisma studio
npx prisma generate            # regenerate the Prisma client after editing schema.prisma
npx tsc --noEmit               # typecheck (no dedicated npm script exists)
```

Tests use Vitest (`vitest.config.mts`, `environment: 'node'`, `@` alias matching `tsconfig.json`), colocated as `*.test.ts` next to the code they cover (e.g. `app/actions.test.ts`, `app/api/orders/route.test.ts`, `server/validation/order.test.ts`). Coverage is intentionally partial — Server Actions and the mutating/admin-gated API routes under `app/api/orders/**` and `app/api/products/by-ids/**`, plus the `server/validation/*` Zod schemas that gate them — not a full suite. Prisma and `getUserSession` are mocked per-file with `vi.mock('@/server/prisma', ...)`/`vi.mock('@/server/get-user-session', ...)`, not a shared test-db or `vitest-mock-extended`. No React component/UI tests and no e2e (Playwright) yet.

Vercel's build command is overridden by root `vercel.json` to `npx prisma generate && npx prisma migrate deploy && next build` (this takes precedence over the dashboard-configured command cached locally in `.vercel/project.json`, which is gitignored/local-only and not what actually runs on deploy) — every deploy applies any pending migrations to prod before building, so a schema change only needs its migration file committed (via `npm run prisma:migrate` locally) to reach prod automatically. `migrate deploy` is idempotent (a no-op if there's nothing pending), so this is safe to run on every build including preview deployments. A plain local `npm run build` does **not** regenerate the Prisma client or run migrations, so run `npx prisma generate` manually after schema changes before building locally.

## Architecture

Next.js 15 App Router + React 19 + TypeScript (strict), Prisma 6 (PostgreSQL/Neon), NextAuth v4 (JWT), Zustand, Zod + react-hook-form, Tailwind + shadcn/ui ("new-york" style, see `components.json`). Path alias `@/*` maps to the repo root (`tsconfig.json`).

### Route structure

Three App Router route groups under `app/`, each with its own `layout.tsx`/header: `(home)`, `(site)` (profile, orders, product detail, not-auth), `(checkout)`. API route handlers live under `app/api/**/route.ts`.

### Two parallel data-access paths

- **Server Components** query Prisma directly via the singleton exported from `server/prisma.ts`.
- **Client Components** go through `services/*.ts` — a thin axios wrapper (`services/instance.ts`) aggregated into a single `Api` object in `services/api-client.ts` — which calls the `app/api/**` route handlers.
- `server/orderHelpers.ts`'s `fetchPaginatedOrders` is shared between the server-side branch of `services/orders.ts` (`typeof window === 'undefined'`) and `app/api/orders/search/route.ts`, so order-search logic lives in one place even though it's reached two different ways.

### Auth

NextAuth v4 is configured in `config/auth-options.ts` (JWT strategy, Credentials + GitHub + Google providers, bcrypt password hashing). Password login is phone-only: the Credentials provider takes `phone` (any notation, normalized via `server/phone.ts`) + `password`, and the login/register UI only offers the masked phone field (`FormInputWithMask`, mask in `components/constants/phone-mask.ts`); there is no email+password login. Email still matters for GitHub/Google (OAuth links accounts by it). `User.email` is optional (phone-registered users have none), so the `jwt` callback refreshes the token by `token.id` rather than by email (on the very first sign-in it takes the id from `user` for credentials, or looks up by email for OAuth, where `user.id` is the provider's id); the session exposes `email: string | null` and `phone` — the route handler at `app/api/auth/[...nextauth]/route.ts` just imports it. `server/get-user-session.ts` wraps `getServerSession(authOptions)` for use in Server Components and route handlers. `middleware.ts` (repo root) gates `/orders/**` and `/api/orders/**`: `/api/orders/**` requires `token.role === 'admin'` (read via `next-auth/jwt`'s `getToken()`, Edge-safe) with no carve-outs (public order creation lives in `/api/checkout/*`, outside the gated paths — see Checkout below), so any new API route there is admin-only by default. The `/orders` *page* only requires a logged-in user: a customer sees just their own orders (`userId` filter set server-side), an admin gets two tabs «Всі»/«Свої» (`?scope=all|mine`, `resolveOrdersScope` in `server/orders-scope.ts`; non-admins are always forced to `mine`). `server/requireAdmin.ts` (Prisma-backed, re-checks `User.isAdmin` fresh from the DB) is still called inside the admin API route handlers (and `app/(site)/orders/page.tsx` re-reads `isAdmin` from the DB before serving the «Всі» tab) as a second line of defense against the JWT staleness window (the token's `role` claim only refreshes when a session is re-read, not the instant DB access is revoked) — don't remove these when touching that code, they're intentionally redundant with the middleware.

### Checkout (SMS-confirmed orders)

Orders are created only after an SMS code is confirmed — there is no public `POST /api/orders` anymore (and no Firebase/reCAPTCHA). Flow: `POST /api/checkout/send-code` validates the draft with `createOrderSchema`, pre-prices the cart, stores the draft as `PhoneVerification.payload` and sends a 6-digit code (`server/phone-verification.ts` → `server/sms.ts` → AlphaSMS); `POST /api/checkout/confirm` verifies the code and, in one `$transaction`, claims it and calls `createOrderFromInput` (`server/createOrder.ts`, prices always recomputed from the DB); `POST /api/checkout/resend-code` re-sends for the same draft. A logged-in user whose `User.phone` is `phoneVerified` and equals the order phone skips the SMS (`send-code` returns `status: 'created'`). Phones are normalized to `380XXXXXXXXX` (`server/phone.ts`, fits `Order.phone VarChar(12)`). Codes are stored as HMAC(`NEXTAUTH_SECRET`) hashes, expire in 5 min, allow 3 attempts, and sending is rate-limited per phone (60 s cooldown, **2 SMS/h**) and per IP (**5 SMS/h**) via DB counts (`SEND_LIMITS.real` in `server/phone-verification.ts`; the counters include registration codes and resends) — this is the only abuse protection (SMS costs money), so keep it when touching that code. With the `console` driver outside production the looser `SEND_LIMITS.dev` (5/h per phone, 20/h per IP) applies instead (`getSendLimits()`; never in production, even if `SMS_DRIVER=console` is set there) because nothing is really sent and all local requests share one IP (`::1`); with `SMS_DRIVER=alphasms` locally the tight limits apply, so manual testing hits the IP limit quickly — use distinct `X-Forwarded-For` headers or delete the `PhoneVerification` rows. On top of that, **at most 2 non-cancelled orders per phone per rolling 24 h** (`assertOrderLimit` in `server/createOrder.ts`; checked in `send-code` before any SMS and again inside `createOrderFromInput`, so it also covers the no-SMS path of a verified user and the confirm race). A guest order is attributed to an account when the confirmed phone belongs to a verified account (`findUserIdByVerifiedPhone`, session user wins), and registering with a phone adopts that phone's earlier guest orders (`order.updateMany` in `register/confirm`); there is no "my orders" page for customers yet — `/orders` is admin-only. `SMS_DRIVER=console` (default outside production) logs the SMS instead of sending; production needs `ALPHASMS_API_KEY` and `ALPHASMS_SENDER` (an approved alpha-name).

### Registration by phone

Users register with phone + name + password; the phone is the unique identifier (`User.phone @unique`; `fullName` is deliberately NOT unique, `email` is optional/unique). Flow: `POST /api/auth/register/start` (409 if the phone is taken, otherwise bcrypt-hashes the password into `PhoneVerification.payload` with purpose `REGISTER` and sends the SMS — **no user row exists yet**), `POST /api/auth/register/confirm` (verifies the code, then in one `$transaction` claims it, re-checks the phone is still free and creates the user with `phoneVerified = now()`, `provider: 'credentials'`), `POST /api/auth/register/resend-code`. The client (`register-form.tsx`) then signs in with `signIn('credentials', …)` using the still-held password. Code mechanics, rate limits and `SMS_DRIVER` are shared with checkout (`server/phone-verification.ts`, `components/shared/sms-code-form.tsx`). `updateUserInfo` treats an empty email as `null` (email is only an optional contact for phone users). GitHub/Google users have no phone.

### Validation

Zod schemas are colocated near their forms (e.g. `components/constants/checkout-form-schema.ts`, `components/shared/modals/auth-modal/forms/schemas.ts`) and wired to `react-hook-form` through a custom `hooks/useZodForm.ts` wrapper plus `@hookform/resolvers/zod`. Server-side, `server/validation/{order,product,user,phone,verification}.ts` holds separate Zod schemas (not reused from the client ones, which have client-only transform/UX semantics) for the mutating API routes and `app/actions.ts`'s `updateUserInfo`; `server/withErrorHandling.ts` catches `ZodError` centrally and maps it to a 400 with `error.flatten().fieldErrors`, so route handlers just call `schema.parse(body)`.

### State

Zustand only, two small stores under `store/`: `cart-store.ts` (persisted to `localStorage`, holds just `{productId, quantity}[]`, not full product data) and `category.ts` (UI-only active-category id for nav highlighting). Full product details for cart items are re-fetched from the server via `hooks/useCartProducts.ts`.

### API route error handling

Every handler in `app/api/**/route.ts` is wrapped via `server/withErrorHandling.ts`, which takes a map of method handlers (e.g. `{ GET, POST }`) and catches unhandled exceptions into a generic 500 response.

### Prisma schema

`prisma/schema.prisma` defines `User`, `ProductGroup`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`. Schema changes go through `prisma/migrations/` (baselined from the pre-migrate `db push` state as `0_init`) — run `npm run prisma:migrate` locally to generate+apply a new migration, then `npm run prisma:migrate:deploy` against the prod `DATABASE_URL` to apply it there (see Commands above; this is a manual step, not wired into the Vercel build).

### Folder-naming: `lib` / `server` / `config` / `components/shared`

Previously five confusingly-similar locations existed (`lib`, `libs`, root `shared/`, `components/shared/`, `components/shared/lib/`); `libs/` and `components/shared/lib/` were merged into `server/`, and root `shared/constants/` was renamed to `config/` (Крок 6 #20). Current layout:

- `lib/` — just the shadcn-generated `cn()` helper, imported everywhere as `@/lib/utils`. Left alone deliberately (shadcn CLI convention, `components.json` hardcodes this path, and it has ~30 importers).
- `server/` — everything server-only: the Prisma client singleton (`prisma.ts`), `withErrorHandling.ts`, `requireAdmin.ts`, `orderHelpers.ts`, `createOrder.ts`, `phone.ts`, `phone-verification.ts`, `sms.ts`, `productGroups.ts`, `get-user-session.ts`, `send-email.ts`, and `validation/{order,product,user}.ts` (+ their `.test.ts` files).
- `config/` (repo root) — a handful of constants/config modules: `auth-options.ts`, `order-status.ts`, `delivery-type.ts`, `units.ts`.

### Display rules

- `Order.deliveryType` is stored as `'address'` / `'pickup'`, but the UI must never show these raw values: `address` → «Адресна доставка», `pickup` → «Самовивіз». Always render it through `getDeliveryTypeLabel()` from `config/delivery-type.ts` (used in the orders table and the mobile order cards); add any new label there, not inline.
- `components/shared/` — UI feature components (checkout, orders, modals, product-details, form primitives, etc.), unrelated in purpose to root `config/`.

## Known gotchas

- **`.eslintrc.json` is the only ESLint config** (the legacy format; flat config would need `ESLINT_USE_FLAT_CONFIG=true`, not set). `no-unused-vars` is enforced (`@typescript-eslint/no-unused-vars` with `argsIgnorePattern`/`varsIgnorePattern: '^_'` for intentionally-unused params), `react/prop-types` is off (redundant with TS-typed props). `next.config.mjs` no longer sets `eslint.ignoreDuringBuilds`, so ESLint errors fail `next build`. The `<img>`/a11y rules are effectively moot now (the `next/image` migration and a11y pass are both done — the build now has no lint warnings; the old `react-hooks/exhaustive-deps` one in `app/(checkout)/checkout/page.tsx` was fixed by depending on `session.user.id` plus react-hook-form's stable `setValue`/`trigger`, **not** on `form` — `useZodForm` returns a new object every render, so putting `form` in the deps would loop the `getMe` autofill).
- Installed Prisma is `6.6.0` (`^6.6.0` in `package.json`). The Prisma VS Code extension may surface Prisma-7-era warnings (e.g. about `datasource.url` being unsupported) that don't apply to the version actually installed here.
- `middleware.ts`'s admin gate relies on the JWT `role` claim (`next-auth/jwt`'s `getToken()`), which is only as fresh as the last time a session was actually read — see the Auth section above for why `requireAdmin()`'s DB check is kept as a second line of defense rather than removed.
