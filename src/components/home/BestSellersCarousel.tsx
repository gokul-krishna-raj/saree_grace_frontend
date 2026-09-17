"use client";

import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetBestSellingProductsQuery, useGetProductsQuery } from "@/store/api/productsApi";
import type { Product } from "@/types";

interface BestSellersCarouselProps {
  initialProducts?: Product[];
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  viewAllHref?: string;
}

export function BestSellersCarousel({
  initialProducts,
  title = "Bestseller Collection",
  subtitle = "Our most loved pieces that customers can't get enough of",
  eyebrow = "Top Selling",
  viewAllHref = "/products?sort=top_rated",
}: BestSellersCarouselProps = {}) {
  const { data: bestSellers, isLoading: isBestSellersLoading } = useGetBestSellingProductsQuery({
    limit: 4,
  });

  // Fallback to top_rated products if best-sellers is empty
  const shouldFallback = !isBestSellersLoading && (!bestSellers || bestSellers.length === 0);
  const { data: topRatedData, isLoading: isFallbackLoading } = useGetProductsQuery(
    { sort: "top_rated", limit: 4 },
    { skip: !shouldFallback },
  );

  const isLoading = isBestSellersLoading || (shouldFallback && isFallbackLoading);
  const products =
    bestSellers && bestSellers.length > 0
      ? bestSellers
      : (topRatedData?.products ?? initialProducts ?? []);
  const displayProducts = products.slice(0, 4);

  return (
    <section className="bg-muted/30 py-12 lg:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between md:mb-12 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="text-primary h-5 w-5" aria-hidden="true" />
              <span className="text-primary text-xs font-semibold tracking-wider uppercase sm:text-sm">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-display text-foreground text-3xl font-bold md:text-4xl">{title}</h2>
            {subtitle ? (
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">{subtitle}</p>
            ) : null}
          </div>
          <Button variant="outline" asChild className="group hidden md:flex">
            <Link href={viewAllHref}>
              View All Bestsellers
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading && (!initialProducts || initialProducts.length === 0) ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        ) : !displayProducts.length ? (
          <div className="text-muted-foreground col-span-full py-12 text-center text-sm">
            No bestseller products yet
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link href={viewAllHref}>
              View All Bestsellers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export { BestSellersCarousel as BestsellerProducts, BestSellersCarousel as BestSellers };
