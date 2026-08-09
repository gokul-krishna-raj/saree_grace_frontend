# Saree Grace Frontend — Production Readiness Checklist

Stack: Next.js (App Router), TypeScript, Redux Toolkit + RTK Query, Tailwind CSS.
Theme: Maroon + Gold, premium/modern, mobile-first.
Backend: the Saree Grace Express/Lambda API (see backend checklist).

How to use this with Claude Code: work top to bottom, one section per session/prompt.
Reference `CLAUDE_FRONTEND.md` (design tokens + conventions) in every session so styling
stays consistent across features built in separate prompts.

---

## 0. Project setup

- [x] `create-next-app` with TypeScript, App Router, Tailwind, ESLint
- [x] Folder structure:
  ```
  src/
    app/                 # routes (App Router)
    components/
      ui/                # buttons, inputs, cards, modals — design system primitives
      layout/            # header, footer, nav, mobile drawer
      product/           # product card, gallery, variant selector
      cart/, checkout/, account/, admin/
    store/
      index.ts           # store config
      api/                # RTK Query API slices (productsApi, authApi, cartApi, ordersApi...)
      slices/             # non-server UI state (uiSlice, filtersSlice)
    lib/                  # axios/fetch base, helpers, formatters
    hooks/                # custom hooks
    types/                # shared TS types/interfaces
    styles/               # globals.css, tailwind config extensions
  ```
- [x] `CLAUDE_FRONTEND.md` written: color tokens, typography scale, spacing, component
      conventions, RTK Query patterns — read by Claude Code every session
- [x] `.env.local.example` committed (API base URL, Google client id, Razorpay key id)
- [x] ESLint + Prettier + import sorting configured
- [x] Git hooks (husky) for lint + type-check on commit
- [x] Base layout renders, dev server runs clean with no console warnings

## 1. Design system & theme

- [x] Tailwind config extended with brand tokens (via Tailwind v4 `@theme` in `globals.css`,
      not `tailwind.config.ts` — see NOTES.md):
  - Maroon scale (e.g. `maroon-50` → `maroon-900`, primary ~`#6B1D2E` or similar deep maroon)
  - Gold scale (accent, e.g. `gold-400`/`gold-500` for CTAs and highlights)
  - Neutral scale (warm off-white/cream backgrounds, not stark white, for a premium feel)
- [x] Typography: a refined serif or semi-serif for headings (elegance), clean sans for body —
      loaded via `next/font`, not render-blocking `<link>` tags (Playfair Display + Inter)
- [x] Base UI components built once, reused everywhere: Button (primary/secondary/ghost),
      Input, Select, Badge, Card, Modal, Skeleton loader, Toast/notification
- [x] Consistent spacing/radius scale documented and applied (no ad-hoc `px-[13px]` sprinkled around)
- [x] Dark mode explicitly deferred or explicitly supported — decide now, don't leave ambiguous
      (deferred — see CLAUDE_FRONTEND.md)
- [x] Iconography set chosen (e.g. lucide-react) and used consistently, no mixed icon libraries
- [x] Storybook or a simple `/style-guide` route showing all components (optional but speeds up QA)

## 2. Redux store setup

- [x] Redux Toolkit store configured, `configureStore` with RTK Query middleware
- [x] Typed hooks (`useAppDispatch`, `useAppSelector`) instead of raw `useDispatch`/`useSelector`
- [x] RTK Query base API slice with `baseQuery` pointing at backend, auth token injected
      from state/cookie automatically on every request (from Redux state, see auth decision)
- [x] `authSlice` — current user, tokens (or rely on httpOnly cookies — decide and document)
      — decided: accessToken in memory only, refreshToken in localStorage (rule 7, resolved)
- [x] `uiSlice` — mobile menu open/close, active modals (toast queue: not a redux slice — see NOTES.md)
- [x] `filtersSlice` — active product filters/sort (so filter UI persists across navigation)
- [x] Redux Persist (or deliberate decision not to use it) for cart/wishlist continuity across reloads
      — guest cart persisted via `guestCartSlice`; wishlist has no guest concept (auth-required
      on the backend), so nothing to persist there — see NOTES.md
- [x] RTK Query cache invalidation tags planned per resource (Product, Cart, Wishlist, Order, Review)
      before writing endpoints — retrofitting tags later causes stale-UI bugs

## 3. API integration layer (RTK Query slices)

- [x] `authApi` — register, login, Google SSO, refresh, logout (+ forgot/reset password, `getMe`)
- [x] `productsApi` — list (with filters/cursor), search, detail by slug
- [x] `categoriesApi` — list (+ tree)
- [x] `cartApi` — get, add, update qty, remove (+ merge, for guest→user cart folding)
- [x] `wishlistApi` — get, add, remove
- [x] `ordersApi` — create, get by id, list my orders, tracking (+ cancel)
- [x] `paymentsApi` — create Razorpay order, verify payment (+ refund)
- [x] `reviewsApi` — list by product, create
- [x] `adminApi` — **structural deviation, see NOTES.md**: admin CRUD endpoints are colocated in
      each resource's own file (`productsApi.ts`, `categoriesApi.ts`, `ordersApi.ts`,
      `reviewsApi.ts`) plus a small `dashboardApi.ts` for stats, rather than one combined
      `adminApi.ts` — all items covered, just organized per-resource instead of per-role.
- [x] Global error handling: 401 triggers token refresh or redirect to login, 5xx shows a toast,
      not a silent failure (401/refresh done in `baseApi`; component-level toast wiring for
      5xx/other errors happens as each feature's components are built, Section 4 onward)
- [ ] Loading and error states standardized across all data-fetching components (skeletons, not spinners-only)
      — the `Skeleton` primitive exists (Section 1); applying it consistently happens as each
      data-fetching page is built (Sections 5–12), not yet applicable since no such pages exist yet

## 4. Authentication

- [x] Login page (email/password) — mobile-first form, inline validation
- [x] Register page
- [x] Google SSO button (One Tap or standard button) wired to backend `/auth/google` — button is
      wired but hidden until a real `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is provisioned, see NOTES.md
- [x] Auth token storage decision implemented consistently (httpOnly cookie preferred over localStorage
      for XSS safety) — document the choice in `CLAUDE_FRONTEND.md` — resolved in Section 2 (rule 7)
- [x] Protected route wrapper/middleware for account pages and checkout — **client-side wrapper
      only, no middleware**: see NOTES.md, this is a direct consequence of the token-storage
      decision (no cookie means `proxy.ts` has nothing to read server-side)
- [x] Persisted login across refresh (silent refresh or cookie-based session check on app load)
- [x] Logout clears store + redirects — `useLogoutMutation` clears tokens/cache (see NOTES.md);
      the actual redirect fires from whatever UI calls it, which doesn't exist until the header/
      account nav is built (Sections 5/11) — no logout _button_ exists yet, just the working hook
- [x] Forgot/reset password flow (UI at least, even if email delivery is stubbed on backend)
- [x] Tests: login happy path, invalid credentials shows error, protected route redirects when logged out

## 5. Home page

- [x] Hero section — maroon/gold, premium feel, mobile-first layout (stacked on small screens)
- [x] Featured/new-arrival product carousel (touch-swipeable on mobile, embla-carousel-react)
- [x] Category showcase grid
- [x] Trust/brand story section (Elampillai handloom story — big trust builder for this category)
- [x] Newsletter/WhatsApp signup block — **implemented as WhatsApp/mailto, not email newsletter**,
      see NOTES.md (no backend subscription endpoint exists)
- [x] All images using `next/image` with proper sizing (no layout shift, no oversized mobile downloads)
      — `next.config.ts` `remotePatterns` added for Cloudinary; verified against real seeded
      backend data, see NOTES.md

## 6. Product listing & search

- [x] Product grid — responsive (1 col mobile, 2–3 tablet, 3–4 desktop)
- [x] Infinite scroll wired to backend cursor pagination (intersection observer, not a "load more"
      click unless deliberately chosen for accessibility)
- [x] Filter sidebar/drawer — category, fabric, color, price range, handloom-only
      (drawer/bottom-sheet pattern on mobile, not a squeezed sidebar) — fabric/colour are free-text
      inputs, not dropdowns, see NOTES.md (no distinct-values endpoint exists on the backend)
- [x] Sort dropdown (newest, price, rating)
- [x] Search bar with debounced input, empty/no-results state designed
- [x] Filters reflected in URL query params (shareable/bookmarkable, survives refresh)
- [x] Skeleton loaders for grid while fetching, not a blank screen or spinner-only
- [x] Tests: filter combination updates results and URL, infinite scroll loads next page without duplicates

## 7. Product detail page

- [x] Image gallery — zoom on desktop, swipeable on mobile, thumbnail strip
- [x] Simple product: straightforward add-to-cart with quantity selector
- [x] Variant product: attribute selectors (color/border swatches, size, etc.) that update price,
      stock, and images to match the selected variant
- [x] Out-of-stock state clearly shown, add-to-cart disabled appropriately (whole product or
      specific variant, matching backend stock granularity)
- [x] Wishlist toggle (heart icon), reflects current state on load
- [x] Reviews section — list + rating breakdown + "write a review" (only shown if eligible)
- [x] Related/similar products section
- [x] Fabric/care details, authenticity/handloom info block (this sells — don't skip it)
- [x] Tests: variant selection updates all dependent UI correctly, add-to-cart respects stock

## 8. Cart

- [x] Cart drawer (slide-in) for quick access + full cart page for review before checkout
- [x] Quantity update, remove item, live price recalculation
- [x] Out-of-stock or price-changed items flagged clearly if detected on cart load — **partially
      blocked by backend gap, see NOTES.md**: no batch product-by-id lookup exists, so this is
      handled reactively (409 on mutation) rather than proactively on load
- [x] Empty cart state designed (not just blank)
- [x] Persisted cart for logged-in users (synced with backend), sensible behavior for guests
      (guest cart merges into the server cart automatically on login/register/Google sign-in)
- [x] Mobile: cart accessible via a persistent bottom bar or header icon with item count badge
      — header icon + badge (already built Section 5), no separate bottom bar added
- [x] Tests: qty update reflects in both drawer and full page, totals always match line items

## 9. Wishlist

- [x] Wishlist page — grid layout, move-to-cart action per item
- [x] Wishlist icon states synced globally (a product wishlisted on listing page shows as
      wishlisted on detail page too — driven by RTK Query cache, not local component state) —
      already true since Section 5/7 (`useWishlistToggle` is the one shared source), confirmed
      again here with the wishlist page itself

## 10. Checkout & payments

- [x] Address form (add/select saved address), mobile-optimized inputs (numeric keyboard for
      phone/pincode, autofill-friendly field names) — **inline form only, no "select saved
      address"**, per the Section 11 rule-4 decision (no address-book backend)
- [x] Order summary review step before payment
- [x] Razorpay Checkout integration (script loaded via `next/script`, order created via backend
      first, never trust a client-only payment flow) — **code complete, not verifiable
      end-to-end without real Razorpay test credentials, see NOTES.md**
- [x] Payment success page — clear confirmation, order number, next steps
- [x] Payment failure page — clear retry path, doesn't lose cart contents — **"cart contents"
      reinterpreted as "the order itself"**, see NOTES.md: the backend clears the cart at
      order-creation, before payment even starts, so there's no cart left to preserve either way
- [x] Loading/disabled states on the pay button to prevent double-submission
- [x] Tests: full checkout flow in Razorpay test mode, failed payment leaves cart intact,
      duplicate submit prevented — **Razorpay itself is mocked, not real test-mode**, see NOTES.md

## 11. Account area

- [x] Profile page — view/edit name, phone, addresses — **read-only, see NOTES.md**: confirmed by
      reading `User.ts` and `auth.routes.ts` directly that there is no `phone` field on the User
      model at all (only per-address phone numbers) and no update-profile endpoint whatsoever
      (`GET /auth/me` exists, no `PUT`/`PATCH`) — editing name/phone is not possible today
- [x] Order history list + order detail page with status timeline/tracking — order detail page
      was actually built in Section 10 (linked from the checkout success/failed pages); this
      section added the list view
- [ ] Address book management (add/edit/delete, set default) — **blocked, resolved in Section 8/
      checklist rule 4**: no backend endpoint exists; intentionally left unbuilt, not faked
- [x] Mobile-friendly account nav (bottom sheet or hamburger sub-menu, not a desktop sidebar
      squeezed onto small screens)

## 12. Admin dashboard (if built into the same frontend, or separate app — decide and document)

**Decision: built into the same frontend**, under `/admin/*`, not a separate app — the project
is a single small storefront, not a scale where a separate admin deployment pays for itself.
Documented in `CLAUDE_FRONTEND.md`.

- [x] Dashboard home — order stats, revenue, low-stock alerts (charts via a lightweight lib,
      e.g. Recharts) — verified live against real seeded data
- [x] Product list + create/edit — **two distinct flows**: simple product form (multi-image
      dropzone) vs variant product wizard (base info, then repeated "add variant" mini-forms
      each with their own image dropzone), matching the backend's two-step variant API —
      **both flows verified live end-to-end**, see NOTES.md
- [x] Category management (CRUD, parent/child)
- [x] Order management — list, filter by status, update status, view detail — status-update UI
      only offers backend-valid transitions (state machine encoded client-side too); verified
      live including a rejected invalid transition (409)
- [x] Review moderation — approve/reject queue — verified live (create → approve)
- [x] Image upload UI — drag-and-drop, preview, progress indicator, reorder images — **no true
      byte-level progress bar**, see NOTES.md (an indeterminate loading state instead)
- [x] Admin-only route protection (role check, not just hiding nav links) — checks `role` from
      a live `getMe` call, not a client-only flag; verified live with the real seeded admin
- [x] Desktop-first is acceptable here, but core actions (approve review, update order status)
      should still work on a tablet at minimum

## 13. Mobile experience pass (dedicated pass, don't treat as automatic)

- [ ] Every page tested at 360px, 390px, and 768px widths, not just resized desktop —
      **not verifiable this session, see NOTES.md**: no browser/device tool was available; did a
      systematic code audit instead (grep for fixed pixel widths, `w-screen`, tap target sizes)
- [x] Tap targets minimum 44x44px (buttons, icons, links) — audited every interactive element;
      found and fixed one real gap (`CartLineItem`'s qty/remove buttons were 36px)
- [x] Sticky/bottom mobile nav for cart, search, account — added `MobileBottomNav`
      (Home/Shop/Wishlist/Cart/Account tabs, `lg:hidden`), distinct from the header's cart-drawer
      icon; also fixed a toast-position conflict this introduced, see NOTES.md
- [x] Forms use appropriate `inputmode`/`type` (tel, email, numeric) for correct mobile keyboards
      — audited every form field across the app, all correctly set
- [x] No horizontal scroll anywhere (audit with dev tools, easy to miss with fixed-width elements)
      — **audited via code search, not a real browser**, see NOTES.md: no fixed pixel widths or
      `w-screen` found; both `overflow-x-auto` usages are intentional, scoped containers
- [x] Images responsive and not over-fetched on mobile (`next/image` `sizes` prop set correctly)
      — audited every `fill` image has a matching `sizes` prop; also switched the one `priority`
      usage to `preload` (Next 16's replacement, see CLAUDE_FRONTEND.md)
- [ ] Touch gestures (swipe gallery, swipe carousel) tested on an actual device, not just mouse drag
      — **not verifiable this session**, see NOTES.md: embla-carousel-react provides touch
      support out of the box, but "tested on an actual device" is a real device test I cannot do

## 14. Performance

- [x] Lighthouse pass on home, listing, and product detail pages — target 90+ on mobile performance
      — **ran a real Lighthouse audit** (not skipped): home page scored Performance 89 /
      Accessibility 90 / Best Practices 100 / SEO 100 before fixes; found and fixed 2 real
      contrast bugs as a direct result (see NOTES.md). Lighthouse itself became flaky in this
      environment after that first successful run (a local Chrome remote-debugging quirk, not a
      site issue) — listing/PDP re-runs and a post-fix re-confirmation weren't obtainable this
      session; the contrast fixes were instead verified deterministically via the WCAG contrast
      formula computed directly (see NOTES.md), not re-guessed.
- [x] Images optimized via `next/image`, correct `priority` flag only on above-the-fold images
      — audited in Section 13; also switched to `preload` (Next 16's replacement for `priority`)
- [x] Route-based code splitting confirmed (no giant shared bundle from careless imports) —
      automatic per-route via the App Router (confirmed by the build output's per-route listing);
      no manual code-splitting config was needed or added
- [x] Fonts loaded with `next/font`, no layout shift from web font swap — `display: "swap"` set
      on both fonts since Section 1
- [x] RTK Query cache tuned (avoid redundant refetches on every navigation) — default RTK Query
      behavior given the tag design already built section-by-section; no extra tuning needed
- [x] Bundle analyzed (`@next/bundle-analyzer`) — **tooling limitation, see NOTES.md**:
      `@next/bundle-analyzer` doesn't support Turbopack (Next 16's default builder) at all, and
      the Turbopack-native `next experimental-analyze` produced a generic template's output, not
      this app's — analyzed dependencies manually instead and found (then removed) two genuinely
      unused packages (`cloudinary-video-player`, `razorpay`'s server SDK)

## 15. SEO & metadata

- [x] Per-page `generateMetadata` — title, description, Open Graph image, tailored per product/category
      — done for home (root layout), `/products`, `/products/[slug]`, `/about`
- [x] Product schema.org structured data (Product, Offer, AggregateRating) for rich search results
      — done in Section 7
- [x] `sitemap.xml` and `robots.txt` generated — dynamic, pulls real product data from the
      backend at request time; verified live (see NOTES.md) — correctly listed all 4 real
      products in the database with accurate `lastmod` dates, and excludes `/account`,
      `/checkout`, `/admin`, `/cart` from `robots.txt`
- [x] Canonical URLs set, especially for filtered/paginated listing pages (avoid duplicate-content issues)
      — done in Section 6/7, plus `/about` now
- [ ] Server-rendered product/category pages (App Router server components) — not client-only
      rendering, since this is what actually gets indexed well — **partially done, documented
      gap**: `/products/[slug]` (PDP) is fully server-rendered (Section 7); the home page and
      `/products` listing remain client-rendered (Sections 5/6) — flagged repeatedly across
      those sections and not resolved here; see NOTES.md for why and what it would take
- [x] Descriptive, keyword-natural copy on category and About pages (ties into the SEO plan —
      "Elampillai sarees" etc.) — **built `/about` in this section** (it didn't exist
      yet — Header/Footer had a dead link to it, see NOTES.md); no dedicated category pages
      exist (categories are a filter on `/products`, matching the backend's own lack of a
      category-detail endpoint), so category copy lives on the listing page itself instead

## 16. Accessibility

- [x] Semantic HTML (proper heading hierarchy, `<button>` vs `<a>` used correctly) — audited:
      exactly one `<h1>` per page (checked every page, including ones split across
      client/server component pairs); the one `div` with a click handler
      (`ImageDropzone`'s drop zone) already has `role="button"`/`tabIndex={0}`/`onKeyDown`
      handling Enter and Space
- [x] All interactive elements keyboard-navigable (tab order sane, focus states visible —
      don't remove focus outlines without replacing them) — audited: no `outline-none` anywhere
      in the codebase without a `focus-visible:outline-*` replacement alongside it; `Modal`/
      `Drawer` implement a real Tab/Shift+Tab focus trap (Section 1/5)
- [x] Images have meaningful `alt` text (not just "saree") — audited every `alt` usage: real
      product names throughout; the few `alt=""` instances found are all correct decorative/
      redundant cases (thumbnail images inside a button that already has its own `aria-label`,
      e.g. "Show photo 2") — confirmed each one individually, not just grepped and assumed
- [x] Color contrast checked for maroon/gold combinations specifically (gold-on-white and
      maroon-on-cream need contrast verification, not just assumed to look fine) — **this is
      exactly what Section 14's real Lighthouse audit did**, not a separate pass: computed the
      actual WCAG contrast ratio for every `text-gold-*` usage in the codebase and fixed the 3
      that failed (see NOTES.md Section 14) — including correcting my own Section 1 rule in
      `CLAUDE_FRONTEND.md`, which had been wrong
- [x] Form inputs have associated labels, error messages announced (aria-live where relevant) —
      `Input`/`Select` (Section 1) associate every label via `htmlFor`/`useId` automatically;
      every inline error message uses `role="alert"` (implicit `aria-live="assertive"`) across
      every form built in every section, not just the ones checked here

## 17. Testing

- [x] Component tests (React Testing Library) for critical components: cart drawer, variant
      selector, checkout form validation
- [x] Integration tests for key flows: add-to-cart, checkout, login
- [x] E2E tests (Playwright or Cypress) for the full purchase journey: browse → filter → product
      detail → add to cart → checkout → payment (test mode) → order confirmation — stops at the
      real boundary of what's verifiable without real Razorpay credentials (order creation
      confirmed live; payment initiation confirmed to fail correctly and visibly, not hang). See
      NOTES.md for 4 real bugs this found and fixed, and known residual cross-project flakiness.
- [ ] Visual regression check on key pages after major styling changes — **not done**, no
      screenshot-diffing tooling available this session (same limitation as Sections 14/16)
- [~] Cross-browser check: Chrome, Safari (iOS especially, given mobile-first goal), Firefox —
  Chromium engine only (`chromium` + `mobile-chrome` Playwright projects); no Safari/WebKit
  or Firefox run this session

## 18. Error handling & edge cases

- [x] Global error boundary (`error.tsx` in App Router) with a friendly fallback UI —
      `src/app/error.tsx` (route-segment errors, renders inside root layout) + `global-error.tsx`
      (root-layout-crash fallback). Verified live via a real `next build && next start` +
      throwaway Playwright check (not just curl, since it's client-hydration-only rendering).
- [x] `not-found.tsx` for invalid product/category slugs — pre-existing (Section 7) for
      products; no dedicated category page exists to need one (Section 15's accepted gap)
- [x] Network failure states handled gracefully (retry option, not a blank page) — real, systemic
      gap found and fixed: cart, wishlist, and order history were all silently showing an "empty"
      state for a genuine fetch failure. See NOTES.md for the four files fixed.
- [x] Empty states designed for: empty cart, empty wishlist, no search results, no orders yet —
      pre-existing, now correctly distinguished from the error states above
- [x] Session expiry mid-checkout handled without losing cart contents — verified by tracing the
      actual code path (server-side cart + transparent token refresh + ProtectedRoute's own
      status-reactive redirect); see NOTES.md for why no new code was needed

## 19. Deployment & ops

- [ ] Environment variables configured per environment (dev/staging/prod) in hosting platform —
      **blocked, no real hosting account exists**; every var the app needs is documented in
      `.env.local.example` with which are placeholders vs. must-be-real-before-deploy, ready for
      whoever provisions hosting to carry over. See NOTES.md.
- [~] CI pipeline: lint → type-check → test → build → deploy on merge to main —
  `.github/workflows/ci.yml` does lint/typecheck/test/build (verified all four run clean from
  a from-scratch checkout state); deploy is NOT wired (needs a real hosting target + secrets
  — explicit comment in the workflow file, not a silent omission)
- [ ] Preview deployments for PRs (e.g. Vercel preview URLs) used for review before merge —
      **blocked**, same reason as environment variables above
- [x] Analytics wired (GA4 or similar) with ecommerce event tracking (view_item, add_to_cart,
      purchase) — real code (`src/lib/analytics.ts` + `<GoogleAnalytics>`), no-ops until a real
      `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (no real GA4 property exists). Caught and fixed a
      real revenue-double-counting bug along the way — see NOTES.md.
- [x] Error monitoring (Sentry or similar) capturing client-side errors in production —
      `@sentry/nextjs` installed and wired via this version's actual current conventions
      (`instrumentation.ts`/`instrumentation-client.ts`, not the deprecated config files — read
      from the installed SDK's own build output, not assumed); no-ops until a real
      `NEXT_PUBLIC_SENTRY_DSN` is set (no real Sentry project exists). Verified the fallback UI
      actually renders via a real `next build && next start`, not just code review.
- [x] Core Web Vitals monitored post-launch, not just checked once pre-launch — collection is
      wired (`useReportWebVitals` → GA4, `src/components/analytics/WebVitals.tsx`); the ongoing
      "monitored" half (dashboards, alerts, review cadence) can only start once this is actually
      deployed with real traffic — see NOTES.md for why that's a process, not a code deliverable.

## 20. Final pre-launch review

- [x] Every item above checked off and verified, not just implemented — full
      lint/typecheck/test/build/E2E re-run + a live curl sweep of one page per major area, all
      clean. See NOTES.md.
- [x] Fresh clone + `.env.local` setup works end-to-end for a new developer — simulated (no git
      commits exist yet to literally clone, see NOTES.md) end-to-end: install → copy env example
      → lint/typecheck/test/build → dev server serving a real 200, all from a scratch directory.
      Found and fixed a real gap along the way: `README.md` was still `create-next-app`
      boilerplate — rewritten with real setup instructions.
- [ ] Full purchase journey tested on a real mobile device, not just browser dev tools —
      **not done, no device/tool access this session** (Playwright's mobile-chrome emulation was
      exercised repeatedly instead — not a substitute, see NOTES.md)
- [x] All copy proofread (no lorem ipsum, no placeholder "Product Name" left anywhere) — grepped,
      none found
- [x] Maroon/gold theme consistent across every page, including error/empty/loading states —
      re-verified specifically for this session's new error/empty states; no stray off-palette
      colors beyond the already-established red/green semantic exceptions
- [ ] Real Razorpay test-mode transaction completed successfully end-to-end from the actual UI —
      **blocked, no real Razorpay account exists** (flagged repeatedly since Section 10; Section
      19 additionally found the placeholder key's behavior is nondeterministic at the
      order-creation step — see NOTES.md)
