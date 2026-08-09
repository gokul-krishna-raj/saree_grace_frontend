"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetProductsQuery } from "@/store/api/productsApi";

export function FeaturedCarousel() {
  const { data, isLoading, isError } = useGetProductsQuery({ sort: "newest", limit: 8 });
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden px-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-64 w-48 shrink-0" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-maroon-600 px-4 text-center text-sm">
        Couldn&apos;t load new arrivals right now. Please try again shortly.
      </p>
    );
  }

  if (!data?.products.length) {
    return (
      <p className="text-maroon-600 px-4 text-center text-sm">
        New arrivals are on their way — check back soon.
      </p>
    );
  }

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden px-4">
        <div className="flex gap-4">
          {data.products.map((product) => (
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
  );
}
