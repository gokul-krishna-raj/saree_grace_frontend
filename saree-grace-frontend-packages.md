# Saree Grace Frontend — Packages & Initial Setup

Reference this alongside `saree-grace-frontend-checklist.md`. Give this file to Claude
Code at project start so it scaffolds with the right dependencies from day one instead
of adding them piecemeal.

## Create the project

```bash
npx create-next-app@latest saree-grace-frontend \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd saree-grace-frontend
```

## Core dependencies

```bash
# State management
npm install @reduxjs/toolkit react-redux redux-persist

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# UI primitives & styling helpers
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react              # icon set
npm install embla-carousel-react      # touch-friendly carousels (hero, product images)
npm install react-hot-toast           # toast notifications

# Images / media
npm install cloudinary-video-player   # only if showing product videos; skip otherwise

# Payments
npm install razorpay                  # types/helpers if needed client-side (checkout script itself loads via next/script)

# Auth (Google SSO on the frontend)
npm install @react-oauth/google

# Data fetching helpers (RTK Query handles most of this, but useful for non-API async bits)
npm install date-fns                  # date formatting (order dates, tracking timeline) — lighter than moment.js

# Charts (admin dashboard)
npm install recharts

# Dev/testing
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
npm install -D @playwright/test
npm install -D @next/bundle-analyzer
npm install -D prettier eslint-config-prettier prettier-plugin-tailwindcss
```

## Why these, specifically

- **Redux Toolkit + RTK Query** over plain Redux or a separate fetch library — RTK Query gives
  you caching, invalidation, and loading states for free, which is most of what a storefront needs.
- **redux-persist** — keeps cart/wishlist state across page reloads for guest users.
- **react-hook-form + zod** — matches the Zod validation already used on the backend; you can
  even share validation schemas between frontend and backend if you set up a shared package later.
- **embla-carousel-react** over Swiper — smaller bundle, good touch support, fits the
  performance goals in the checklist.
- **@react-oauth/google** — simplest way to get a Google Sign-In button wired to your backend's
  `/auth/google` endpoint, which expects the ID token.
- **date-fns** over moment.js — moment.js is legacy and bloats the bundle; date-fns is tree-shakeable.
- **recharts** — lightweight enough for the admin dashboard's stat charts without pulling in a
  heavier charting library.

## Tailwind theme starting point (maroon + gold)

Add to `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      maroon: {
        50: '#FBEAEC',
        100: '#F0C4CA',
        200: '#E19AA5',
        400: '#B24A5C',
        600: '#7A2635',
        700: '#5E1D29',
        900: '#3A1218',
      },
      gold: {
        50: '#FDF8EC',
        100: '#F8E8BE',
        400: '#D9A94A',
        500: '#C4922E',
        600: '#A5771F',
      },
      cream: '#FAF6F0', // warm off-white background, not stark white
    },
    fontFamily: {
      heading: ['var(--font-heading)', 'serif'],
      body: ['var(--font-body)', 'sans-serif'],
    },
  },
}
```

Load fonts in `app/layout.tsx` via `next/font/google` (e.g. a serif like Playfair Display or
Cormorant for headings, paired with Inter or Poppins for body text) and expose them as CSS
variables (`--font-heading`, `--font-body`) matching the config above.

## Environment variables (`.env.local.example`)

```
NEXT_PUBLIC_API_BASE_URL=https://api.sareegrace.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

Keep anything secret (Razorpay key _secret_, not key _id_) strictly on the backend — never
prefix real secrets with `NEXT_PUBLIC_`, since that exposes them to the browser bundle.
