"use client";

import { useRef } from "react";

import { ProductCard } from "@/components/product/ProductCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import type { ParsedProductFilters } from "@/lib/validation/productFilters";
import type { Product } from "@/types";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-3 sm:grid-cols-2 sm:gap-4 sm:px-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="aspect-[3/4] w-full" />
      ))}
    </div>
  );
}

export function ProductGrid({
  filters,
  initialItems,
}: {
  filters: ParsedProductFilters;
  initialItems?: Product[];
}) {
  const { items, isLoading, isFetchingMore, isError, isFetching, hasMore, loadMore, refetch } =
    useInfiniteProducts(filters, initialItems);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useIntersectionObserver(sentinelRef, loadMore, { rootMargin: "300px" });

  if (isLoading) return <GridSkeleton />;

  if (isError && items.length === 0) {
    return (
      <ErrorState
        title="Couldn't load products"
        message="Check your connection and try again."
        onRetry={refetch}
        isRetrying={isFetching}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
        <p className="font-heading text-maroon-900 text-lg">No sarees match these filters</p>
        <p className="text-maroon-600 text-sm">Try widening your filters or clearing search.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 px-3 sm:grid-cols-2 sm:gap-4 sm:px-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {hasMore ? (
        <div ref={sentinelRef} className="flex justify-center py-6" aria-hidden={!isFetchingMore}>
          {isFetchingMore ? <span className="text-maroon-600 text-sm">Loading more...</span> : null}
        </div>
      ) : (
        <p className="text-maroon-400 py-6 text-center text-sm">You&apos;ve reached the end.</p>
      )}
    </div>
  );
}
