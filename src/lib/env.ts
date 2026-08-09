import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional().default(""),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional().default(""),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional().default(""),
  // Not in saree-grace-frontend-packages.md's original env list — added for the footer/home
  // WhatsApp contact link (Section 5). Optional: no real business number has been provisioned
  // yet, so the link is hidden rather than pointing at a fabricated one — see NOTES.md.
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional().default(""),
  // Added in Section 15 for sitemap.xml / metadataBase, which both need an absolute URL — no
  // real production domain has been confirmed for this project, so this defaults to localhost
  // rather than a guessed domain. MUST be set to the real production URL before deploying —
  // see NOTES.md.
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default("http://localhost:3000"),
  // Section 19 — error monitoring. No real Sentry project exists yet (same placeholder-
  // credential situation as Razorpay/Cloudinary, see NOTES.md); left empty, Sentry.init() is
  // skipped entirely when unset (instrumentation-client.ts / instrumentation.ts) rather than
  // initializing against a fake DSN.
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional().default(""),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
