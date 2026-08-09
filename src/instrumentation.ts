import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

import { env } from "@/lib/env";

// Section 19 — server/edge error monitoring, via the standard Next.js instrumentation.ts hooks
// (docs: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/
// instrumentation.md) rather than the legacy sentry.server.config.ts/sentry.edge.config.ts —
// the installed SDK's build output has no reference to either file anymore, only to this
// convention. A Sentry DSN is not a secret (safe to reuse the public one server-side); no real
// project exists yet, so init is skipped entirely when unset (see NOTES.md).
export function register() {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1,
  });
}

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) return;
  await Sentry.captureRequestError(...args);
};
