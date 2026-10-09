// Public (NEXT_PUBLIC_*) config. Everything here ends up in the browser bundle — never put a
// secret in this file.
//
// Deliberately validated by hand rather than with zod: this module is imported by client code
// (baseApi, analytics), and pulling zod in just to check a handful of strings added a ~64 KB
// (gzipped) chunk to every page.

function optional(value: string | undefined, fallback = ""): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function url(name: string, value: string | undefined, fallback?: string): string {
  const resolved = optional(value, fallback);
  try {
    new URL(resolved);
  } catch {
    throw new Error(`Invalid environment variable ${name}: expected a URL, got "${resolved}"`);
  }
  return resolved.replace(/\/$/, "");
}

export const env = {
  NEXT_PUBLIC_API_BASE_URL: url("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: optional(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: optional(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optional(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
  // Meta Pixel; <MetaPixel/> and its track* helpers are no-ops while unset.
  NEXT_PUBLIC_META_PIXEL_ID: optional(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  // Search Console / Meta Business domain-verification meta tags; each omitted while unset.
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: optional(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
  NEXT_PUBLIC_META_DOMAIN_VERIFICATION: optional(process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION),
  // Footer/home WhatsApp contact link; also the footer's "Call us" number. Hidden when unset.
  NEXT_PUBLIC_WHATSAPP_NUMBER: optional(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  // Single source of truth for the support address (footer, contact page, signup fallback).
  NEXT_PUBLIC_CONTACT_EMAIL: optional(
    process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    "sareesgrace@gmail.com",
  ),
  // Footer social links — each icon is hidden individually while its URL is unset, rather than
  // linking to a fabricated profile.
  NEXT_PUBLIC_INSTAGRAM_URL: optional(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  NEXT_PUBLIC_FACEBOOK_URL: optional(process.env.NEXT_PUBLIC_FACEBOOK_URL),
  NEXT_PUBLIC_YOUTUBE_URL: optional(process.env.NEXT_PUBLIC_YOUTUBE_URL),
  // Canonical production domain — used for canonical/OG URLs, sitemap and JSON-LD.
  NEXT_PUBLIC_SITE_URL: url(
    "NEXT_PUBLIC_SITE_URL",
    process.env.NEXT_PUBLIC_SITE_URL,
    "https://www.sareegrace.in",
  ),
  // Error monitoring; Sentry.init() is skipped entirely while unset.
  NEXT_PUBLIC_SENTRY_DSN: optional(process.env.NEXT_PUBLIC_SENTRY_DSN),
} as const;
