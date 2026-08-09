import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

import { ProductListingClient } from "./ProductListingClient";

export function generateMetadata(): Metadata {
  return {
    title: "Shop Sarees",
    description: "Browse sarees and designer pieces from Saree Grace.",
    // Filtered/paginated variants of this page should not compete with the canonical, unfiltered
    // listing for search ranking (checklist Section 15) — every query-string variant points back
    // at the plain /products URL.
    alternates: { canonical: "/products" },
  };
}

export default function ProductsPage() {
  return (
    <main className="flex-1 py-6">
      <h1 className="font-heading text-maroon-900 px-4 pb-4 text-2xl">Shop Sarees</h1>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4 px-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <ProductListingClient />
      </Suspense>
    </main>
  );
}
