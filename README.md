# Saree Grace — Frontend

Next.js (App Router, Turbopack) storefront for Saree Grace, an e-commerce site selling
Elampillai handloom sarees. Talks to a separate Express/Mongoose backend
(`../saree_grace_backend`) over a REST API — see `BACKEND_CONTRACT.md` for the contract as
actually implemented there, and `CLAUDE_FRONTEND.md` for this project's own conventions
(design tokens, RTK Query patterns, component conventions).

## Prerequisites

- Node.js 20+
- The backend repo (`saree_grace_backend`) running separately, with its own MongoDB — this app
  makes real API calls, nothing here is mocked. A MongoDB **replica set** is required (not a
  standalone `mongod`): the backend uses transactions, which standalone MongoDB rejects. See the
  backend repo's own setup docs.
- The backend's `npm run seed` script run at least once, so `/products/handloom-cotton-saree-blue`
  (used by `e2e/purchase-journey.spec.ts`) and other seeded data actually exist.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_API_BASE_URL` — required. The backend's base URL, e.g.
  `http://localhost:4000/api/v1`.
- Everything else is optional and defaults to disabled/empty — `NEXT_PUBLIC_GOOGLE_CLIENT_ID`,
  `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_SENTRY_DSN`,
  `NEXT_PUBLIC_WHATSAPP_NUMBER` each gate a real feature (Google sign-in, Razorpay checkout, GA4
  analytics, Sentry error monitoring, the footer WhatsApp link) that silently no-ops without a
  real value — see the comments in `.env.local.example` and `NOTES.md` for which of these are
  genuinely unresolved (no real account/credentials provisioned yet) vs. just optional.
- `NEXT_PUBLIC_SITE_URL` — defaults to `http://localhost:3000`; **must** be set to the real
  production domain before deploying (used for `sitemap.xml` and canonical/OG URLs).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | What it does                                                    |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Dev server (Turbopack)                                          |
| `npm run build`     | Production build                                                |
| `npm run start`     | Serve a production build (run `build` first)                    |
| `npm run lint`      | ESLint                                                          |
| `npm run typecheck` | Regenerates Next's route types, then `tsc --noEmit`             |
| `npm test`          | Jest — component/integration tests, no backend required         |
| `npm run test:e2e`  | Playwright — needs the real backend (see Prerequisites) running |
| `npm run analyze`   | Production build with the bundle analyzer on                    |

`npm run test:e2e` starts its own frontend dev server automatically
(`playwright.config.ts`), but assumes the backend + MongoDB are already up and seeded — it does
not start or seed them.

## Deployment

No hosting platform is set up for this project yet — see `NOTES.md` Section 19 for exactly
what's blocked (environment variables per environment, preview deployments) vs. what's already
done and usable as-is (`.github/workflows/ci.yml`: lint/typecheck/test/build on every push/PR to
`main`; a deploy step is intentionally left out until a real hosting target exists).
