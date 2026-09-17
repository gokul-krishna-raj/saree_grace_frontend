"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetProductsQuery } from "@/store/api/productsApi";
import type { Product } from "@/types";

interface FeaturedCarouselProps {
  initialProducts?: Product[];
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  viewAllHref?: string;
}

export function FeaturedCarousel({
  initialProducts,
  title = "New Arrivals",
  subtitle = "Explore the latest handloom and bridal additions to our collection",
  eyebrow = "Just Arrived",
  viewAllHref = "/products?sort=newest",
}: FeaturedCarouselProps = {}) {
  const { data, isLoading, isError } = useGetProductsQuery({ sort: "newest", limit: 8 });
  const products = data?.products ?? initialProducts ?? [];
  const displayProducts = products.slice(0, 4);

  return (
    <section className="bg-cream/40 py-12 lg:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between md:mb-12 md:flex-row md:items-end">
          <div>
            <span className="text-accent text-xs font-semibold tracking-wider uppercase sm:text-sm">
              {eyebrow}
            </span>
            <h2 className="font-display text-foreground mt-2 text-3xl font-bold lg:text-4xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">{subtitle}</p>
            ) : null}
          </div>
          <Button asChild variant="ghost" className="group mt-4 w-fit md:mt-0">
            <Link href={viewAllHref}>
              View All
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading && (!initialProducts || initialProducts.length === 0) ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        ) : isError && !displayProducts.length ? (
          <div className="text-muted-foreground col-span-full py-12 text-center text-sm">
            Couldn&apos;t load new arrivals right now. Please try again shortly.
          </div>
        ) : !displayProducts.length ? (
          <div className="text-muted-foreground col-span-full py-12 text-center text-sm">
            New arrivals are on their way — check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Button variant="ghost" asChild className="group">
            <Link href={viewAllHref}>
              View All New Arrivals
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export { FeaturedCarousel as FeaturedProducts, FeaturedCarousel as NewArrivals };
