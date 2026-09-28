"use client";

import Link from "next/link";
import { useRef } from "react";

import { ProductCard } from "@/components/product/ProductCard";
import { buttonVariants } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useProductFilters } from "@/hooks/useProductFilters";
import { cn } from "@/lib/cn";
import { LISTING_CARD_SIZES } from "@/lib/imageSizes";
import type { ParsedProductFilters } from "@/lib/validation/productFilters";
import type { Product } from "@/types";

// Anything narrowing the list beyond the page's own scope (its fixed category).
function hasActiveFilters(filters: ParsedProductFilters): boolean {
  return Boolean(
    filters.occasions?.length ||
    filters.fabric ||
    filters.color ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.handloomOnly ||
    filters.inStockOnly,
  );
}

const GRID_CLASS = "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4";

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="shimmer aspect-[4/5] rounded-md" />
      <div className="shimmer h-3.5 w-4/5 rounded" />
      <div className="shimmer h-3.5 w-1/3 rounded" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <SkeletonGroup label="Loading sarees" className={GRID_CLASS}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </SkeletonGroup>
  );
}

export function ProductGrid({
  filters,
  initialItems,
  initialNextCursor,
}: {
  filters: ParsedProductFilters;
  initialItems?: Product[];
  initialNextCursor?: string | null;
}) {
  const { items, isLoading, isFetchingMore, isError, isFetching, hasMore, loadMore, refetch } =
    useInfiniteProducts(filters, initialItems, initialNextCursor);
  const { setFilters } = useProductFilters();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useIntersectionObserver(sentinelRef, loadMore, { rootMargin: "600px" });

  if (isLoading) return <GridSkeleton />;

  if (isError && items.length === 0) {
    return (
      <ErrorState
        title="Couldn't load sarees"
        message="Check your connection and try again."
        onRetry={refetch}
        isRetrying={isFetching}
      />
    );
  }

  if (items.length === 0) {
    const isFiltered = hasActiveFilters(filters);
    return (
      <div className="bg-cream flex flex-col items-center gap-3 rounded-md px-6 py-16 text-center">
        <p className="font-display text-foreground text-2xl">
          {filters.q
            ? `No sarees match “${filters.q}”`
            : isFiltered
              ? "No sarees match these filters"
              : "No sarees here yet"}
        </p>
        <p className="text-muted-foreground max-w-sm text-sm">
          {filters.q
            ? "Check the spelling, or try a broader word like “silk” or “cotton”."
            : isFiltered
              ? "Try removing a filter or widening the price range."
              : "New pieces for this collection are on the way. In the meantime, explore the rest of our sarees."}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {isFiltered || filters.q ? (
            <button
              type="button"
              onClick={() => setFilters({ sort: filters.sort })}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Clear filters
            </button>
          ) : null}
          <Link href="/products" className={cn(buttonVariants())}>
            Shop all sarees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ul className={GRID_CLASS}>
        {items.map((product, index) => (
          <li key={product._id}>
            <ProductCard
              product={product}
              imageSizes={LISTING_CARD_SIZES}
              preloadImage={index < 2}
              headingLevel="h2"
            />
          </li>
        ))}
      </ul>
      {hasMore ? (
        <div ref={sentinelRef} className="flex justify-center py-10">
          {isFetchingMore ? (
            <span className="text-muted-foreground flex items-center gap-2 text-sm" role="status">
              <span
                className="border-border border-t-foreground h-4 w-4 animate-spin rounded-full border-2"
                aria-hidden="true"
              />
              Loading more sarees
            </span>
          ) : (
            <button
              type="button"
              onClick={loadMore}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Load more
            </button>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground py-10 text-center text-sm">
          You&apos;ve seen all {items.length} {items.length === 1 ? "saree" : "sarees"}.
        </p>
      )}
    </div>
  );
}
