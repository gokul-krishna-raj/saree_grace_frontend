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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[3/4] rounded-2xl lg:aspect-square" />
        ))}
      </div>
    );
  }

  if (isError && !displayCategories?.length) {
    return <ErrorState message="Unable to load categories." onRetry={refetch} />;
  }

  if (!displayCategories?.length) {
    return (
      <p className="text-muted-foreground px-4 py-16 text-center text-sm">
        Categories are being set up — check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
      {displayCategories.map((category) => (
        <CategoryCard key={category._id} category={category} />
      ))}
    </div>
  );
}
