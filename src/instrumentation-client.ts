import * as Sentry from "@sentry/nextjs";

import { env } from "@/lib/env";

// Section 19 — client-side error monitoring. `instrumentation-client.ts`, not the older
// `sentry.client.config.ts`: the installed SDK (10.x) explicitly deprecates that file and warns
// it stops working under Turbopack (this project's default builder, per AGENTS.md) — confirmed
// by reading the SDK's own bundled build output, not assumed from prior Sentry versions.
// No real Sentry project exists yet (NOTES.md) — Sentry.init() is skipped entirely rather than
// initializing against an empty/fake DSN.
if (env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1,
  });
}

// Required for the SDK to instrument App Router navigations (route-change breadcrumbs/spans) —
// the build emits an explicit "ACTION REQUIRED" warning without this export.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
