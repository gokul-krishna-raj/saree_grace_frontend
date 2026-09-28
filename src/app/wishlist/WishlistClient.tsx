"use client";

import Link from "next/link";

import { WishlistItemCard } from "@/components/product/WishlistItemCard";
import { buttonVariants } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { useGetWishlistQuery } from "@/store/api/wishlistApi";
import { useAppSelector } from "@/store/hooks";
import type { WishlistProductSummary } from "@/types";

export function WishlistClient() {
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === "authenticated";
  const {
    data: wishlist,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });

  if (authStatus === "unauthenticated") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-maroon-900 text-2xl">Sign in to see your wishlist</h1>
        <p className="text-maroon-600 text-sm">
          Save sarees you love and pick up right where you left off.
        </p>
        <Link
          href="/login?redirect=/wishlist"
          className={cn(buttonVariants({ variant: "primary" }))}
        >
          Sign in
        </Link>
      </main>
    );
  }

  if (isLoading || authStatus === "idle" || authStatus === "checking") {
    return (
      <main className="px-3 py-8 sm:px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/5] w-full" />
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 flex-col">
        <ErrorState
          headingAs="h1"
          title="Couldn't load your wishlist"
          message="Check your connection and try again."
          onRetry={refetch}
          isRetrying={isFetching}
        />
      </main>
    );
  }

  const products = (wishlist?.productIds ?? []).filter(
    (entry): entry is WishlistProductSummary => typeof entry !== "string",
  );

  if (products.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-maroon-900 text-2xl">Your wishlist is empty</h1>
        <p className="text-maroon-600 text-sm">Tap the heart on any saree to save it here.</p>
        <Link href="/products" className={cn(buttonVariants({ variant: "primary" }))}>
          Browse sarees
        </Link>
      </main>
    );
  }

  return (
    <main className="px-3 py-8 sm:px-4">
      <h1 className="font-heading text-maroon-900 mb-4 text-2xl">Your wishlist</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <WishlistItemCard key={product._id} product={product} />
        ))}
      </div>
    </main>
  );
}
