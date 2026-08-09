"use client";

import { CategoryCard } from "@/components/category/CategoryCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";

export function CategoryShowcase() {
  const { data: categories, isLoading, isError } = useGetCategoriesQuery(undefined);
  const topLevel = categories?.filter((category) => category.parentCategory === null) ?? [];

  if (isLoading) {
    return (
      <div className="scrollbar-hide flex gap-5 overflow-x-auto px-4 pb-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex w-20 shrink-0 flex-col items-center gap-2">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-3 w-14" />
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
    <div className="scrollbar-hide flex gap-5 overflow-x-auto px-4 pb-1">
      {topLevel.map((category) => (
        <CategoryCard key={category._id} category={category} className="shrink-0" />
      ))}
    </div>
  );
}
