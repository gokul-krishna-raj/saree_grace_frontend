"use client";

import { CategoryCard } from "@/components/category/CategoryCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import type { Category } from "@/types";

interface CategoryGridProps {
  initialCategories?: Category[];
}

export function CategoryGrid({ initialCategories }: CategoryGridProps = {}) {
  const { data: categories, isLoading, isError, refetch } = useGetCategoriesQuery(undefined);
  const displayCategories = categories ?? initialCategories;

  if (isLoading && (!initialCategories || initialCategories.length === 0)) {
    return (
      <div className="grid grid-cols-3 gap-x-4 gap-y-8 px-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (isError && !displayCategories?.length) {
    return <ErrorState message="Unable to load categories." onRetry={refetch} />;
  }

  if (!displayCategories?.length) {
    return (
      <p className="text-maroon-600 px-4 py-12 text-center text-sm">
        Categories are being set up — check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-8 px-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {displayCategories.map((category) => (
        <CategoryCard key={category._id} category={category} size="lg" />
      ))}
    </div>
  );
}
