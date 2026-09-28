# NOTES — assumptions & flags for human review

Running log of assumptions made while working through `saree-grace-frontend-checklist.md`,
per rule 2 of the build instructions. Newest entries at the bottom of each section.

## Section 0 — Project setup

- **Tailwind version mismatch with `saree-grace-frontend-packages.md`**: the packages doc's
  theme snippet targets Tailwind v3 (`tailwind.config.ts` with `theme.extend.colors`), but the
  project as scaffolded uses Tailwind v4 (`@tailwindcss/postcss`, CSS-first `@theme` config,
  no `tailwind.config.ts` file present). I followed the installed version (v4) and translated
  the same maroon/gold/cream token values into `@theme` CSS variables in
  `src/app/globals.css` instead of creating a `tailwind.config.ts`. Documented in
  `CLAUDE_FRONTEND.md`. Flagging in case v3 was actually intended and the scaffold should be
  redone on v3 — but downgrading Tailwind now would be a larger, harder-to-reverse change than
  adapting the token syntax, so I did not do that unilaterally.
- **husky pre-commit hook**: packages/checklist just say "husky for lint + type-check on
  commit" without specifying exact commands. Implemented as `npx lint-staged` (eslint --fix +
  prettier on staged files) followed by `npm run typecheck` (`tsc --noEmit`, whole project —
  incremental TS project references weren't set up, so this is a full check, not staged-file
  only; acceptable for project size but will slow down as the codebase grows).
- **`.env.local.example` API base URL**: initially set to `http://localhost:5000/api/v1` as a
  placeholder, corrected to `http://localhost:4000/api/v1` once the backend research confirmed
  its actual default `PORT=4000` and `API_BASE_PATH=/api/v1` (see `BACKEND_CONTRACT.md`).
- **Missing `.gitignore`**: the scaffold had none at all — `node_modules`, `.next`, and any
  future `.env.local` would all have been committed. Added a standard Next.js `.gitignore`
  (ignoring `.env`, `.env.local`, `.env.*.local` but deliberately _not_ `.env.local.example` or
  `.env.test`, which must stay tracked).
- **Import sorting**: packages.md didn't specify a package for this (checklist item 0 asks for
  "import sorting configured"). Added `eslint-plugin-simple-import-sort` (not in
  `saree-grace-frontend-packages.md`) since it needs no separate config file and works with
  the flat ESLint config already in place.

- **Backend contract**: read directly from `../saree_grace_backend` source (routes,
  controllers, Mongoose models) and saved to `BACKEND_CONTRACT.md` in this repo — treat that
  file as the source of truth for every RTK Query slice from Section 2 onward, not this note.
  Confirmed: base URL `http://localhost:4000/api/v1` (matches `.env.local.example` now).
  Two flags raised to the user from this research, both blocking forward progress on the
  sections that depend on them (see "Flagged for human decision" below).

## Flagged for human decision (rule 7 / rule 4) — RESOLVED

1. **[rule 7 — security] Auth token storage.** Resolved: `accessToken` in memory only (Redux,
   never persisted), `refreshToken` in `localStorage` for silent refresh on app load. See
   `CLAUDE_FRONTEND.md` for the exact boot-time refresh flow and the accepted tradeoff
   (XSS-stolen refresh token usable once before rotation/reuse-detection revokes it).
2. **[rule 4 — missing backend] No address-book CRUD.** Resolved: skipped for this pass.
   Checkout (Section 10) uses a one-off inline address form each order (optionally pre-filled
   client-side from the last-used address as a convenience — not backend-synced). The
   Section 11 "Address book management" checklist item is left **unchecked and explicitly
   blocked** — do not build a client-only fake address book for it; it needs a real backend
   endpoint (`PUT /auth/me` or dedicated `/auth/addresses` routes) before it can be built
   properly. Revisit if the backend adds this.

## Section 1 — Design system & theme

- Built `Button`, `Input`, `Select`, `Badge`, `Card`, `Modal`, `Skeleton` in `src/components/ui`,
  plus `src/lib/toast.ts` wrapping `react-hot-toast` with maroon/gold styling (one `<Toaster />`
  mounted in `src/app/layout.tsx`, per convention in `CLAUDE_FRONTEND.md`).
- `Modal` implements its own focus trap (Tab/Shift+Tab cycling) and Escape-to-close via a
  portal, since no headless-UI/Radix dependency was in `saree-grace-frontend-packages.md` —
  worth revisiting with Radix Dialog later if the hand-rolled version shows accessibility gaps
  under real screen-reader testing (Section 16 will need to verify this, not just assume it).
- `/style-guide` route added (`src/app/style-guide/page.tsx`, `noindex`) showing every primitive
  for visual QA across sections.
- Jest configured via `next/jest` (`jest.config.mjs` — used `.mjs` not `.ts` since Jest's own
  TS-config loader needs `ts-node`, which isn't in the dependency list; `.mjs` avoids that extra
  dependency). Added `@types/jest` and `@testing-library/user-event` (not listed in
  `saree-grace-frontend-packages.md` but required for the component tests rule 3 asks for).
  Wrote representative tests for `Button` and `Modal` (click/disabled/loading, focus + Escape +
  close button) rather than every primitive — trivial presentational components (`Badge`,
  `Card`, `Skeleton`) were left untested as genuinely low-risk.

## Section 2 — Redux store setup

- `authSlice`/`uiSlice`/`filtersSlice`/`guestCartSlice` + `baseApi` (RTK Query, `fetchBaseQuery`
  with a `baseQueryWithReauth` wrapper) built per the auth decision above. Refresh-on-401 dedupes
  concurrent requests into a single `/auth/refresh` call (a module-level `refreshPromise`) so N
  simultaneously-expiring requests don't each rotate the refresh token and race each other into
  the backend's reuse-detection revocation.
- **"toast queue" checklist item**: implemented as a direct `react-hot-toast` wrapper
  (`src/lib/toast.ts`, Section 1) instead of a Redux `uiSlice` queue — `react-hot-toast` already
  manages its own internal queue/stacking, so a parallel Redux-managed queue would be a second,
  redundant source of truth. `uiSlice` only holds `mobileMenuOpen`/`cartDrawerOpen`/`activeModal`.
- **Guest cart vs. wishlist persistence**: only `guestCartSlice` is wired into `redux-persist`.
  The backend has no anonymous wishlist (or cart) endpoint — `/cart` and `/wishlist` both
  require auth (`BACKEND_CONTRACT.md`) — so a persisted _guest_ cart is meaningful (merged via
  `POST /cart/merge` on login, Section 8) but a persisted _guest_ wishlist would have nothing to
  merge into and no backend equivalent; guests will see a login prompt for wishlist actions
  instead (Section 9 will implement this).
- **`filtersSlice` scope kept deliberately small**: the checklist's actual filter-persistence
  requirement ("filters reflected in URL query params... survives refresh") is satisfied by the
  URL itself in Section 6, not Redux. `filtersSlice.lastApplied` only exists to restore filters
  when arriving at the listing page from a link that carries no query string.
- **RTK Query response envelope**: confirmed via a real test failure (not assumed) that the
  backend wraps every response in `{success, data}`. Convention set in `CLAUDE_FRONTEND.md`:
  every endpoint uses `transformResponse` to unwrap to plain `data`, so components never see the
  envelope.
- **Build-time env requirement**: `next build` failed until a real `.env.local` existed, because
  `NEXT_PUBLIC_*` vars are inlined into the client bundle at build time, and `src/lib/env.ts`
  validates them eagerly at module load (which the root layout pulls in transitively via
  `StoreProvider` → `store` → `baseApi` → `env`, so even static pages that don't call the API
  fail the build without it). This is correct Next.js behavior, not a bug, but it means CI/CD
  (Section 19) must have real env vars available _before_ the build step, not just at runtime —
  flagging so that's not missed when setting up deployment.
- Verified end-to-end for this session: `npm run build` and `npm run dev` both succeed with a
  real `.env.local` (copied from `.env.local.example`, gitignored, not committed) pointed at the
  local backend's default `http://localhost:4000/api/v1`.
- Added `@types/jest` was already noted in Section 1; Section 2 additionally required no new
  packages beyond what `saree-grace-frontend-packages.md` already listed
  (`@reduxjs/toolkit`, `react-redux`, `redux-persist`).

## Section 3 — API integration layer

- **Refactored `authSlice` before writing `authApi`**: dropped `user` from Redux state entirely.
  `getMe` (RTK Query) is now the single source of truth for the current user; login/register/
  google responses seed its cache directly via `authApi.util.upsertQueryData("getMe", ...)`
  instead of duplicating the user object into `authSlice`. Renamed the `credentialsReceived`/
  `accessTokenRefreshed` actions to a single `accessTokenSet` accordingly (updated `baseApi.ts`
  and its test to match — no behavior change to the reauth flow itself, just the state shape).
- **Structural deviation from the checklist's `adminApi` bullet**: admin CRUD lives inside each
  resource's own file (e.g. `productsApi.ts` has both public list/detail _and_ admin create/
  update/delete/variant endpoints) instead of a separate `adminApi.ts`. Reason: tag definitions
  and invalidation for a resource are easier to keep correct when they're colocated with that
  resource's public endpoints (e.g. admin `updateProduct` invalidating the same `Product` tags
  that public `getProducts`/`getProductBySlug` provide) rather than split across two files that
  both need to agree on tag shapes. `dashboardApi.ts` stayed separate since dashboard stats
  aren't really "a resource" the way products/orders/reviews are.
- **Multipart uploads**: `src/lib/formData.ts` builds `FormData` for every admin endpoint that
  accepts `images` (create/update product, add/update variant, create review) — scalar fields
  as strings, objects/arrays as JSON strings, matching the backend's multer + per-field parsing.
  One exception: `variantAttributeNames` (a `string[]`) is sent comma-joined rather than as a
  JSON string, since the backend explicitly documents accepting "comma-string or array" for
  that one field — a JSON-stringified array wasn't confirmed to be one of the two accepted
  shapes, so the safer of the two documented options was used.
- **Confirmed via a real test, not assumed**: wrote `cartApi.test.ts` to verify that
  `addCartItem`'s `invalidatesTags: ["Cart"]` actually triggers an automatic refetch of an
  actively-subscribed `getCart` query (RTK Query only auto-refetches subscribed queries on
  invalidation — an easy thing to get wrong by assuming invalidation always refetches
  regardless of subscription state). This is the exact mechanism Section 8 (cart drawer + full
  cart page staying in sync) and Section 9 (wishlist icon sync across pages) depend on.
- **Known cosmetic Jest warning**: `npm test` prints "Jest did not exit one second after the
  test run has completed" after the RTK-Query-backed test files — caused by RTK Query's
  internal ~60s cache-expiry `setTimeout` on stores created in tests without full teardown.
  Exit code is `0` and all tests pass; not a real leak, just Jest's open-handle detector being
  conservative. Not worth chasing down further for this test suite's scope.
- Stock/rating staleness accepted in a couple of narrow spots rather than over-invalidating:
  `cancelOrder` doesn't invalidate `Product` tags (restored stock on a specific product page
  could be briefly stale until refetch/refocus) — broad `Product` list invalidation on every
  order action would cause refetch storms unrelated to what most users are looking at. Flagging
  in case real-world usage shows this matters more than expected.

## Section 4 — Authentication

- **`authSlice` no longer holds `user`** (refactored before writing `authApi`, see Section 3 —
  `getMe` is the single source of truth, seeded by login/register/google via `upsertQueryData`).
- **Protected routes are client-side only, not middleware** — this is a direct, unavoidable
  consequence of the Section 2 auth-storage decision, not a shortcut: `src/proxy.ts` (Next 16's
  replacement for `middleware.ts`) runs on the server, and the server has no cookie to inspect —
  both the accessToken (memory-only) and refreshToken (localStorage) are invisible to it. Built
  `src/components/layout/ProtectedRoute.tsx` instead: reads `auth.status` from Redux, shows a
  skeleton while `checking`/`idle`, redirects to `/login?redirect=<path>` when `unauthenticated`,
  renders children when `authenticated`. It isn't wired into any layout yet because `/account`
  and `/checkout` don't exist until Sections 10/11 — wiring it in is a one-line wrap when those
  routes are built, tracked there rather than here.
- **Boot-time silent refresh reuses the 401 reauth path** (`AuthBootstrap.tsx`) instead of a
  separate "refresh on load" implementation: if a `refreshToken` exists in `localStorage`, it
  fires `getMe`, which 401s once (no in-memory accessToken yet after a reload) and lets
  `baseQueryWithReauth` refresh + retry exactly as it would mid-session. Guests with no stored
  `refreshToken` skip the network call entirely (checked via `useSyncExternalStore`, not
  `useState`+`useEffect` — the new `react-hooks/set-state-in-effect` lint rule flags directly
  setting local state from an effect; reading a browser-only API across SSR needs
  `useSyncExternalStore`'s explicit server/client snapshot split anyway, so it's the more
  correct tool here, not just a lint workaround).
- **Known inefficiency, not fixed now**: the boot flow above means every page load for an
  already-logged-in user makes a _guaranteed-to-fail_ first `getMe` call before the refresh+retry
  succeeds (3 requests total: 401, refresh, retry). A leaner version would call `/auth/refresh`
  directly first and only then call `getMe` once. Left as-is for now since it's correct and
  Section 4 didn't call for a performance pass — flagging for a look during Section 14
  (Performance) since it's an easy, contained win once that section is in scope.
- **Google SSO**: `GoogleSignInButton` is fully wired (`@react-oauth/google`, calls the real
  `googleLogin` mutation → `/auth/google` with the ID token) but renders nothing when
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is unset, which it currently is (`.env.local.example` ships it
  blank — no Google Cloud OAuth client has been provisioned for this project). **Needs a real
  Google OAuth client ID before Google sign-in is actually usable** — not a code gap, a
  credentials gap; flagging so it isn't mistaken for "done" without a way to test it.
- **`GoogleOAuthProvider` is instantiated per-button** (inside `GoogleSignInButton`) rather than
  once at the app root, so it only loads Google's script on pages that render the button
  (login/register) instead of every page. Minor duplication if both a login and register form
  were ever on the same page simultaneously (they aren't); traded a small amount of correctness-
  in-theory for not forcing every page to pull in Google's SDK.
- **Forgot/reset password**: built against the real backend endpoints (`/auth/forgot-password`,
  `/auth/reset-password`) — the backend's forgot-password handler always returns 200 with the
  same message regardless of whether the email exists (documented anti-enumeration behavior,
  not a bug), so the UI shows one generic "check your email" state rather than a
  success/failure branch. Reset-password reads `?token=` from the URL; a missing/invalid token
  shows an inline message with a link back to request a new one rather than erroring silently.
- Test file note: `jest.mock("@/...")` (module-path mocking) needed an explicit
  `moduleNameMapper` added to `jest.config.mjs` — `next/jest`'s `@/` alias resolution happens
  inside its SWC transform (which only rewrites actual `import` statements), so a bare string
  passed to `jest.mock()` was invisible to it and failed to resolve until mapped explicitly.
  This fix is global (helps any future test using `jest.mock` with the alias), not per-test.

## Section 5 — Home page

- **Ran the real backend locally against real MongoDB for verification** (not just mocked
  tests): started the backend from `../saree_grace_backend` with a local `.env` (dummy JWT/
  Cloudinary/Razorpay secrets — fine for browsing/auth flows, not for payments/image upload),
  ran its `npm run seed`, and pointed this frontend's `.env.local` at it
  (`http://localhost:4000/api/v1`, already the configured default from Section 0). Confirmed
  live, end-to-end, that `getProducts`, `getProductBySlug`, `getCategories`, and the full
  register→login→`getMe` flow all work correctly against the actual running Express/Mongo
  backend — not just against mocked fetch responses. This is a meaningfully stronger check than
  the mocked unit tests already in the repo and caught nothing wrong, which is itself useful
  signal that `BACKEND_CONTRACT.md` is accurate.
- **[Flag — shared local resource]** The MongoDB instance used above was **not** an isolated
  throwaway one as intended: my own `mongod --dbpath /tmp/sg-mongo-data` failed to bind (port
  27017 already in use) and silently fell through to an **already-running local MongoDB service**
  on this machine (a `brew services`-managed `mongod`, PID present before this session started)
  that also hosts unrelated databases (`ecommerce`, `healthcare_loyaltyware_integration_uat`).
  I verified before/after that I only ever wrote to a _new_ `saree_grace` database (exactly 2
  users / 2 products / 3 categories, precisely matching the seed script — no pre-existing data
  was found or touched), so no harm was done, but I did not intend to connect to a shared local
  service and want that known rather than silent. Left as-is (dropping it isn't necessary — it's
  clearly named and harmless), but flagging per the spirit of rule 7 since it touched
  infrastructure outside this project's own sandbox. **The backend dev server, and this seeded
  `saree_grace` Mongo database, are still running/present on this machine** — see the end-of-task
  summary for what's left running and how to stop it.
- **Header/Footer/MobileMenu/ProductCard built now** (not explicitly itemized in Section 5, but
  Section 0's folder structure calls for `layout/` and `product/` components, and the home page
  needs them) — wired into `src/app/layout.tsx` globally, so every subsequent page gets them
  for free. `useCartCount`/`useWishlistToggle` hooks extracted here since both the header badge
  and every future product card need the same guest-vs-authenticated logic.
- **`Drawer` extracted as a new `ui/` primitive** (retroactively extending Section 1's component
  set) once the mobile nav needed a slide-in panel — shares `useFocusTrap` (also new) with
  `Modal` rather than duplicating the focus-trap/Escape logic a second time.
- **Newsletter → WhatsApp/mailto decision** (rule 4, not stopped-and-asked since there's no
  security/data-loss dimension, just a missing backend endpoint with an obvious substitute):
  the checklist's "Newsletter/WhatsApp signup" has no backend subscription endpoint at all.
  Implemented `ContactSignup` as a WhatsApp deep link (`wa.me/<number>`) gated behind a new
  `NEXT_PUBLIC_WHATSAPP_NUMBER` env var (not in `saree-grace-frontend-packages.md`'s original
  list), falling back to a `mailto:hello@sareegrace.com` link when unset — never a fabricated
  phone number. **Needs a real WhatsApp Business number to be fully functional.**
- **Hero has no photograph** — `public/` only contains the default Next.js placeholder SVGs, no
  real product/lifestyle photography exists for this project yet. Built the hero as a
  typographic/color-block design instead of inventing a stock photo, to avoid a "placeholder
  image" problem flagged by Section 20. Real photography (hero, lifestyle shots) is a content
  gap, not a code gap — flagging for whoever owns asset sourcing.
- **Brand story copy**: real facts only (Elampillai is an actual handloom-weaving town in Tamil
  Nadu's Salem district) — no invented founding dates, awards, or specific claims about Saree
  Grace itself that I have no basis for.
- Home page data (carousel, categories) is client-rendered via RTK Query hooks, not
  server-rendered — fine for Section 5's scope, but **Section 15 (SEO) will need to revisit this
  specifically**, since the checklist explicitly wants server-rendered product/category content
  for indexing. Flagging now so it isn't a surprise later.

## Section 6 — Product listing & search

- **Caught via reading the actual backend code, not assumption**: the `category` list-filter
  param must be the category's **ObjectId**, not its slug (`product.validation.ts` uses a
  shared `objectId` Zod validator; `product.service.ts` assigns the raw query value straight
  into a Mongo filter against the ref field). Verified live against the running backend —
  `?category=<slug>` returns a `400 "Invalid id"`, `?category=<objectId>` works correctly.
  `FilterPanel`'s category `<Select>` uses `category._id` as the option value accordingly.
  Updated `BACKEND_CONTRACT.md` with this precision since the original summary didn't call it
  out explicitly.
- **Fabric/colour are free-text inputs, not dropdowns** — the backend has no "distinct fabric/
  colour values" endpoint, only free-text fields on `Product`. A dropdown would need fabricated
  option lists; a text input matching on exact value (as the backend filter does) is honest
  about what's actually available. Worth a backend enhancement (`GET /products/facets` or
  similar) if faceted filtering becomes a priority — flagging as a possible future ask, not
  building around a guess now.
- **Infinite scroll accumulation**: RTK Query doesn't merge cursor pages into one growing list on
  its own — `useInfiniteProducts` (new hook) does that manually, deduping by `_id` so an
  overlapping/re-fetched cursor boundary never produces a duplicate card. Reset-on-filter-change
  is done via `key={filtersKey}` remounting `ProductGrid` (React's own recommended pattern for
  "reset all state when identity changes") rather than an internal effect that watches for prop
  changes and calls `setState` — cleaner and avoids the same `react-hooks/set-state-in-effect`
  category of lint issue hit in Section 4.
- **Tested the pagination/dedupe logic against mocked multi-page responses** (deliberately
  overlapping on one item across pages, since that's the realistic failure mode a cursor
  boundary could produce), not against the live backend — the seed data only has 2 products, not
  enough to exercise a real second page. The live backend check for Section 6 instead verified
  the _filter_ integration (category ObjectId, handloomOnly) against real data; pagination
  mechanics are verified at the unit level. Both together cover what a live multi-page check
  would have, without needing to seed dozens of fake products just to test scrolling.
- `useDebouncedValue` (new, generic) backs both the search bar (400ms) and the fabric/colour/
  price filter inputs — one shared debounce implementation, not three copies.
- Canonical URL (`alternates.canonical: "/products"`) added to `generateMetadata` now, per
  Section 15's requirement that filtered/paginated listing variants not compete with the plain
  listing page for search ranking — pulled forward from Section 15 since it was a one-line
  addition directly adjacent to code already being written here.

## Section 7 — Product detail page

- **Made this page server-rendered, unlike Sections 5/6** — `src/lib/serverApi.ts` fetches the
  product directly (plain `fetch`, not RTK Query) inside an async Server Component, so the core
  product name/description/price/images are in the initial HTML for crawlers, plus real
  `generateMetadata` (title/description/OG image/canonical) and Product/Offer/AggregateRating
  JSON-LD structured data — pulling all of that forward from Section 15 since PDP is the single
  highest-leverage page for organic search and social sharing. Interactive parts (variant
  selector, add-to-cart, wishlist heart, reviews) are client components fed by the server-fetched
  product as a prop, not a second client-side `getProductBySlug` fetch — verified live against
  the real backend (`curl` showed the actual product name/description/JSON-LD in the raw HTML
  response, before any JS ran).
- **[Verified live, found a real framework quirk]** `notFound()` does **not** produce a real
  HTTP 404 status here — confirmed with `curl -I` against both `next dev` and a production
  `next build && next start`, consistently `200 OK`. This matches Next's own docs
  (`node_modules/next/dist/docs/.../not-found.md`, "Good to know" section): once a route starts
  streaming, the status code can't change, and the docs' own recommended fix (checking in
  `proxy` before rendering) would mean fetching the product twice per page view, which isn't a
  worthwhile trade for this app. Additionally, Next's documented automatic `noindex` meta-tag
  fallback for this case **did not render either** — inspecting the raw RSC payload showed the
  not-found page's `generateMetadata` result only partially merging (title updated, description
  silently fell back to the root layout's default, and the `robots` field didn't render at all).
  I added an explicit `robots: {index: false, follow: false}` in `generateMetadata` as a
  best-effort safety net, but calling this **fully solved** would be dishonest — the underlying
  metadata-merge behavior on the `notFound()` interrupt path in Next 16.3.0 is genuinely quirky
  and I stopped investigating further past confirming the actual user-facing 404 UI renders
  correctly (only the HTTP-status/meta-tag technicalities are affected). Practical impact is
  low (soft-404 UX is correct; the SEO edge case is a real but minor gap) — flagging clearly
  rather than silently shipping it as "done."
- **Variant selection logic extracted into pure functions** (`src/lib/variantSelection.ts`) and
  tested directly (9 tests) against a deliberately non-combinatorial fixture (Red only comes in
  2-inch border, Green only in 4-inch — matching the real seeded Kanjivaram product) — this is
  exactly the case a naive "show every attribute value always" selector gets wrong by letting
  someone select a combination that doesn't exist. `applySelection` auto-corrects a
  now-unreachable attribute when another one changes (e.g. switching color snaps border width to
  the one value actually available for the new color), rather than leaving the UI in an invalid
  state.
- **Found and fixed a real bug via the test I was writing, not after the fact**: `AddToCartControls`
  initially showed "Out of stock" for a variant product with _no variant selected yet_ (stock
  defaults to 0 before a variant is chosen, which isn't the same as actually being out of stock).
  The `AddToCartControls.test.tsx` case for "incomplete variant selection" caught this
  immediately; fixed by checking `needsSelection` before `outOfStock` everywhere the two
  conditions could overlap (button label, disabled state, low-stock hint).
- **Review eligibility**: no "have I already reviewed this" endpoint exists, so the "write a
  review" button shows whenever the user has _any_ delivered order containing this product —
  the backend still enforces the real one-review-per-(user, product, order) rule and returns 409
  on a genuine duplicate, surfaced as a form error rather than silently blocked client-side.
  Documented in the component's own comment, not just here, since it's a real judgment call
  someone maintaining this code should understand without re-deriving it.
- **Route is dynamically rendered (`ƒ`), not statically generated** — no `generateStaticParams`,
  since pre-rendering every product at build time doesn't fit an admin-managed, growing catalog.
  The 60s `revalidate` on the underlying `fetch` call still avoids hitting the backend on every
  single request; this is a deliberate choice, not an oversight, and a candidate to revisit in
  Section 14 if traffic patterns warrant ISR with `generateStaticParams` for top products.

## Section 8 — Cart

- **[Rule 4 — backend gap] Cannot proactively re-validate stock/price on cart load.** Confirmed
  by reading `cart.service.ts`: `getCart` never populates the `product` field (it's a bare
  ObjectId string), and the only public single-product lookup is by _slug_
  (`GET /products/:slug`) — there is no batch-by-id or by-id endpoint. So there's no efficient
  way to fetch live stock/price for arbitrary cart line items on page load. Two things make this
  an acceptable gap rather than a silent correctness hole, both confirmed by reading
  `order.service.ts` directly:
  1. **Price**: `createOrderFromCart` charges the cart's `priceSnapshot` verbatim — it never
     re-reads live product price at checkout. So a "price changed since you added it" banner
     would be purely informational; there's no financial exposure either way.
  2. **Stock**: the order-creation transaction _does_ re-check live stock atomically
     (`stock: {$gte: item.qty}`) and 409s with `Insufficient stock for "<name>"` if short. So
     stock correctness is enforced by the backend regardless — just not surfaced until the user
     actually tries to change a quantity or check out, not proactively when the cart page loads.
     `useCart.ts`'s `updateQty`/`removeItem` surface any 409 as a toast (via the shared
     `getApiErrorMessage` helper), which is the earliest point a real answer is actually knowable.
     Revisit if the backend ever adds a batch product-lookup endpoint.
- **Wired the cart-merge-on-login flow that was built (Section 3) but never connected**:
  `authApi.ts`'s shared `applyAuthResult` now folds any guest-cart items into the server cart via
  `POST /cart/merge` immediately after login/register/Google sign-in succeeds, then clears the
  local guest cart. Verified with a mocked-fetch integration test (`authApi.test.ts`) asserting
  the exact request body sent to `/cart/merge`, and that no merge call fires when the guest cart
  is empty (avoids a pointless request on every login).
- **One `useCart` hook, consumed identically by `CartDrawer` and the full `/cart` page** — they
  render the same RTK Query cache entry (authenticated) or the same `guestCartSlice` state
  (guest), so a quantity change in one is reflected in the other for free, not via manual sync.
  Verified directly: `useCart.test.tsx` renders two hook instances against the same store
  (simulating drawer + page existing simultaneously) and confirms a qty change through one is
  visible in the other, plus that `itemsTotal`/`shippingFee`/`total` always recompute as exact
  functions of the current line items (including the ₹999 free-shipping threshold, matching the
  backend's own rule in `order.service.ts` exactly).
- **Verified live against the real backend**: registered a fresh user, `POST /cart`'d a real
  product, confirmed the returned/refetched cart shape matches `CartItem` exactly (bare
  `product` ObjectId string, `priceSnapshot`, `nameSnapshot`, no live population) — this is what
  justified the "no efficient live lookup" conclusion above, not an assumption.
- **Add-to-cart now opens the cart drawer instead of a toast** — a stronger, more standard
  e-commerce confirmation pattern (see the cart contents immediately) than a toast that
  disappears; the header's cart icon changed from a `<Link>` to a `<button>` that opens the same
  drawer, with "View full cart" inside the drawer linking to the dedicated `/cart` page.
- Mobile cart access uses the existing header icon + badge (Section 5) rather than adding a
  separate persistent bottom bar — the checklist explicitly allows either; adding a bottom bar
  too would compete with it for the same job. Revisit in Section 13 if real mobile testing shows
  the header icon alone isn't discoverable/reachable enough.

## Section 9 — Wishlist

- **Caught via live testing, not code-reading, that my own type was wrong**: I initially typed
  `Wishlist.productIds` as full `Product[]`, matching the checklist's implicit assumption. Reading
  `wishlist.service.ts`'s `.populate('productIds', 'name slug images price variants type
isActive')` showed the populated fields are a much narrower subset — no `isHandloom`,
  `ratingAvg`, `description`, etc. Introduced `WishlistProductSummary` instead of overclaiming.
  Then, testing live against the real backend, found the code-reading-based assumption was
  itself incomplete: `startingPrice` **is** present in the real response even though it's not in
  that select string — it's a Mongoose _virtual_, computed at serialization time and not subject
  to field-selection restrictions the way a stored field is. Initially wrote a `getDisplayPrice()`
  helper to recompute a variant product's lowest active price client-side (reasonable given what
  I thought was missing); removed it once the live check showed `startingPrice` already gives
  the exact right value directly. This is exactly why this build kept testing against the real
  backend rather than stopping at reading the source — a plausible, code-grounded conclusion was
  still wrong until checked against the actual live response.
- **`WishlistItemCard` is a distinct component from `ProductCard`**, not a reuse-with-props hack
  — deliberately built against exactly what `WishlistProductSummary` provides, rather than
  padding out a full `Product` shape with guessed/undefined values to force-fit `ProductCard`.
  No handloom badge shown here (the data genuinely isn't in this response), which is the honest
  answer, not a missed feature.
- **"Move to cart" for a variant product defaults to its first active variant** rather than
  requiring a size/color choice on the wishlist page itself (which would need re-implementing
  the whole variant selector here) — a reasonable UX tradeoff; the user can still change the
  variant from the product page or cart afterwards. Disabled entirely (not just silently wrong)
  when a variant product has zero active variants left.
- **No stock field in the wishlist response for simple products either** (confirmed live) — same
  reactive-409-on-mutation handling as Section 8's cart applies here for the same reason (no
  efficient way to know otherwise); "Move to cart" attempting on an out-of-stock simple product
  surfaces the backend's error via the existing `addCartItem` error handling, not a new code path.

## Section 10 — Checkout & payments

- **[Flag for you — blocking full verification] No real Razorpay test-mode credentials.** The
  backend's `.env` has placeholder Razorpay keys (`rzp_test_local_dev` / a made-up secret) —
  I deliberately did not fabricate real-looking ones. This means:
  - `POST /orders` (order creation) is fully verified live — real cart, real address, real
    stock decrement, real cart-clearing, exact response shape confirmed against my types.
  - `POST /payments/create-order` fails with a `500` against the real backend, because it calls
    the _actual_ Razorpay API with those placeholder credentials and Razorpay rejects them.
    Confirmed this is a credentials problem, not a code problem, by reading the backend log
    directly (the request reaches the handler and fails inside the real Razorpay SDK call).
  - Everything past that point (opening the real Razorpay Checkout widget, a real test-card
    payment, real signature verification) is **untested against the real thing** — I tested the
    logic with `window.Razorpay` mocked instead (see below). **You'll need to provide real
    Razorpay test-mode keys (key id, key secret, and a webhook secret if you want webhook
    delivery tested too) before this can be verified or used at all** — I'm not able to obtain
    or generate these myself, and wouldn't create a Razorpay account on your behalf without
    asking first.
  - Frontend code doesn't need any changes to work with real keys — it reads `keyId` from the
    backend's response, never from its own env, so no frontend config change is needed either
    once the backend has real ones.
- **[Environment note, not a product decision] Had to convert my local MongoDB into a
  single-node replica set** (`mongod --replSet rs0` on a separate port/dbpath, `rs.initiate()`)
  to test order creation at all — confirmed via the backend's own error log
  (`"Transaction numbers are only allowed on a replica set member or mongos"`) that
  `createOrderFromCart`'s `withTransaction` genuinely requires one; a standalone `mongod` (what
  Section 5's testing had been using, including the one that turned out to be the pre-existing
  shared service) cannot run it at all. This new instance is fully separate from that
  pre-existing shared MongoDB — a mistake I flagged in Section 5 and wanted to actually fix
  here, not repeat. Production MongoDB Atlas already runs as a replica set by default, so this
  is purely a local-dev setup note, not a code change — flagging so whoever sets up CI/local
  dev for other contributors knows a plain standalone Mongo won't run this code path either.
- **"Failed payment leaves cart intact" doesn't apply as literally stated** — confirmed live
  (Section 10) and by reading `order.service.ts` (Section 8 already flagged the price-snapshot
  half of this): the cart is cleared at _order creation_, which happens _before_ any payment
  attempt. By the time a payment could possibly fail, the cart is already empty — there's
  nothing to "lose." The functional equivalent I built instead: the _order_ survives a failed/
  abandoned payment, and retrying (`/checkout/failed/[orderId]` or the order detail page) resumes
  payment on that exact same order rather than requiring the user to rebuild anything or
  creating a duplicate order.
- **One `useRazorpayCheckout` hook, used identically by the checkout page (first attempt), the
  failed-payment page (retry), and the order detail page (retry from account history)** — one
  implementation of "start/resume payment for order X," not three copies with subtly different
  behavior.
- **Payment confirmation is never trusted from the client alone** — the Razorpay `handler`
  callback firing is treated as "a payment attempt happened," not "payment succeeded"; the order
  is only ever shown as paid after `POST /payments/verify` (the backend's HMAC signature check)
  succeeds. This was already how the backend is designed (BACKEND_CONTRACT.md) — noting it here
  explicitly since it's the one rule that most matters not to get wrong in a payment flow.
- **Address book decision (Section 11, resolved earlier) applies directly here**: the checkout
  address form is a one-off entry every time, not a picker over saved addresses — consistent
  with the earlier resolution, not a new gap introduced in this section.
- Built `/account/orders/[id]` (order detail + status timeline) now, ahead of Section 11, since
  the success/failed pages both link to it — a minimal but complete version (Section 11 covers
  the surrounding account area: profile, order list, nav). Noted in Section 11 too so it isn't
  duplicated there.
- Tests (`useRazorpayCheckout.test.tsx`, `CheckoutForm.test.tsx`) mock `window.Razorpay` and the
  payment mutations directly — they verify the _logic_ (correct options passed to Razorpay,
  correct redirect on success/dismiss/failure, submit button disabled during order creation)
  exactly as the checklist's test bullet describes, but this is **not** the same as a real
  Razorpay test-mode run. A genuine "full checkout flow in Razorpay test mode" needs a real
  browser driving the actual Razorpay iframe with a documented test card, which needs both real
  credentials (see above) and a browser automation tool — tracked for Section 17 (E2E) once
  credentials exist, not something a Jest unit test can honestly claim to cover.

## Section 11 — Account area

- **[Rule 4 — backend gap, larger than it first looked] Profile editing is entirely
  unsupported.** Read `src/models/User.ts` and `src/modules/auth/auth.routes.ts` directly (not
  assumed): there is no `phone` field on the `User` model at all — `phone` only exists on the
  `Address` sub-schema (for shipping, per-address) — and there is no `PUT`/`PATCH /auth/me`
  route, only `GET`. So "view/edit name, phone" reduces to "view name" (and email, from the same
  `getMe` response). Built `/account` as a read-only profile view with an honest note rather
  than a form with no endpoint to submit to, or a fake success toast that saves nothing.
  Confirmed live (registered a fresh user, `GET /auth/me`) that the real response has no `phone`
  field, matching the model.
- **Address book stays unbuilt**, per the Section 8 resolution (rule 4) — not re-litigated here.
- **Order detail page was actually finished in Section 10**, not this section — the checkout
  success/failed pages needed somewhere to link to, so `/account/orders/[id]` (status timeline,
  items, shipping address, "Complete payment" for pending/failed orders) was built there. This
  section only added the list view (`/account/orders`) and extracted the shared
  `ORDER_STATUS_LABELS`/`ORDER_STATUS_BADGE_VARIANT` maps (`src/lib/orderStatus.ts`) so the list
  and detail pages don't each define their own copy.
- **Order history pagination uses a manual "Load more" button, not intersection-observer
  infinite scroll** — a deliberate difference from the product grid (Section 6), not an
  inconsistency: an account's order list is a record-lookup UI (find a specific past order),
  where a stable "Load more" makes it easier to keep your place than continuous scroll;
  discovery-oriented product browsing is the opposite case. Same defensive dedupe-by-`_id`
  pattern as the product grid either way, tested the same way (deliberately overlapping mock
  pages).
- **Finally wired the actual logout button** — `useLogoutMutation` (built in Section 4) had no
  UI trigger anywhere until now; `/account`'s "Sign out" calls it and redirects home.
- **`AccountNav`** is a two-item horizontal tab strip (Profile / Orders), not a sidebar — the
  account area only has two destinations right now, so a sidebar would be over-built; revisit
  only if the account area grows more sections later.

## Section 12 — Admin dashboard

- **[Decision, documented in CLAUDE_FRONTEND.md] Built into the same frontend under `/admin/*`**,
  not a separate app — a reasonable default for this project's scale, not a rule-7/rule-4 item
  (no security/data-loss dimension to the choice itself; the actual security-relevant part,
  role-checking, is handled by `AdminRoute` regardless of which architecture was chosen).
- **[Rule 4 — significant backend gap, found before it became a trap] No admin product-list
  endpoint exists at all** — confirmed by reading `admin-product.routes.ts` directly: only
  `POST`, `PUT`, `DELETE`, and the variant sub-routes; no `GET`. And the only product detail
  lookup anywhere (admin or public) is `GET /products/:slug`, which requires `isActive: true`.
  Consequence: **once a product is set `isActive: false`, there is no existing endpoint that can
  ever find it again** — not a hypothetical, verified by reading both the list-query filter and
  the slug-lookup filter. The data isn't lost from the database, but it becomes permanently
  unreachable through this app's API surface. Decided _not_ to expose any "deactivate" control
  in the admin UI as a result — only real `DELETE` (which the backend fully supports and which
  actually works, since delete doesn't depend on being able to look the product up again
  afterwards). The admin product list itself uses the _public_ `getProducts` endpoint (the only
  list endpoint that exists), which means **deactivated products — if any ever exist, e.g. from
  direct DB access — would also be invisible in the admin list**, not just unreachable
  individually. Flagging clearly since this materially limits admin product lifecycle management
  as currently possible; the real fix needs a backend change (an admin list endpoint that doesn't
  filter by `isActive`, and/or a by-id lookup), not a frontend workaround.
- **Edit page fetches by slug, not id** (`/admin/products/[slug]/edit`) — the only viable lookup
  given the gap above. The actual `PUT`/variant mutations still use the fetched product's `_id`
  internally; the slug is purely a URL/lookup convenience, matching the storefront's own PDP
  URL pattern.
- **Found a real bug via schema design, not live testing this time**: initially planned to reuse
  `simpleProductSchema` (which requires `price > 0`) for editing a _variant_ product's base info
  too, defaulting price/stock to 0 in the form. That would have made a variant product's base-info
  edit form permanently invalid (0 fails `.positive()`). Caught before writing the component, by
  noticing the schema requirement while wiring `defaultValues` — split into
  `productBaseFieldsSchema` (name/description/category/fabric/color/isHandloom, shared) and
  `simpleProductSchema extends` it with price/stock/sku, used only for simple products. Two
  sibling form components (`EditSimpleProductForm`/`EditVariantBaseForm`) with modest duplicated
  JSX, rather than one form fighting a schema that doesn't fit both product types.
- **Image upload has no true byte-level progress bar** — `ImageDropzone`'s "progress indicator"
  is the mutation's `isLoading` state (indeterminate), not real upload percentage. RTK Query's
  `fetchBaseQuery` is built on `fetch`, which doesn't expose upload progress at all (only
  `XMLHttpRequest` does) — a real progress bar would need a dedicated XHR-based upload path for
  just this one flow, not a small tweak. Reorder is move-left/move-right buttons, not full
  drag-to-reorder, since a DnD library isn't in `saree-grace-frontend-packages.md` and the
  buttons cover the same functional need for a handful of images per product.
- **Order status update UI only offers backend-valid transitions** — `src/lib/orderStateMachine.ts`
  mirrors `orderStateMachine.ts` exactly (read directly, not inferred). Verified live: a valid
  transition (pending → cancelled) succeeded and correctly restored stock
  (`stockRestored: true` in the response); an invalid one (cancelled → paid) correctly 409'd
  with the exact message the backend produces.
- **Verified the entire admin surface live against the real backend**, not just against mocks:
  logged in as the real seeded admin, confirmed `role: "admin"` via `getMe`, created a category,
  created both a simple product and a variant-product shell + variant (exact request shapes
  matching what the actual mutations send — comma-joined `variantAttributeNames`, JSON-stringified
  `attributes`), walked a real order through the full state machine to `delivered`, created a
  review as the purchasing user and approved it as admin, and pulled real `GET /admin/dashboard`
  stats. Nothing in this list was assumed to work from reading the code alone.
- **Review "reject" is the same `DELETE /admin/reviews/:id` as "delete"** — there's no distinct
  reject state in the backend (confirmed in `BACKEND_CONTRACT.md`), just relabeled contextually
  in the UI (pending queue → "Reject", approved list → "Delete") since that's what each action
  means to an admin in context, even though it's one endpoint underneath.

## Section 13 — Mobile experience pass

- **Honest limitation: no browser or physical device available this session** (the Claude in
  Chrome extension was declined at session start). Every item that the checklist frames as
  "tested at 360px/390px/768px" or "tested on an actual device" was instead verified by a
  systematic code audit (grep for fixed pixel widths, tap-target class sizes, `sizes`/`fill`
  pairing, `inputMode` coverage) — real, but not equivalent to actually looking at the rendered
  page. Flagging clearly rather than checking these off as if a real viewport/device test
  happened.
- **Found and fixed a real tap-target bug via the audit**: `CartLineItem`'s quantity +/- and
  remove buttons were `h-9 w-9` (36px), under the 44px minimum, on a control shoppers use
  frequently on mobile. Bumped to `h-11 w-11`. Every other interactive element audited was
  already ≥44px (or, for native checkboxes, has an adjacent label providing a larger effective
  click target, a standard acceptable pattern).
- **Added `MobileBottomNav`** (Home/Shop/Wishlist/Cart/Account, `lg:hidden`, hidden on `/admin`)
  to satisfy the explicit "sticky/bottom mobile nav" checklist item, on top of the header icon
  approach from Section 8 — these are two different affordances for the same data (tab-bar
  navigation vs. a quick-glance drawer-opening action), not a redundant duplicate. This
  introduced a real, caught-immediately conflict: `react-hot-toast`'s `Toaster` was
  `position="bottom-center"`, which would sit underneath/behind the new fixed bottom nav on
  mobile. Switched to `top-center` globally to avoid it.
- Re-audited every `next/image` usage: all `fill` images have a matching `sizes` prop (one
  apparent mismatch in `ProductCard.tsx` was a false positive from grep matching the Tailwind
  class `fill-maroon-700` on an SVG, not the `Image` prop). Switched `ImageGallery`'s one
  `priority` usage to `preload` (Next 16's replacement — `CLAUDE_FRONTEND.md`), which I'd
  documented as the convention back in Section 0 but hadn't actually applied until auditing now.

## Section 14 — Performance

- **Actually ran Lighthouse against a real production build** (not skipped as "no browser
  available" — Chrome is installed on this machine, `lighthouse` CLI works once pointed at an
  already-running Chrome via a fixed `--remote-debugging-port`, since chrome-launcher's own
  auto-port-detection was failing silently in this environment). Home page: Performance 89,
  Accessibility 90, Best Practices 100, SEO 100.
- **Found and fixed 2 real, measured contrast bugs** as a direct result — not theoretical:
  1. `Badge` "gold" variant (`text-gold-600` on `bg-gold-100`) measured 3.28:1, needs 4.5:1.
     Fixed to `text-maroon-900` (13.50:1). This directly contradicted my own Section 1 rule in
     `CLAUDE_FRONTEND.md` ("gold-600/maroon-900 on a light surface" was presented as safe) —
     corrected that doc too, since the rule itself was wrong, not just one usage of it.
  2. Found by extending the same check to every other `text-gold-*` usage in the codebase
     (computed the WCAG contrast formula directly in Python, not guessed): `text-gold-600` on
     white ("Only N left in stock" / admin low-stock line) measured 3.99:1, fails the 4.5:1 text
     threshold. Fixed the cart/PDP instance by switching to the (now-corrected) `Badge`
     component; fixed the admin dashboard instance with `text-maroon-700`. Star rating icons
     (`fill-gold-500`/`text-gold-500`) measured 2.80:1 against white, failing even the more
     lenient 3:1 _non-text graphic_ threshold that applies to meaningful icons like a rating —
     darkened to `gold-600` (3.99:1, passes 3:1).
  3. `ProductCard`'s and `WishlistItemCard`'s image `<Link>` had no accessible name at all for a
     product with an empty `images` array (no `<img>` renders, so the `alt` text it would have
     provided never exists) — added an explicit `aria-label={product.name}` on the link itself
     so it never depends on the image actually rendering.
- **Lighthouse became flaky after that one successful run** — repeated attempts (fresh Chrome
  profiles, fixed ports, `--headless=new`, `--no-sandbox`) all failed with `NO_FCP` afterward,
  seemingly a local headless-Chrome/OS quirk in this environment rather than anything about the
  site. Rather than re-guess whether the fixes actually worked, **verified the exact contrast
  ratios mathematically** using the real WCAG relative-luminance formula (Python), which doesn't
  need a browser at all and is fully deterministic — confirmed the maroon-900/gold-100 fix
  measures 13.50:1 and the gold-600 star-icon fix measures 3.99:1, both passing. A visual
  re-confirmation via Lighthouse or a real browser is still worth doing when tooling cooperates;
  flagging that the math-based verification, while rigorous, is not a substitute for seeing the
  actual rendered page.
- **`@next/bundle-analyzer` doesn't work with Turbopack** (Next 16's default builder) —
  confirmed by actually running it (`ANALYZE=true npm run build`), which prints "The Next Bundle
  Analyzer is not compatible with Turbopack builds" outright rather than silently producing
  nothing. Tried the suggested Turbopack-native alternative, `next experimental-analyze -o`, but
  its output was a generic bundle-analyzer template app's own shell (title "Next.js Bundle
  Analyzer", default 404 page content), not an analysis of this app — either a bug or a usage
  mistake in this very new/experimental command; not investigated further given the tool's own
  `experimental` status and the diminishing returns of continuing to debug it this session.
  Fell back to a manual, targeted check for the checklist's actual underlying concern ("no
  accidental large dependency sneaking into the client bundle") — grepped every dependency in
  `package.json` for actual usage in `src/`, and found two that are installed but genuinely
  never imported anywhere: `cloudinary-video-player` (`saree-grace-frontend-packages.md` itself
  flagged this one as conditional — "only if showing product videos; skip otherwise," and no
  video feature was ever built) and the `razorpay` npm package (its server-side SDK; the actual
  Razorpay integration correctly loads via the CDN `checkout.js` script per Section 10, so this
  was never needed client-side at all). Removed both. Neither was contributing bytes to any
  actual bundle either way (unused imports aren't bundled), so this is dependency hygiene rather
  than a fix for a real bloat problem — but worth doing, and the kind of thing a real bundle
  analyzer would have surfaced immediately if it had worked.

## Section 15 — SEO & metadata

- **Found and fixed a real broken link while building this section**: `Header`'s "Our Story"
  nav item and `Footer`'s "Our story" link both pointed to `/about`, which never existed —
  a genuine 404 that had been live since Section 5. Built the page now (real, fact-checked copy
  about Elampillai's actual handloom-weaving tradition in Tamil Nadu's Salem district — no
  invented founding dates, awards, or specific claims about Saree Grace itself I have no basis
  for) rather than treating "About page copy" as a from-scratch checklist task disconnected from
  the dead link it was actually fixing.
- **`sitemap.xml`/`robots.txt` needed a real production domain I don't have** — Next's
  `MetadataRoute.Sitemap`/`metadataBase` both require an absolute URL, and no confirmed
  production domain exists for this project (packages.md's `sareegrace.com` was only ever an
  _example_ API URL, not a confirmed frontend domain). Added `NEXT_PUBLIC_SITE_URL` as a new env
  var (defaults to `http://localhost:3000`) rather than guessing/hardcoding a domain — **this
  MUST be set to the real production URL before deploying**, or the sitemap and OG/canonical
  URLs will be wrong in production. Flagging clearly rather than silently shipping a
  localhost-only sitemap.
- **`sitemap.xml` is dynamic and pulls real backend data**, not a static list — paginates through
  `GET /products` (bounded to 20 pages of 50 as a runaway-catalog guard) at request time, so it
  stays correct as products are added/removed without a rebuild. Verified live: it correctly
  listed all 4 real products in the database with accurate `lastmod` timestamps matching their
  actual `updatedAt` values, and a stale-server testing mistake (see below) made this take two
  tries to actually confirm.
- **Testing mistake, caught immediately**: my first live check of `/about`, `/robots.txt`, and
  `/sitemap.xml` all returned 404 — looked like a real bug at first, but the `npm run start`
  I'd just run had actually failed with `EADDRINUSE` (a `pkill` from the previous check hadn't
  finished killing the old server before I tried to start a new one), so I was unknowingly
  testing against a _stale_ server process from before these routes existed. Confirmed via the
  start log and by checking the actual `.next/server/app/` build output (which did have
  `about.html`, `sitemap.xml`, `robots.txt` correctly built) before concluding it was a false
  alarm, not a real failure — force-killed the stale process and re-verified cleanly. Noting
  this not to pad the list, but because "the live check failed" and "the feature is broken" are
  different claims, and conflating them would have been dishonest in the other direction (I
  fixed nothing here — the code was already correct — I fixed my _test setup_).
- **Home page and `/products` listing remain client-rendered, not server components** — this
  checklist item was flagged repeatedly in Sections 5 and 6 (accepted then as a scope tradeoff
  for those sections) and is genuininely not resolved here either. Being explicit about why,
  rather than letting the flag go stale: converting them would mean either (a) duplicating data
  fetching for the same content in both a server component (for initial HTML) and the existing
  RTK Query hooks (for subsequent client-side interactivity/caching), or (b) a larger
  architectural change to hydrate RTK Query's cache from server-fetched data. Both are real,
  scoped pieces of work I chose not to take on as a drive-by fix inside Section 15 — leaving
  this **explicitly incomplete** rather than papering over it. PDP (the highest-value page for
  organic search) already is server-rendered (Section 7), which covers the most
  conversion-relevant case.
- No dedicated category landing pages were built — categories are a `?category=<id>` filter on
  `/products`, matching the backend's own lack of a category-detail endpoint (confirmed in
  Section 6/`BACKEND_CONTRACT.md`). The checklist's "keyword-natural copy on category pages"
  therefore has no dedicated page to place it on; the closest equivalent is the `/products` page
  itself, which is generic (not per-category) copy — flagging this as a real gap against the
  literal checklist wording, not silently reinterpreting it away.

## Section 16 — Accessibility

- **Most of this section's real work already happened in Section 14** — the color-contrast
  checking this section explicitly asks for is exactly what the Lighthouse audit did (found and
  fixed 3 real failing combinations, corrected a wrong rule in `CLAUDE_FRONTEND.md`), and the
  "no accessible name" bug it found (`ProductCard`/`WishlistItemCard` links) is squarely an
  accessibility fix. Not re-doing that work here — cross-referencing it instead of duplicating
  the NOTES entry.
- **New audit for this section**: heading hierarchy (exactly one `<h1>` per page, verified even
  across pages split into server+client component pairs where the `<h1>` lives in a child
  component — home's is in `Hero.tsx`, PDP's is in `ProductDetailClient.tsx`, checked each one
  individually rather than assuming), `outline-none` misuse (none found — every focus-visible
  removal, if any existed, would need a replacement ring alongside it), and every `alt=""`
  usage in the codebase (3 found, all legitimate — thumbnail images inside a button that already
  has its own descriptive `aria-label`, the correct pattern for avoiding redundant screen-reader
  announcements, not an oversight).
- `Modal`/`Drawer`'s hand-rolled focus trap (flagged as worth re-checking back in Section 1) held
  up under this audit — Tab/Shift+Tab cycling and Escape-to-close both work as implemented. Still
  worth a real screen-reader pass (VoiceOver/NVDA) if that tooling becomes available, which this
  session couldn't do — noted as a lower-confidence item in the final summary.

## Section 17 — Testing (E2E gap-fill; component/integration tests were already written per-section)

- **Real bug #1 (major), found via a real Playwright run against the real backend, not
  theorized**: a genuinely logged-in user whose session survives a hard reload could have an
  "Add to cart" / wishlist-toggle / cart qty-update click silently land in the local **guest**
  cart instead of their real server cart. Root cause: `accessToken` is memory-only by design
  (see auth-storage decision below) — on a hard navigation the Redux store resets, and
  `AuthBootstrap`'s silent refresh (`checkingSession()` → `getMe` 401 → `/auth/refresh` → retry)
  takes a real round trip. During that window `authStatus` is `"checking"`, not yet
  `"authenticated"` — but `AddToCartControls`, `useWishlistToggle`, and `useCart` all branched on
  `!isAuthenticated`, which is `true` for `"checking"` exactly the same as it is for a real guest.
  **Fixed** in all three files by adding an explicit `isAuthPending = authStatus === "checking"`
  check that disables the action / blocks the mutation instead of falling through to the guest
  path. Added a Jest regression test (`AddToCartControls.test.tsx`) proving the button is
  disabled and the guest cart stays empty during `"checking"` — full 67-test suite still passes.
- **Real bug #2, found while re-running E2E after fixing #1**: `CartPage.handleCheckout`
  (`src/app/cart/page.tsx`) had the exact same `"checking"`-vs-`"unauthenticated"` conflation, in
  a fourth location the first pass missed — `router.push(isAuthenticated ? "/checkout" :
"/login?redirect=/checkout")` sent a user who clicked "Proceed to checkout" during the
  silent-refresh window straight to `/login`, even though they were about to be confirmed as
  logged in. Fixed by reading `authStatus` directly and only redirecting to `/login` on a
  confirmed `"unauthenticated"`; `"checking"` and `"authenticated"` both go to `/checkout`, where
  `ProtectedRoute` is the single source of truth for waiting out `"checking"`.
- **Real bug #3 (the deepest one), found via a captured network trace, not guessed**:
  `baseQueryWithReauth` (`src/store/api/baseApi.ts`) treated _any_ non-success response from
  `POST /auth/refresh` — not just an invalid-token `401`/`403` — as proof the session was dead:
  it called `clearStoredRefreshToken()` + `dispatch(loggedOut())` unconditionally. The backend's
  `authRateLimiter` shares ONE bucket (`AUTH_RATE_LIMIT_MAX=10` per 15 min) across every
  `/auth/*` route (register/login/refresh/me/...) — confirmed by reading
  `saree_grace_backend/src/modules/auth/auth.routes.ts` (`router.use(authRateLimiter)` at the
  top, before the individual routes). A `429` from that limiter — or any transient `5xx`/network
  failure — got treated identically to "this refresh token is invalid," silently and
  _permanently_ logging out a user whose token was actually still fine, and deleting the token
  they'd need to recover. **Fixed**: only a `401`/`403` from the refresh endpoint itself now
  clears the token and logs out; anything else leaves the stored token and current status
  untouched so the next request gets another real attempt. Also added a bounded (3 attempts,
  exponential backoff) auto-retry in `AuthBootstrap` for exactly this transient-failure case, so
  a real user isn't stranded in `"checking"` indefinitely if the very first boot-time `getMe`
  call hits a blip.
- **This bug was originally masked by my own test methodology**, worth being honest about: my
  first debugging pass ran the E2E suite repeatedly against the SAME local backend process in a
  short window, which itself exhausted the 10-req/15-min `/auth/*` bucket — so the "cart empty at
  checkout" symptom I was chasing was a _mix_ of real bug #3 (confirmed once, via a captured
  `429 POST /auth/refresh` response, that it really does force a false logout) and my own testing
  cadence self-inflicting that same rate limit repeatedly afterward, which made the investigation
  slower than it needed to be. Distinguishing "the code is wrong" from "my test loop exhausted a
  real limiter" took an explicit network-trace capture (a throwaway diagnostic spec, deleted
  after use) rather than continuing to guess from symptoms alone.
- **Real bug #4 (test-adjacent but revealing), also found via a captured trace**: even after
  fixing #1–#3, the "registered user" E2E test's final assertion (expecting a toast matching
  `/Couldn't start payment|Payment couldn't load|Something went wrong/i`) never matched. Traced
  to `saree_grace_backend/src/middlewares/errorHandler.ts`: an unclassified exception (exactly
  what `razorpay.orders.create()` throws against the placeholder credentials in `.env` — not an
  `ApiError`/`ZodError`/Mongoose error) falls through to the generic branch, which always
  returns the fixed string `"Internal server error"` — the real Razorpay message is logged
  server-side only, never returned to the client. `getApiErrorMessage`
  (`src/lib/apiError.ts`) correctly surfaces that body message verbatim rather than
  `useRazorpayCheckout`'s own fallback text ("Couldn't start payment..."). This is **not a
  frontend bug** — the app is doing the right thing (order created, payment attempted, failure
  caught, real error shown) — it's a test that guessed at wording instead of confirming it.
  Fixed the test's assertion to expect the real, verified string.
- **Cross-project E2E flakiness, root-caused rather than dismissed**: running `purchase-journey
.spec.ts` with Playwright's default `fullyParallel: true` intermittently failed only the
  concurrent chromium + mobile-chrome run of the "registered user" test. Confirmed via direct
  observation (not assumption) that this is shared-mutable-state contention, not a code bug —
  the two projects' user journeys hit the SAME real backend process and MongoDB simultaneously,
  contending for the SAME seeded product's stock and the SAME `/auth/*` rate-limit bucket.
  Repeatedly re-running the suite manually during this same debugging session (independent of
  the bug above) drove the seeded "Handloom Cotton Saree - Blue" product's stock from its
  original seed value down to 1 — restocked it to 200 directly in MongoDB (`db.products
.updateOne({slug:...}, {$set:{stock:200}})`) as a test-data fix, not a product fix. Added
  `test.describe.configure({ mode: "serial" })` to the spec file so its own tests never overlap;
  this does not prevent chromium and mobile-chrome (separate Playwright _projects_, separate
  workers) from still running concurrently with each other — full elimination would need
  `workers: 1` in `playwright.config.ts`, which I did not set globally since it would slow down
  future, unrelated E2E work too. **Recommendation, not yet applied**: run this specific spec
  with `--workers=1` (or a per-file project-serialization strategy) in CI for full determinism
  against a single-instance dev backend; the flakiness is real but rare (1 failure in ~8 parallel
  reruns after the fixes above) and its cause is fully understood.
- **Test-only fixes**, unrelated to product bugs, made along the way:
  - `.check()` → `.click()` on the URL-derived "Handloom only" filter checkbox — its `checked`
    state is fully derived from the URL (Section 6), which updates asynchronously via a Next.js
    navigation; `.check()`'s own strict immediate-state assertion doesn't tolerate that, `.click()`
    plus the subsequent URL assertion does.
  - The guest-checkout-redirect assertion expected `/\/login\?redirect=%2Fcheckout/` (percent-
    encoded) but `CartPage.handleCheckout` builds that URL with a literal `"/checkout"`, not
    `encodeURIComponent` — unlike `ProtectedRoute`'s own redirect, which does encode. Both are
    valid URLs browsers treat identically; fixed the test to match the actual (unencoded) one
    rather than "fixing" the app to add encoding it doesn't need here.
  - On mobile viewports the filters live behind a "Filters" bottom-sheet trigger
    (`FilterDrawer.tsx`) instead of the desktop's always-visible sidebar (`FilterPanel.tsx`); the
    guest-flow test now opens it first on mobile and scopes its checkbox locator to the open
    dialog (the desktop `<aside>` copy of the same `FilterPanel` is always in the DOM, just
    CSS-hidden below `lg`, so an unscoped locator is ambiguous once the drawer is open). Also
    switched the drawer-trigger locator to `exact: true` — without it, `name: "Filters"`
    substring-matched `FilterPanel`'s own always-present "Clear filters" button too, which is
    visible on desktop and caused a real, reproducible misdetection of desktop as mobile.
- **Diagnostic-only files deleted after use** (per the established pattern from Section 5's
  `live-check.test.tsx`): a `debug-cart.spec.ts` that captured live `/cart` and `/auth` network
  responses, and later button-visibility/page-content timing, to get direct evidence for bugs #1
  and #3 rather than continuing to guess from symptoms. Neither is part of the permanent suite.
- **Local dev-environment adjustment, reverted before finishing**: temporarily raised
  `saree_grace_backend/.env`'s `AUTH_RATE_LIMIT_MAX` (10→2000) and `RATE_LIMIT_MAX` (300→5000) so
  my own repeated manual E2E reruns during this debugging session didn't keep re-triggering the
  very rate limiter bug #3 was about — restarted the backend process for each change (env vars
  are read once at process boot, not hot-reloaded). **Both were restored to their original
  values (10 and 300) and the backend restarted again before finishing this section** — verified
  the full `purchase-journey.spec.ts` suite still passes cleanly at those original, stricter
  limits.
- Not run this session (no tooling available, same limitation noted in Sections 14/16): visual
  regression screenshots, and a real screen-reader pass. Cross-browser coverage is Chromium-
  engine only (`chromium` + `mobile-chrome` Playwright projects) — no Firefox/WebKit run.

## Section 18 — Error handling & edge cases

- **`src/app/error.tsx` (new)** — the App Router's global error boundary. Checked the actual
  installed docs first (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/
error.md`) rather than assuming the classic API from training data — this version's stable
  prop is **`retry`**, not `reset` (`reset` still exists but the docs explicitly say "in most
  cases, use `retry()` instead"; `retry` became stable in exactly this project's version,
  v16.3.0, per the doc's own version-history table). Renders _inside_ the root layout, so
  Header/Footer/theme all stay put around it — verified live, not assumed, after discovering
  `curl` can't observe it at all: a Server Component's thrown error streams to the client as a
  bare `{digest}` (production intentionally hides the real message — confirmed this matches the
  docs' own claim) and the fallback UI only appears after client-side hydration processes it, so
  raw HTML never contains the fallback text. Wrote a throwaway Playwright check (deleted after
  use, same pattern as the debug specs in Section 17) against a real `next build && next start`
  to get an actual browser executing the JS, and confirmed the maroon/gold heading, "Try again"
  button, and Header/Footer all render correctly.
- **`src/app/global-error.tsx` (new)** — only reached if the root layout itself throws
  (`StoreProvider`/`AuthBootstrap`/etc.). Per the docs, this replaces the entire document and
  does **not** get `globals.css` — confirmed in the doc text itself ("global-error... render
  their own document and do not include your global styles"), so its maroon/gold colors are
  inlined directly from the same hex values as `globals.css`'s `--color-maroon-*`/`--color-
gold-*` tokens rather than relying on Tailwind classes that wouldn't be guaranteed to load
  here.
- **Real, systemic bug found and fixed across four places**: `useCart`, the wishlist page, and
  the order-history page all treated a **failed** fetch identically to a **genuinely empty**
  result — `isLoading` becoming `false` with no data made `isEmpty`/`"no orders yet"` fire for a
  real network error just as much as for an actual empty cart/wishlist/order history. This is
  exactly the gap the checklist calls out by listing "network failure states" and "empty states"
  as separate line items — they were silently conflated. Fixed by exposing `isError` + `refetch`
  from each hook/query and adding an explicit error branch (checked _before_ the empty-state
  branch) in `CartPage`, `CartDrawer`, `WishlistPage`, and `OrderHistoryContent`. `ProductGrid`
  already had an `isError` branch (Section 6) but no way to actually retry — added one. Built one
  shared `<ErrorState>` primitive (`src/components/ui/ErrorState.tsx`) since the same title +
  message + retry-button shape repeats across all four rather than four bespoke versions.
- **Session expiry mid-checkout — verified handled by existing architecture, not new work**:
  traced the actual failure path rather than assuming. The cart itself is server-side once
  authenticated (`BACKEND_CONTRACT.md`), tied to the user's account, not the access token — so an
  expired access token can never lose cart _contents_, only interrupt one in-flight request. If
  the access token expires while the user is mid-checkout, `baseQueryWithReauth` (Section 17's
  bug #3 fix) transparently refreshes and retries the original request — the user typically never
  notices, and the order still goes through. Only if the _refresh_ token is also genuinely dead
  does `loggedOut()` fire; `CheckoutForm.onSubmit`'s existing `catch` surfaces that as a real,
  visible `submitError` (not a crash or a silent hang), and `ProtectedRoute` — which stays mounted
  around `CheckoutForm` the whole time — reacts to that same status change and redirects to
  `/login` on its own. Nothing needed building here; documenting the trace so this doesn't get
  re-flagged as an open gap later.
- **Not re-touched**: `not-found.tsx` (root) already exists from Section 7 and already covers
  invalid product slugs via `notFound()` on the PDP — verified it's still the same file, no
  further action needed here. No dedicated "invalid category slug" case exists because categories
  aren't their own route (Section 6/15's `?category=<id>` filter, not a `/categories/[slug]`
  page) — same accepted gap already flagged in Section 15, not duplicating that flag here.

## Section 19 — Deployment & ops

- **Environment variables per environment (dev/staging/prod) — not buildable, honestly flagged**:
  this requires a real hosting account (Vercel or otherwise) to configure per-environment
  values in. Nothing exists to configure yet. What IS done: every env var the app needs is
  documented in `.env.local.example` with inline comments on which ones are placeholders
  (Razorpay/Google/Cloudinary/GA4/Sentry — no real credentials for any of them, consistent with
  every prior section) vs. which MUST be a real value before deploying (`NEXT_PUBLIC_SITE_URL`,
  flagged since Section 15). Whoever provisions hosting needs to carry these over.
- **CI pipeline (new)**: `.github/workflows/ci.yml` — lint → type-check → test → build, on push/PR
  to `main`. A real GitHub remote already exists for this repo, so this is immediately usable,
  unlike the items above. Verified each step actually runs clean from a state matching a fresh CI
  checkout, not just "should work": deleted `.next` and reran `npm run typecheck` (`next typegen`
  regenerates the route types it needs from nothing) and `npm run build` from scratch, and ran
  `npm test -- --ci` directly, all green. Set dummy (non-secret, no real backend behind them)
  `NEXT_PUBLIC_API_BASE_URL`/`NEXT_PUBLIC_SITE_URL` env vars in the workflow because `src/lib/
env.ts` validates these at module-load time and `next build` evaluates every route's modules
  even for routes that don't fetch real data at build time.
  - **Deploy step deliberately NOT included** — needs a real hosting target and its deploy
    secrets, neither of which exist. Left as an explicit, commented gap in the workflow file
    itself, not silently omitted.
  - **E2E (`e2e/purchase-journey.spec.ts`) deliberately NOT run in CI** — it needs a real running
    backend + MongoDB, which this repo alone can't provide in a GitHub-hosted runner without
    also checking out `saree_grace_backend` and standing up a MongoDB replica set service
    container (Section 5's MongoDB-needs-a-replica-set finding still applies). Flagging this as
    a real gap rather than faking a green run.
- **Analytics (GA4) — real code, no real property**: `src/lib/analytics.ts` (typed
  `trackViewItem`/`trackAddToCart`/`trackPurchase` helpers) + `<GoogleAnalytics>`
  (`src/components/analytics/GoogleAnalytics.tsx`, mounted in `layout.tsx`) load gtag.js and wire
  the three events the checklist names, at their actual real trigger points: `view_item` on PDP
  mount (`ProductDetailClient.tsx`), `add_to_cart` on both the guest and authenticated add-to-cart
  paths (`AddToCartControls.tsx`), `purchase` on the order-confirmation page
  (`checkout/success/[orderId]/page.tsx`). All of it is a no-op while
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset (same placeholder-credential pattern as
  Razorpay/Cloudinary/Sentry) — verified live: `curl`'d the homepage and confirmed no
  `googletagmanager` script is present with the var unset, rather than assuming the conditional
  works.
  - **Real bug caught and fixed while building this**: a naive `purchase` event on the success
    page would double-count real revenue on a page refresh or revisit of
    `/checkout/success/[orderId]`, since GA4's client-side `gtag.js` does not itself dedupe a
    repeated event with the same `transaction_id`. Fixed with a `sessionStorage`-backed guard in
    `trackPurchase` keyed on `order.orderNumber` (survives exactly a refresh, which is the case
    this guards against) — covered by a Jest test asserting a second call for the same order
    doesn't fire a second `gtag` call.
- **Error monitoring (Sentry) — real SDK installed and wired, no real project**: added
  `@sentry/nextjs` (10.69.0) as a real dependency. Read the installed SDK's own build output
  before wiring anything, rather than trusting training data — confirmed this version has fully
  moved off `sentry.server.config.ts`/`sentry.edge.config.ts` (zero references in its build) in
  favor of the standard Next.js `instrumentation.ts` `register()`/`onRequestError` hooks
  (`src/instrumentation.ts`), and explicitly deprecates `sentry.client.config.ts` in favor of
  `instrumentation-client.ts` (`src/instrumentation.ts`'s sibling) with a direct warning that the
  old file "will no longer work" under Turbopack — this project's actual default builder per
  AGENTS.md, so using the old convention would have been a real, silent breakage. `error.tsx` and
  `global-error.tsx` both now call `Sentry.captureException` alongside the existing
  `console.error`. Everything is gated on `NEXT_PUBLIC_SENTRY_DSN` (unset — no real Sentry project
  exists); `next.config.ts`'s `withSentryConfig` sourcemap-upload options (`org`/`project`/
  `authToken`) are similarly unset build-time secrets, `silent: true` so their absence doesn't
  spam build output. Fixed two real deprecation warnings the build itself surfaced on the first
  attempt (heeded per AGENTS.md, not ignored): removed `disableLogger` (deprecated, and its
  replacement `webpack.treeshake.removeDebugLogging` explicitly isn't supported under Turbopack
  either — no working equivalent currently exists for this builder, so this is an accepted small
  regression in bundle size, not a bug); added the required `onRouterTransitionStart` export the
  SDK asks for to instrument App Router navigations. Verified the actual production error.tsx
  render (not just "should work"): a real `next build && next start` plus a throwaway Playwright
  check (deleted after use) proved the themed fallback and Header/Footer render correctly for a
  server-thrown error — confirmed along the way that `curl` alone can't observe this at all,
  since a Server Component's error only streams to the client as a bare `{digest}` and the
  fallback text only appears after client hydration processes it.
- **Core Web Vitals — instrumentation wired, "monitored" is a process, not a one-time deliverable**:
  `src/components/analytics/WebVitals.tsx` uses `next/web-vitals`'s `useReportWebVitals` (current
  API for this Next.js version, confirmed against its bundled docs) and forwards every metric to
  GA4 using the exact pattern Next's own documentation recommends for this. This is real,
  functioning collection code — but "monitored post-launch" genuinely means an ongoing process
  (a live dashboard, alert thresholds, a review cadence) that can only start once this is
  actually deployed with real traffic hitting it. Being explicit that wiring the collector and
  running the monitoring process are two different things, and only the first is something this
  session could actually do.
- **A real, reusable finding from all the E2E re-verification this section needed**: repeatedly
  re-running `purchase-journey.spec.ts` (to confirm Sections 18/19's changes didn't regress
  anything) surfaced a THIRD real behavior worth documenting precisely, beyond the already-known
  Razorpay-credentials gap: with the placeholder key, `POST /payments/create-order` is
  **nondeterministic** — sometimes the backend's `razorpay.orders.create()` call is rejected by
  Razorpay's real API (→ the already-documented "Internal server error" toast), and sometimes
  Razorpay's API accepts the syntactically-valid-looking fake test key and returns a real order
  id, at which point `checkout.js` opens Razorpay's own actual, live-hosted Test Mode checkout
  widget (confirmed via a captured frame trace — `traffic_env=production`, a "Test Mode" badge,
  real Razorpay/Stripe-fraud-detection iframes) — a completely legitimate, safe outcome (their
  sandbox UI, not a real payment rail, no card ever entered by the test), just a _different_ one
  than the error-toast case. Fixed the test to accept either outcome
  (`Promise.any` on "error text visible" vs. "Razorpay iframe attached" — not `.or()`, which
  Playwright disallows combining with a frame-derived locator, and not `Promise.race`, which
  would let the test pass even if BOTH conditions time out) rather than continuing to assume the
  error-toast path was the only valid one.

## Section 20 — Final pre-launch review

- **Every item above checked off and verified, not just implemented** — did an actual final
  verification pass rather than trusting prior checkmarks: fresh-clone simulation (below), a full
  `lint` → `typecheck` → `jest` → `next build` → `playwright test` (real backend, restarted to
  get a clean rate-limit window) run, and a live `curl` sweep of one representative page from
  every major area (`/`, `/products`, a real PDP, `/about`, `/sitemap.xml`, `/robots.txt`,
  `/cart`, `/wishlist`, `/login`, `/register`, `/admin`, `/account`, `/style-guide`) — all 200,
  all clean.
- **Fresh clone + `.env.local` setup — actually run, not assumed**: this repository has **zero
  git commits** (confirmed via `git log`/`git status` — everything is still untracked, despite a
  real GitHub remote already being configured). A literal `git clone` therefore can't be tested
  yet; simulated the equivalent instead — copied the whole tree (excluding `node_modules`/
  `.next`/`.git`) to a scratch directory, deleted `.env.local` (gitignored, never present after a
  real clone) but kept `.env.test` (`.gitignore` explicitly says to keep it tracked), then ran
  `npm install` → copied `.env.local.example` to `.env.local` per the README → `lint` →
  `typecheck` → `test` (78/78) → `build` → `dev` (served `/` with a real 200) from that directory,
  start to finish. Found and fixed one real gap this surfaced: **`README.md` was still the
  untouched `create-next-app` boilerplate** — it never mentioned `.env.local.example`, that a
  real backend + MongoDB replica set + seed data are required, or which scripts exist. Rewrote it
  with actual setup steps, prerequisites, a script table, and a pointer to NOTES.md for the
  deployment gaps. The zero-commits state itself is flagged below, not fixed — committing is the
  user's call, not mine to make unilaterally.
- **All copy proofread** — grepped the entire `src/` tree for `lorem ipsum`, `TODO`/`FIXME`/`XXX`,
  and literal `"Product Name"`-style placeholders: none found.
- **Maroon/gold theme consistent across every page, including error/empty/loading states** —
  re-checked specifically the NEW error/empty states this session added (Section 18):
  `error.tsx`, `global-error.tsx`, the shared `<ErrorState>`, `CartDrawer`'s new error branch —
  all use the same maroon-9xx/maroon-6xx tokens (or, for `global-error.tsx`, the same hex values
  inlined, since it can't load `globals.css`) as everywhere else. Grepped the whole `src/` tree
  for non-palette Tailwind colors (`red-`/`blue-`/`gray-`/etc.): the only hits are the
  already-established, deliberate semantic exceptions from earlier sections — red for form
  validation errors/destructive actions, green for the order-success checkmark — not new stray
  colors, and not something to re-litigate here.
- **Real Razorpay test-mode transaction completed successfully end-to-end from the actual UI —
  still blocked, and now flagged more precisely than before**: no real Razorpay account/test-mode
  credentials exist (repeatedly flagged since Section 10). Section 19's re-verification work
  additionally established that even the current placeholder key produces a genuinely
  nondeterministic result at the order-creation step (a real backend error some of the time, a
  real live Razorpay Test Mode widget opening other times) — but actually _completing_ a
  transaction (entering a real test card, receiving a real webhook, `verifyPayment` succeeding)
  needs an actual Sentry — sorry, actual **Razorpay** test-mode merchant account, which this
  session has never had access to at any point.
- **Full purchase journey tested on a real mobile device, not just browser dev tools — not
  done, cannot be done from here**: no physical device and no browser/device automation tool was
  available this entire session (`claude-in-chrome` was declined at the start). The Playwright
  `mobile-chrome` project (Pixel 7 viewport + UA emulation) is the closest substitute actually
  exercised, repeatedly, throughout Sections 17–20 — but it is emulation, not a real device, and
  should not be reported as equivalent.

## Modernization pass (2026-09-28) — assumptions & flags for human review

Full audit and implementation report: `MODERNIZATION_AUDIT.md`.

- **Removed the mobile bottom tab bar** (`MobileBottomNav`, Section 13). The header now carries
  menu/search/wishlist/cart on phones and the hamburger menu has account/orders. Reason: it took
  64px of permanent screen space and collided with the new PDP sticky purchase bar. Reversible —
  flagging because it was an explicit earlier checklist item.
- **Removed the free-text Fabric / Colour filter inputs** — replaced in the production-readiness
  pass below by catalogue-driven option lists (`/products/facets`).
- **Added the "In stock only" filter** — the backend already supported `inStockOnly`.
- **Cart no longer shows a shipping fee.** `useCart` used a "free over ₹999, else ₹99" rule that
  the backend never applies (it charges ₹40–₹130 by state, `computeShippingFee`). The cart now
  says "Calculated at checkout"; checkout computes the real fee once a state is chosen.
- **Price sort was broken on the backend — fixed in the production-readiness pass below.**
- **Product 404s are real 404s now.** With ISR (`generateStaticParams` returning `[]`),
  `notFound()` returns HTTP 404 — the earlier note that this route "can't return a real 404
  status" no longer applies.
- **Descriptions are Markdown.** Most live product descriptions use `##`, `**bold**` and `*`
  lists; a small server-side converter (`markdownToHtml` in `lib/richText.ts`) renders them, and
  the output still goes through `sanitize-html`.
- `DEFAULT_WHATSAPP_NUMBER` in `lib/whatsapp.ts` is still the placeholder "for testing" number —
  set `NEXT_PUBLIC_WHATSAPP_NUMBER` before launch.
- Hero photography: `/images/hero/slide_1.webp` (desktop) and `/hero-saree-model.webp` (mobile),
  art-directed with `getImageProps`. Unused old hero/banner files in `public/images/hero` were
  left in place (not shipped unless referenced).
- `e2e/purchase-journey.spec.ts` — now run against a local sandbox; see "Running E2E safely".

## Production-readiness pass (2026-09-29)

Full report: `MODERNIZATION_AUDIT.md` → "Production-readiness pass".

- **Price sorting fixed (backend).** Persisted `Product.sortPrice` + `(value, _id)` keyset cursor;
  `top_rated` had the same cursor bug and is fixed too. Verified on a read-only copy of the real
  catalogue. **The Atlas backfill has NOT been run** (owner decision): run
  `npm run migrate:sort-price -- --dry-run`, then without `--dry-run`, against Atlas before (or
  right after) deploying — until then every existing product sorts as ₹0.
- **Atlas side effect to know about:** during testing, the hot-reloading dev backend (connected to
  Atlas via `.env`) restarted with the new model and Mongoose `autoIndex` created the two new
  indexes on the Atlas `products` collection (`isActive_1_sortPrice_1__id_-1`,
  `category_1_isActive_1_sortPrice_1__id_-1`). No documents were modified. The indexes are
  needed by the deployed code anyway; drop them only if you roll the change back.
- **Colour filter** is built from `/products/facets` (real values on active variants, with
  counts and the variants' own swatch hex). **Fabric** is hidden: the catalogue has one fabric
  value in total, and it's "Pink" — a data-entry error on one variant's `fabric` attribute.
  Colour names also have near-duplicates from spelling ("grey"/"gray", "lavender"/"lavander",
  "voilet") that show as separate options until the data is cleaned.
- **Catalogue SEO content (owner):** several products share identical admin SEO titles /
  descriptions (the three "Kubera Pattu Saree" listings, `kalyani-cotton-sarees` vs `-3`,
  `soft-silk-sarees` vs `-4`, and the fancy-silk product vs its category). Two titles exceed 70
  characters. Over-long descriptions are now trimmed at a word boundary automatically; titles are
  left as entered.
- **Empty categories** (Bridal, Cotton, Couple Combos, Kerala Cotton, Silk Cotton, Wedding — no
  active products) are `noindex, follow` and excluded from the sitemap until they have products.
- **Outage behaviour:** pages already generated keep serving their last good copy while the API
  is down (ISR). A product/category page that has never been generated returns Next's plain 500
  until the API is back — rendering a fallback instead would get cached and could be indexed.
- **WhatsApp number — launch blocker.** No real number exists in the project config or docs.
  `lib/whatsapp.ts` still falls back to the placeholder `DEFAULT_WHATSAPP_NUMBER`, and the
  floating button uses it whenever `NEXT_PUBLIC_WHATSAPP_NUMBER` is unset. Set the env var.
- **Coupons:** `lib/coupons.ts` exists but checkout has no coupon field and the backend has no
  coupon support — nothing to verify.

### Running E2E safely

Never against Atlas — the spec creates orders and accounts. A sandbox that worked:

1. Local replica-set MongoDB (transactions need it):
   `mongod --dbpath <dir> --port 27027 --replSet rs0` then `rs.initiate()`.
2. Optionally copy the catalogue read-only from Atlas (categories/occasions/products/reviews),
   then `npm run migrate:sort-price` against the local DB.
3. `npm run seed` in the backend with `MONGODB_URI` pointing at the local DB (seed accounts are
   pre-verified; override `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` with throwaway values).
4. Backend with `PORT=4100`, the local `MONGODB_URI`, a matching `CORS_ORIGINS`, and **empty**
   `EMAIL_*`, `RAZORPAY_*`, `CLOUDINARY_*`, `GOOGLE_CLIENT_ID` (email is then stubbed, and
   checkout stops at the Razorpay boundary — the spec accepts that).
5. Frontend built/started with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4100/api/v1`, then
   `E2E_BASE_URL=<frontend url> npm run test:e2e` (one worker — the specs share one customer).
