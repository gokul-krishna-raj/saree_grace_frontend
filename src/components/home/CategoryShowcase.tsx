"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CategoryCard } from "@/components/category/CategoryCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";

export function CategoryShowcase() {
  const { data: categories, isLoading, isError } = useGetCategoriesQuery(undefined);
  const topLevel = categories?.filter((category) => category.parentCategory === null) ?? [];
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden px-4 py-2 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex w-24 shrink-0 flex-col items-center gap-2.5 sm:w-28 md:w-32"
          >
            <Skeleton className="h-24 w-24 rounded-full sm:h-28 sm:w-28 md:h-32 md:w-32" />
            <Skeleton className="h-3.5 w-16 sm:w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !topLevel.length) {
    return (
      <p className="text-maroon-600 px-4 text-center text-sm">
        {isError
          ? "Unable to load categories. Try again later."
          : "Categories are being set up — check back soon."}
      </p>
    );
  }

  return (
    <div className="group relative">
      <div ref={emblaRef} className="overflow-hidden px-4 py-2">
        <div className="flex gap-4 sm:gap-6 lg:gap-7">
          {topLevel.map((category) => (
            <div key={category._id} className="w-24 shrink-0 sm:w-28 md:w-32">
              <CategoryCard category={category} size="md" />
            </div>
          ))}
        </div>
      </div>
      {topLevel.length > 4 ? (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous categories"
            className="border-maroon-100 text-maroon-700 hover:bg-maroon-50 hover:text-maroon-900 absolute top-[42%] left-1 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 opacity-90 shadow-md backdrop-blur transition-all group-hover:opacity-100 sm:flex"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next categories"
            className="border-maroon-100 text-maroon-700 hover:bg-maroon-50 hover:text-maroon-900 absolute top-[42%] right-1 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 opacity-90 shadow-md backdrop-blur transition-all group-hover:opacity-100 sm:flex"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}
