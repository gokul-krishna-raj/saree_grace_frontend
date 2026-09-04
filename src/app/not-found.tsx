import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Page Not Found (404)",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-heading text-maroon-700 text-5xl">404</p>
      <h1 className="font-heading text-maroon-900 text-2xl">We couldn&apos;t find that page</h1>
      <p className="text-maroon-600 max-w-sm text-sm">
        The saree or page you&apos;re looking for may have moved or sold out.
      </p>
      <Link href="/products" className={cn(buttonVariants({ variant: "primary" }))}>
        Continue shopping
      </Link>
    </main>
  );
}
