// Client-side error monitoring (Section 19). `instrumentation-client.ts`, not the older
// `sentry.client.config.ts`: the installed SDK (10.x) deprecates that file under Turbopack.
//
// The SDK is imported dynamically and only when NEXT_PUBLIC_SENTRY_DSN is set. The value is
// inlined at build time, so with no DSN (no real Sentry project exists yet — NOTES.md) the whole
// branch is eliminated and none of the SDK ships to the browser; a static
// `import * as Sentry` used to add it to every page regardless.
type SentryModule = typeof import("@sentry/nextjs");

let sentry: SentryModule | undefined;

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  void import("@sentry/nextjs").then((mod) => {
    sentry = mod;
    mod.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1,
    });
  });
}

// Required for the SDK to instrument App Router navigations (route-change breadcrumbs/spans).
export function onRouterTransitionStart(
  ...args: Parameters<SentryModule["captureRouterTransitionStart"]>
) {
  sentry?.captureRouterTransitionStart(...args);
}
