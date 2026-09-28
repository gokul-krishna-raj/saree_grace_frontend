// Sends an error to Sentry *only* when a DSN is configured, loading the SDK on demand. With no
// DSN (the current setup) `process.env.NEXT_PUBLIC_SENTRY_DSN` is inlined as "" at build time,
// this branch is dead code, and the Sentry SDK never enters the client bundle.
export function reportError(error: unknown) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
}
