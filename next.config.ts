import withBundleAnalyzerFactory from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product/category/review images are uploaded to Cloudinary by the backend
    // (BACKEND_CONTRACT.md) — `images.domains` is removed in Next 16, remotePatterns is
    // required regardless.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }],
  },
};

const withBundleAnalyzer = withBundleAnalyzerFactory({
  enabled: process.env.ANALYZE === "true",
});

// Section 19 — sourcemap upload only runs with a real SENTRY_AUTH_TOKEN (a CI/deploy secret,
// not a NEXT_PUBLIC_ var — never set in this local dev environment); `silent: true` avoids
// noisy warnings about that being absent, and no build behavior changes when Sentry is
// unconfigured (see instrumentation.ts / instrumentation-client.ts).
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
});
