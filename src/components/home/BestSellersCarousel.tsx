"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetBestSellingProductsQuery } from "@/store/api/productsApi";

const BEST_SELLERS_LIMIT = 10;

export function BestSellersCarousel() {
  const {
    data: products,
    isLoading,
    isError,
  } = useGetBestSellingProductsQuery({
    limit: BEST_SELLERS_LIMIT,
  });
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true });

  if (isLoading) {
    return (
      <section className="flex flex-col gap-4">
        <div className="px-4">
          <h2 className="font-heading text-maroon-900 text-2xl">Best Sellers</h2>
          <p className="text-maroon-600 mt-1 text-sm">
            Explore the sarees customers are choosing most often.
          </p>
        </div>
        <div className="flex gap-4 overflow-hidden px-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-48 shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  // No best sellers to show (request failed, or none configured yet) — skip the section
  // entirely rather than showing an empty/broken block on the homepage.
  if (isError || !products?.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="px-4">
        <h2 className="font-heading text-maroon-900 text-2xl">Best Sellers</h2>
        <p className="text-maroon-600 mt-1 text-sm">
          Explore the sarees customers are choosing most often.
        </p>
      </div>
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden px-4">
          {/* Rendered in exactly the order the backend returns — no client-side re-sort. */}
          <div className="flex gap-4">
            {products.map((product) => (
              <div key={product._id} className="w-48 shrink-0 sm:w-56">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous"
          className="absolute top-1/2 left-1 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm sm:flex"
        >
          <ChevronLeft className="text-maroon-700 h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next"
          className="absolute top-1/2 right-1 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm sm:flex"
        >
          <ChevronRight className="text-maroon-700 h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
