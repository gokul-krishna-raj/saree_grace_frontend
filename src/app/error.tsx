"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Renders inside the root layout (Header/Footer/theme all stay put) — this only catches errors
// thrown by a page/nested layout below it, not the root layout itself (see global-error.tsx for
// that). Sentry.captureException is a safe no-op when no DSN is configured (instrumentation-
// client.ts) — console.error stays too, since local dev has no Sentry project to look at.
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="font-heading text-maroon-900 text-2xl">Something went wrong</h1>
      <p className="text-maroon-600 max-w-sm text-sm">
        We hit a snag loading this page. Please try again.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={retry}
          className={cn(buttonVariants({ variant: "primary" }))}
        >
          Try again
        </button>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          Go home
        </Link>
      </div>
    </main>
  );
}
