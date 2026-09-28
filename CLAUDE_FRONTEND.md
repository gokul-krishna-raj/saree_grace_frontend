# Saree Grace Frontend — Binding Conventions

Read this before working on any section. It is the single source of truth for styling,
state, and Next.js 16 conventions across sessions. Update it when a decision changes —
don't let it drift out of sync with the code.

Stack: Next.js 16.3.0 (App Router, Turbopack default), React 19, TypeScript (strict),
Tailwind CSS v4, Redux Toolkit + RTK Query, react-hook-form + zod.

## Next.js 16 conventions (this project is newer than most training data)

- **`middleware.ts` is deprecated** — use `src/proxy.ts` with `export function proxy()`.
  Runs on the Node.js runtime only (no Edge runtime support in `proxy`).
- **Don't hand-write `params`/`searchParams` prop types.** Use the generated global types:
  `PageProps<'/products/[slug]'>`, `LayoutProps<'/account'>`, `RouteContext<'/api/orders/[id]'>`.
  `params`/`searchParams` are `Promise`s — always `await` them, no sync fallback exists in 16.
- **Images**: use `images.remotePatterns` in `next.config.ts`, never `images.domains`
  (removed). Use the `preload` prop instead of `priority` (deprecated but still works).
- **`next lint` is removed.** Lint via `eslint` directly (already wired as `npm run lint`).
- Route Handler `GET` is dynamic by default (not statically cached) — same as Next 15.
- `revalidateTag` requires two args: `revalidateTag(tag, profile)` (e.g. `'max'`).
- Prefer Server Components + `fetch`/RTK Query's `fetchBaseQuery` invoked server-side for
  anything that must be crawlable (product/category pages — see Section 15). Client
  components only where interactivity is required (cart, filters, forms).

## Design tokens (maroon / gold / ivory — premium, mobile-first)

Tailwind v4 is CSS-first (`@tailwindcss/postcss`, no `tailwind.config.ts`). **One** token system
lives in `src/app/globals.css` (consolidated in the 2026-09 modernization pass — see
`MODERNIZATION_AUDIT.md`):

- **Semantic tokens** (HSL triplets on `:root`, alpha-capable): `bg-background` (ivory
  `#faf7f2`), `text-foreground` (wine-ink), `bg-primary` (maroon `#6a1f33`), `text-accent`
  (text-safe antique gold `#7a5423`), `text-muted-foreground`, `bg-muted`, `bg-cream`,
  `border-border`, `text-sale`, `text-success`. Prefer these in new code.
- **Scales**: `maroon-50…950` and `gold-50…700` — every step is defined (the old scale skipped
  300/500/800/950, which silently rendered ~40 classes with no colour).
- Measured contrast on ivory: foreground 16.3, primary 10.7, muted-foreground 6.1, accent 6.4,
  sale 7.1. `gold-400/500` are **decorative only** (~3.3:1) — never body text on light surfaces.
  Text on a gold fill uses `text-maroon-900`. Verify any new combination with a contrast checker.
- **Radius**: `--radius: 0.5rem` — restrained rounding (`rounded-md` / `rounded-sm` for images and
  badges, `rounded-full` for pills/icon buttons). No arbitrary radii.
- **Shadows**: rare and soft (`shadow-soft`, `shadow-elegant`). Cards sit on whitespace and borders,
  not drop shadows. No gradient buttons — the legacy `gold`/`maroon`/`premium` Button variants and
  `bg-gradient-*` utilities still exist for API compatibility but render as quiet solids.

### Layout + type utilities (defined with `@utility` in globals.css)

- `container-page` — the one page container (max 88rem, 16/24/40px gutters). Use it instead of
  ad-hoc `mx-auto max-w-6xl px-4`.
- `section-y` — vertical rhythm for homepage/landing sections.
- `eyebrow` — small uppercase tracking label above headings.
- `text-display` (hero), `text-heading-xl` (page/section titles), `text-heading-lg` (sub-sections).
- `SectionHeading` (`components/ui/SectionHeading.tsx`) — eyebrow + title + description + optional
  "view all" link; use it for every storefront section header.
- `--header-height` (3.5rem mobile / 4.5rem desktop) — use for sticky offsets
  (`top-[var(--header-height)]`).

### Motion

Short, subtle, CSS-only (`animate-fade-in`, `animate-slide-in-*`, `animate-scale-in`,
`animate-pop`). `prefers-reduced-motion` is honoured globally in globals.css. No animation on
initial render of above-the-fold content (it delays LCP).

## Dark mode

**Explicitly not supported in v1.** The maroon/gold premium theme is a deliberate single
light theme (dark maroon on cream reads as "premium boutique"; a dark-mode remap of jewel
tones is a design project of its own, not a checkbox). Do not add `dark:` variants speculatively.
Revisit only if analytics show meaningful demand.

## Icons

**lucide-react** exclusively. Do not introduce a second icon library for "just one icon" —
lucide's set is large enough to cover admin/commerce UI needs.

## Component conventions (`src/components/ui`)

- Every primitive (`Button`, `Input`, `Select`, `Badge`, `Card`, `Modal`, `Skeleton`, `Toast`)
  lives in `src/components/ui`, is a named export, accepts `className` and merges it last via
  `cn()` (`src/lib/cn.ts`, `clsx` + `tailwind-merge`) so callers can override.
- Variant props (`variant="primary" | "secondary" | "ghost"`) via `class-variance-authority`
  (`cva`), not conditional className strings sprinkled inline.
- `Skeleton` is the default loading UI for any data-fetching component — spinners only for
  in-flight actions with no meaningful layout to placeholder (e.g. a submit button).
- Toasts via `react-hot-toast`, one `<Toaster />` mounted once in the root layout.
- `Skeleton` announces "Loading" by default; inside a grid, wrap placeholders in `SkeletonGroup`
  (one announcement) and pass `decorative`.
- Dialogs: `Modal`, `Drawer` (left/right/bottom sheet, optional sticky `footer`) and the search
  dialog all use `useFocusTrap` + `useScrollLock` (`hooks/useFocusTrap.ts`). Title ids come from
  `useId()` — never hard-code dialog ids.
- `Disclosure` (`components/ui/Disclosure.tsx`) — native `<details>` accordion, zero JS.

## Rendering & performance rules (from the modernization pass)

- **No `PersistGate` around the app.** It blanked the server HTML. Guest-cart consumers
  (`useCart`, `useCartCount`) handle "not rehydrated yet" themselves, and `useHydrated()` gates
  anything that depends on localStorage so the first client render matches the server.
- Storefront data is fetched **once, on the server** (`serverFetch`, `lib/catalog.ts`) and passed
  down — don't re-request the same list from RTK Query on hydration.
- PDP and category pages are ISR (`revalidate = 300` + `generateStaticParams() { return [] }`).
- `sanitize-html` is server-only: `components/product/ProductDescription.tsx` and `lib/richText.ts`
  must never be imported from a `"use client"` module (use `ProductSpecs.tsx` / `lib/plainText.ts`).
- `lib/env.ts` is zod-free on purpose (it's in every client bundle).
- Sentry loads only when `NEXT_PUBLIC_SENTRY_DSN` is set (`instrumentation-client.ts`,
  `lib/reportError.ts`) — never `import * as Sentry` in client code.
- Heavy, on-demand UI uses `next/dynamic` (quick view, review form).
- **LCP images rendered inside client components** (listing cards, PDP gallery) are hinted from
  the Server Component with `preloadImage()` (`lib/preloadImage.ts`) using the shared `sizes`
  constants in `lib/imageSizes.ts` — next/image's `preload` prop is a no-op in client components.
  Above-the-fold `<Image>`s use `loading="eager"` + `fetchPriority="high"`, never a fade-in.
- **Listing components must not call `useSearchParams()` directly** — use `useProductFilters()` /
  `useListingParams()`, which read from `ListingParamsContext`. On ISR category pages the live
  listing (`ProductListingClient`) renders client-side, and the Suspense fallback is
  `ProductListingStatic` (same listing, empty params) so the HTML contains the real product grid.
  Calling `useSearchParams()` anywhere in that tree would bring back an HTML page with no products.
- Listings continue from the server-rendered first page (`serverFetchPage` → `initialNextCursor`)
  — don't re-request page one on hydration.
- **Mixed-case product/category URLs are lowercased in `src/proxy.ts`**, not in the page. A
  page-level redirect gets cached by ISR under the mixed-case path, which on a case-insensitive
  filesystem is the same file as the real page (observed: a redirect loop on the canonical URL).
- Tracking params (`utm_*`, `gclid`…) must not change rendering: use `hasListingParams()` to
  decide whether a listing URL is "filtered" (noindex, no server first page).
- Empty categories are `noindex, follow` and left out of the sitemap until they have products.
- Headings: product cards take `headingLevel` (`h2` directly under a page h1, `h3` inside a
  section); `Disclosure` titles are `h2`; description Markdown maps its shallowest heading to h3.
- Base element styles live in `@layer base` in globals.css — unlayered rules would silently beat
  every Tailwind utility.
- JSON-LD goes through `components/seo/JsonLd.tsx` (escapes `<`). Page metadata goes through
  `pageMetadata()` in `lib/seo.ts` (canonical + OG + Twitter from one input; strips a duplicated
  "| Saree Grace" suffix).

## Redux / RTK Query conventions

- `src/store/index.ts` — `configureStore`, RTK Query middleware, `redux-persist` wiring.
- `src/store/api/baseApi.ts` — one `createApi` with `fetchBaseQuery`, all resource endpoints
  injected via `.injectEndpoints()` from `src/store/api/<resource>Api.ts`. One `baseApi`, not
  one `createApi` per resource — this keeps the cache and tag types unified.
- Typed hooks only: `useAppDispatch`, `useAppSelector` from `src/store/hooks.ts`. Never import
  raw `useDispatch`/`useSelector` in feature code.
- Cache tags (declared on `baseApi`, see `src/store/api/baseApi.ts`): `Product`, `Category`,
  `Cart`, `Wishlist`, `Order`, `Review`, `User`, `Dashboard`. (No `Address` tag — there is no
  address-book endpoint, see NOTES.md.) Mutations invalidate the specific tag/id, not the whole
  resource, unless the mutation genuinely affects the whole list (e.g. reordering).
- 401 handling lives in the `baseApi` base query wrapper (`baseQueryWithReauth`): dedupes
  concurrent 401s into one `/auth/refresh` call, retries the original request once on success,
  dispatches `loggedOut()` on failure (route guards react to `auth.status`, not a hard redirect
  from inside the query layer) — not duplicated per-endpoint.
- **Every endpoint unwraps the backend's `{success, data}` envelope via `transformResponse`**:
  `transformResponse: (response: ApiSuccess<T>) => response.data`. Never return the raw
  envelope from an endpoint — components should see plain domain types, not `{success, data}`.
  For errors, the envelope is `{success: false, error: {message, code?, details?}}`
  (`ApiErrorBody` in `src/types`) — read `error.error.message` for user-facing text (RTK
  Query's `error` field on a failed query/mutation is `{status, data: ApiErrorBody}`).
- **Auth token storage (decided with user, rule 7):** the backend has no cookie support at
  all (JSON-body tokens only, see `BACKEND_CONTRACT.md`). `accessToken` lives in memory only
  (Redux `authSlice`, never persisted) — cleared on tab close/reload. `refreshToken` is
  persisted in `localStorage` so a silent refresh on app load restores the session. On app
  boot: if a `refreshToken` exists in localStorage, call `POST /auth/refresh` before rendering
  protected content; on success repopulate `accessToken` in memory; on failure clear storage
  and treat as logged out. Accepted tradeoff: a stolen `refreshToken` (via XSS) is usable once
  before the backend's rotation/reuse-detection revokes the chain — this bounds but does not
  eliminate the risk. Do not add `accessToken` to localStorage/redux-persist under any
  circumstance — that decision is intentional, not an oversight.

## Forms

- `react-hook-form` + `zod` via `@hookform/resolvers`. One zod schema per form, colocated
  with the form component or in `src/types` if shared with an RTK Query mutation's input type.

## Testing conventions

- Unit/component: Jest + `@testing-library/react`, colocated as `ComponentName.test.tsx`.
- E2E: Playwright, under `e2e/`, one spec per checklist flow (auth, cart, checkout).
- Written alongside each section's components, not deferred — see checklist rule 3.

## Folder structure

```
src/
  app/                 # routes (App Router)
  proxy.ts             # auth/route protection (replaces middleware.ts in Next 16)
  components/
    ui/                # design-system primitives
    layout/            # header, footer, nav, mobile drawer
    product/, cart/, checkout/, account/, admin/
  store/
    index.ts, hooks.ts
    api/               # baseApi.ts + one file per resource
    slices/            # uiSlice, filtersSlice, authSlice (non-server UI state)
  lib/                 # cn.ts, env.ts, formatters, api helpers
  hooks/
  types/
  styles/
```

## Admin dashboard (Section 12)

- **Built into this same app under `/admin/*`**, not a separate deployment — decided when
  building Section 12. This is a single small storefront; a separate admin app would be
  premature infrastructure for the scale involved. Guarded by `AdminRoute`
  (`src/components/layout/AdminRoute.tsx`), which checks the real `role` field from a live
  `getMe` call — never a client-only/cached flag — and redirects non-admins away.
- **No "deactivate" control is exposed anywhere in the admin product UI, only real delete.**
  This is load-bearing, not a style choice: the backend has no admin product-list endpoint and
  no by-id lookup — the only way to find a product again is the public `GET /products/:slug`,
  which itself requires `isActive: true`. Setting a product inactive through the API would make
  it permanently unreachable through any existing endpoint. See NOTES.md Section 12 for the
  full reasoning; don't add an isActive toggle to the product edit form without re-checking this
  constraint first (the field is already accepted by `updateProduct` in `productsApi.ts` for
  when/if a real fix lands — just not wired to any UI control).
