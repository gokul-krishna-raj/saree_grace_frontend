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

## Design tokens (maroon / gold / cream — premium, mobile-first)

Tailwind v4 is CSS-first in this project (`@tailwindcss/postcss`, no `tailwind.config.ts`).
Tokens are defined via `@theme` in `src/app/globals.css`, not a JS config file — this is a
deliberate deviation from `saree-grace-frontend-packages.md`'s `tailwind.config.ts` snippet,
which targets Tailwind v3. See NOTES.md for the full note.

```css
@theme {
  --color-maroon-50: #fbeaec;
  --color-maroon-100: #f0c4ca;
  --color-maroon-200: #e19aa5;
  --color-maroon-400: #b24a5c;
  --color-maroon-600: #7a2635;
  --color-maroon-700: #5e1d29;
  --color-maroon-900: #3a1218;

  --color-gold-50: #fdf8ec;
  --color-gold-100: #f8e8be;
  --color-gold-400: #d9a94a;
  --color-gold-500: #c4922e;
  --color-gold-600: #a5771f;

  --color-cream: #faf6f0;

  --font-heading: var(--font-playfair);
  --font-body: var(--font-inter);
}
```

Usage: `bg-maroon-700`, `text-gold-500`, `bg-cream`, `font-heading`, `font-body` — these
become real Tailwind utilities automatically (Tailwind v4 `@theme` vars are utility-generating).

- **Primary CTA**: `bg-maroon-700 text-white hover:bg-maroon-900`.
- **Accent/highlight** (gold): badges, ratings, "handloom certified" marks, hover underlines —
  never large fill areas (gold-on-gold or gold-on-white body text fails contrast, see below).
- **Background**: `bg-cream` for page backgrounds, plain white (`bg-white`) for cards/surfaces
  sitting on cream, so cards visually lift off the page.
- **Contrast rule** (Section 16 accessibility depends on this) — **corrected in Section 14 after
  a real Lighthouse audit failed the original version of this rule**: `gold-600` text on a
  `gold-*` background measures 3.28:1 (needs 4.5:1) — it is NOT actually safe, despite being the
  darkest gold shade, and the original guidance here was wrong. Use `text-maroon-900` for any
  text sitting on a gold background (the `Badge` "gold" variant does this). Never
  `gold-400`/`gold-500` text on white either. **Don't trust this rule by eyeballing a shade name
  — verify any new gold-on-light combination with an actual contrast checker (or Lighthouse)
  before shipping it**, the same way this correction was found.
- Radius scale: `rounded-lg` (8px) default for cards/inputs, `rounded-full` for pills/avatars.
  No ad-hoc arbitrary values (`rounded-[7px]`) — if the scale doesn't have it, that's a signal
  to use a scale value, not to invent one.
- Spacing: stick to Tailwind's default scale (4px steps). No `px-[13px]`-style arbitrary
  spacing.

## Typography

- Headings: **Playfair Display** (serif, elegant) via `next/font/google`, CSS var `--font-playfair`.
- Body: **Inter** (clean sans) via `next/font/google`, CSS var `--font-inter`.
- Loaded once in `src/app/layout.tsx`, exposed as CSS vars, consumed via `font-heading`/`font-body`
  Tailwind utilities — never a render-blocking `<link>` tag.

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
