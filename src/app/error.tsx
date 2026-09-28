"use client";

import Link from "next/link";
import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { reportError } from "@/lib/reportError";

// Renders inside the root layout (Header/Footer/theme all stay put) — this only catches errors
// thrown by a page/nested layout below it, not the root layout itself (see global-error.tsx for
// that). reportError is a no-op when no DSN is configured (lib/reportError.ts) —
// console.error stays too, since local dev has no Sentry project to look at.
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    reportError(error);
  }, [error]);

  return (
    <main className="container-page flex flex-1 flex-col items-center justify-center py-20 text-center lg:py-28">
      <p className="eyebrow mb-4">Something went wrong</p>
      <h1 className="text-heading-xl text-foreground max-w-xl">We couldn&apos;t load this page</h1>
      <p className="text-muted-foreground mt-4 max-w-md text-[15px] leading-relaxed">
        It&apos;s usually a brief connection problem on our side. Please try again — your cart is
        saved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={retry} className={cn(buttonVariants())}>
          Try again
        </button>
        <Link href="/products" className={cn(buttonVariants({ variant: "outline" }))}>
          Shop all sarees
        </Link>
      </div>
      <Link
        href="/contact"
        className="text-muted-foreground hover:text-foreground mt-6 text-sm underline underline-offset-4"
      >
        Still not working? Contact us
      </Link>
    </main>
  );
}
