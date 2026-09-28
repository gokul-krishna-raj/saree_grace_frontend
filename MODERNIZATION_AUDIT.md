# Saree Grace — UI/UX, SEO & Performance Audit (Phase 1)

Audit date: 2026-09-28. Read before the modernization pass; findings below are from the actual
code, a baseline `npm run build`, and a local run against the live backend (read-only GETs).

## Current architecture

- **Frontend**: Next.js 16.3 App Router (Turbopack), React 19, TS strict, Tailwind v4 (CSS-first
  `@theme` in `globals.css`), Redux Toolkit + RTK Query (one `baseApi`), redux-persist (guest cart),
  react-hook-form + zod, Sentry, lucide icons, embla (hero), recharts (admin only).
- **Rendering**: product/category/home pages are Server Components that pre-fetch via
  `serverFetch()` (60s `revalidate`) and hand initial data to client components that then _also_
  query RTK Query on mount.
- **Backend** (`../saree_grace_backend`): Express + Mongoose on Lambda, `{success,data,error,meta}`
  envelope, cursor pagination. Public read endpoints used by the storefront:
  `GET /products` (filters: `category` id|slug, `occasion`, `fabric`, `color`, `minPrice`,
  `maxPrice`, `loomType`, `handloomOnly`, `inStockOnly`, `sort` newest|price_asc|price_desc|top_rated),
  `GET /products/search?q`, `GET /products/best-sellers`, `GET /products/:slug`,
  `GET /products/:id/reviews`, `GET /categories`, `GET /categories/:slug`, `GET /occasions`.
- **Auth**: JWT access token in memory, refresh token in localStorage, silent refresh on boot
  (deliberate decision, documented in `CLAUDE_FRONTEND.md`). Google SSO. Admin under `/admin/*`.
- **Images**: Cloudinary (`res.cloudinary.com` remotePattern), AVIF/WebP, custom `deviceSizes`.
  Real catalog: variant products, ~1 image per colour variant, no top-level images.

## Existing features (all preserved)

Home, shop listing (infinite scroll, URL-driven filters, sort, search), category pages, PDP
(variant selector, gallery + zoom modal, add to cart / buy now, reviews, related), cart drawer +
cart page, guest cart merged on login, checkout with Razorpay, success/failure pages, account +
orders + returns, wishlist (auth only), login/register/OTP/forgot/reset, admin dashboard/products/
categories/occasions/orders/reviews, WhatsApp button, GA4 + web-vitals hooks, sitemap, robots.

## Baseline health

- `lint`: 0 errors, 3 warnings (react-hook-form `watch()` compiler notices, admin only).
- `typecheck`: clean. `jest`: 37 suites / 155 tests passing. `build`: succeeds.

## Current problems

### Performance

1. **`sanitize-html` ships to the browser on every PDP — a ~108 KB gzipped chunk.**
   `ProductDescription` (which sanitizes) is rendered inside the client `ProductDetailClient`.
   Sanitizing belongs on the server.
2. **zod (~64 KB gz chunk) is pulled into the shared client bundle by `lib/env.ts`**, which is
   imported by client modules (`baseApi`, analytics). Env parsing doesn't need zod.
3. **Duplicate fetching**: home/listing/PDP sections receive server data then fire the same
   request again from RTK Query on hydration (e.g. `FeaturedCarousel`, `CategoryShowcase`,
   `RelatedProducts`), doubling API load and causing content swaps after hydration.
4. **Hero is a 3-slide embla carousel with autoplay** (client JS + carousel for the LCP element).
5. **PDP and category routes are fully dynamic (`ƒ`)** — no ISR, so every crawl/visit hits the
   backend for TTFB even though `serverFetch` caches data.
6. `sitemap.xml` is prerendered once at build and never revalidates.
7. Heavy card effects: `duration-700 scale-110` on every card image, blur backdrops, shadows.

### SEO

1. JSON-LD emitted with raw `JSON.stringify` inside `<script>` — product descriptions containing
   `</script>` would break out (also an XSS vector). Needs `<` escaping.
2. `Organization` + `WebSite` JSON-LD render on **every** page from the root layout (should be
   homepage). No `ItemList` on category/listing pages.
3. Category page H1 is `"{name} Sarees"` → produces "Cotton Sarees Sarees".
4. Filtered/sorted listing URLs (`/products?minPrice=…&sort=…`) are indexable duplicates
   (canonical points at `/products`, which is right, but robots should `noindex,follow` them).
5. Footer links "Best Sellers" → `?sort=top_rated`, "Handloom collection" → `?handloomOnly=true`
   (link equity to non-canonical URLs; handloom filter currently unused in UI).
6. `priceValidUntil` fabricated as "next year Dec 31" — acceptable but not needed; Offer is fine
   without it. Product `aggregateRating` correctly gated on real reviews.

### UX / design

1. Two competing token systems (HSL semantic tokens + legacy hex `maroon-*`), and **undefined
   classes in use**: `maroon-300/500/800/950` (≈40 usages) render with no colour at all.
2. Hard-coded hex colours in Hero (`#5A1725`, `#FAF6F0`) outside the token system.
3. Generic-template feel: gradient buttons (`gold`, `premium`), heavy shadows, rounded-2xl
   everywhere, sparkles pill, pulsing WhatsApp ring, "Why shop with us" icon grid.
4. Header has no search field on desktop (icon only), no category navigation, no announcement.
5. Search overlay is a heavy centered modal; no focus trap; suggestions show but no
   categories/"view all" row.
6. Product card: no secondary image, no quick add, tiny 10px text on mobile, discount badge
   uses destructive red.
7. PDP: no sticky mobile purchase bar, delivery/returns info is 3 icon tiles, no accordions,
   no recently viewed.
8. Filters: free-text fabric/colour inputs, no active-filter chips, no in-stock toggle
   (backend supports `inStockOnly`), no result count.
9. Cart line items don't show variant (colour); empty states are bare text.
10. 404 page has no search or category links.

### Accessibility

1. `useFocusTrap` depends on an inline `onClose` → the effect re-runs on every parent re-render
   (focus jumps back to the dialog container, e.g. while changing qty in the cart drawer).
2. Static `id="drawer-title"` / `id="modal-title"` → duplicate IDs when two are mounted.
3. Search overlay: `role="dialog"` without focus trap/scroll lock.
4. Hero carousel `section tabIndex=0` + autoplay (WCAG 2.2.2 pause control missing).
5. Skeletons each announce `role=status` "Loading" (8+ announcements per grid).
6. Swatches 16px (tap target far below 24px minimum).

### Security

- Only `NEXT_PUBLIC_*` values reach the client; no secrets found in client code.
  `SENTRY_AUTH_TOKEN` is build-only. JSON-LD escaping (above) is the one concrete fix.

## Recommended changes (implemented in the following phases)

1. Consolidate the design system: one token set in `globals.css`, define the missing shades,
   editorial type scale, calmer buttons, remove gradient/shadow-heavy variants from storefront use.
2. Rebuild header (announcement bar, desktop category nav + inline search, mobile compact),
   footer, mobile menu; fix dialogs' focus handling.
3. Homepage: static editorial hero (single LCP image, no carousel JS), category rail, new
   arrivals + best sellers from server data (no refetch), craft story, trust strip, CTA.
4. Product card with secondary image + quick add; listing with filter chips, in-stock toggle,
   mobile bottom-sheet; PDP with sticky mobile bar, accordions, recently viewed.
5. SEO: escaped JSON-LD helper, homepage-only Organization/WebSite, ItemList, noindex for
   filtered URLs, fixed H1, sitemap revalidation, clean internal links.
6. Performance: server-side description sanitizing, zod-free env, ISR for PDP/category,
   remove duplicate fetches, drop embla from home.

---

# Implementation report

Additional findings made during implementation (not in the Phase 1 list above):

- **The server HTML was empty.** `<PersistGate loading={null}>` wrapped the whole app, so every
  page's `<body>` had no header, heading, product or footer until JS ran and localStorage was
  read. Fixed by removing the gate (the guest cart handles its own rehydration).
- Page titles were doubled ("… | Saree Grace | Saree Grace") when admin SEO titles already ended
  in the brand.
- Most live product descriptions are Markdown and rendered as raw `##` / `**` text.
- The cart showed a made-up shipping rule the backend never charges.
- Backend price sorting doesn't work for variant products (see NOTES.md) — not changed.

## Measured results (production builds, same backend data)

JS = sum of gzipped `<script src>` chunks in the initial HTML (excluding the `noModule`
polyfill bundle modern browsers skip). Words = visible text in the server HTML.

| Page                           | JS before | JS after | Server-HTML words before → after |
| ------------------------------ | --------: | -------: | -------------------------------- |
| `/`                            |    358 KB |   212 KB | 0 → 597                          |
| `/products`                    |    343 KB |   217 KB | 0 → 419                          |
| `/categories/soft-silk-sarees` |    350 KB |   217 KB | 0 → 190                          |
| `/products/soft-silk-sarees-4` |    466 KB |   221 KB | 0 → 532                          |
| `/cart`                        |    344 KB |   208 KB | 0 → 168                          |

Not measured: Lighthouse scores and LCP (the embedded browser used for testing doesn't report
paint timings). CLS measured 0 on the homepage in that browser.

## Checks run

`npm run lint` (0 errors; the same 3 pre-existing react-hook-form compiler warnings),
`npm run typecheck`, `npx jest` (37 suites / 155 tests), `npm run build` — all pass. Manual
checks at 375 / 768 / 1440 px against the live backend (read-only browsing plus a guest-cart
add, which only touches localStorage). `e2e/` Playwright spec updated but not run (see NOTES.md).

---

# Production-readiness pass (2026-09-29)

Verification environment: a **local sandbox** — MongoDB replica set on `localhost:27027` holding a
read-only copy of the real Atlas catalogue (12 products, 11 categories) plus `npm run seed`
fixtures; backend on `:4100` with email, Razorpay, Cloudinary and Google auth disabled; frontend
production build on `:3200` built with `NEXT_PUBLIC_SITE_URL=https://www.sareegrace.in`.
Atlas was only read from (see NOTES.md for the one index side effect).

## Backend

- **Price sorting fixed.** New persisted `Product.sortPrice` (lowest active variant price /
  simple price) maintained by a `pre('save')` hook, two indexes, and a `(value, _id)` keyset
  cursor for `price_asc`, `price_desc` and `top_rated` (which had the same paging bug).
  Idempotent backfill: `npm run migrate:sort-price [-- --dry-run]` — **not yet run on Atlas**.
- **Colour/fabric filters** match active variants' attributes, case-insensitively, with
  comma-separated multi-select. Product-level `color`/`fabric` still match (contract preserved).
- **`GET /products/facets`** — real filter options with per-product counts and swatch hex.
- Seed accounts are pre-verified (the seed predated OTP verification and its customer couldn't
  sign in).
- 8 new integration tests (`tests/integration/product-sort-facets.test.ts`).

## Frontend

- Colour filter (checkbox list with swatches and counts, collapsible) in the sidebar and the
  mobile bottom sheet; fabric section appears only with ≥2 real values; per-value chips.
- Listings continue from the server-rendered first page (no duplicate first-page request).
- `src/proxy.ts`: mixed-case product/category URLs → 308 to lowercase (fixes a redirect loop
  found during testing, see CLAUDE_FRONTEND.md).
- LCP: server-side image preloads for listing/PDP LCP images, eager + high-priority first
  images, no fade on the PDP's first photo, `latin-ext` font subset (₹) preloaded, correct PDP
  `sizes` at tablet width.
- Product photos: 4:5 frames for cards; the PDP shows the whole photo (`object-contain`) —
  catalogue photos are mostly square with details up to the edges.
- SEO: default share image on every page, static-page descriptions rewritten from their actual
  content, admin SEO descriptions capped at 160 chars, empty categories `noindex` + out of the
  sitemap, tracking params no longer trigger `noindex`, `?search=`/`?q=`/`?cursor=` disallowed in
  robots, `image` omitted (not `[]`) in Product JSON-LD for photo-less products.
- Accessibility: correct heading outline on listings and PDP (card heading level, accordion h2s,
  Markdown depth normalisation), 44px header wordmark target, base styles moved to `@layer base`.
- Branded error page copy; honest empty state for empty categories.
- E2E spec aligned with the OTP sign-up flow and current seed; Playwright runs one worker and only
  starts its own dev server when `E2E_BASE_URL` isn't set.

## Measured

JS (gzipped initial scripts, production build): Home 211.7 KB · Shop 217.9 KB · Category
217.9 KB · Product 221.2 KB — unchanged from the previous pass (+0.7 KB on listings for facets).

Found and fixed during this pass: **ISR category pages had no product cards in their HTML** (the
listing called `useSearchParams()`, which client-renders everything under its Suspense
boundary on a static route) — crawlers saw only a skeleton. Now server-rendered (4 cards on
`/categories/soft-silk-sarees`; words in the HTML 189 → 344).

### Lighthouse 13 (production build, local sandbox, default simulated throttling)

| Page                           | Mobile P / A / BP / SEO | Mobile LCP (FCP) | Desktop P / A / BP / SEO | Desktop LCP |
| ------------------------------ | ----------------------- | ---------------- | ------------------------ | ----------- |
| `/`                            | 85 / 100 / 100 / 100    | 4.4 s (0.9 s)    | 99 / 100 / 100 / 100     | 0.9 s       |
| `/products`                    | 88 / 100 / 100 / 100    | 4.0 s (0.9 s)    | 100 / 100 / 100 / 100    | 0.8 s       |
| `/categories/soft-silk-sarees` | 85 / 100 / 100 / 100    | 4.3 s (0.9 s)    | 100 / 100 / 100 / 100    | 0.7 s       |
| `/products/soft-silk-sarees-4` | 85 / 100 / 100 / 100    | 4.4 s (0.9 s)    | 99 / 100 / 100 / 100     | 0.8 s       |

First run of this pass (same environment, before fixes): mobile Performance 79 / 84 / 81 / 79,
LCP 5.8 / 4.5 / 4.9 / 5.8 s, FCP 1.4 s; Best Practices 96–100; Accessibility 98–100. CLS 0 and
TBT ≤ 110 ms on every run. Lighthouse's own unthrottled trace shows LCP under 160 ms on every
page; the remaining mobile LCP is the simulated slow-4G download of ~210 KB of JS plus images.
INP needs real interaction and was not measured (TBT is the lab proxy). The sandbox is on
localhost, so TTFB (3–16 ms) does not represent production hosting.

### Tests

- Frontend: lint 0 errors (3 pre-existing react-hook-form warnings), typecheck, Jest 38 suites /
  163 tests, production build — pass.
- Backend: lint 0 errors (4 pre-existing console warnings in a seed file), typecheck, build,
  Jest 28 suites / 202 tests — pass. The suite is intermittently flaky (a different single test
  fails in roughly one run in three); the unmodified code shows the same (1 of 3 runs failed on
  another test), so it predates this work.
- E2E (Playwright, desktop + Pixel 7) against the sandbox: 6/6 pass — guest filter → PDP → cart →
  checkout gate, OTP sign-up redirect, signed-in cart → checkout → real order creation (checked
  in the DB: ₹1,899 + ₹40 Tamil Nadu shipping, stock decremented).
