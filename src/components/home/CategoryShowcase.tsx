"use client";

import Link from "next/link";

import { Skeleton } from "@/components/ui/Skeleton";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";

export function CategoryShowcase() {
  const { data: categories, isLoading, isError } = useGetCategoriesQuery(undefined);
  const topLevel = categories?.filter((category) => category.parentCategory === null) ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !topLevel.length) {
    return (
      <p className="text-maroon-600 px-4 text-center text-sm">
        Categories are being set up — check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3">
      {topLevel.map((category) => (
        <Link
          key={category._id}
          href={`/products?category=${category.slug}`}
          className="bg-maroon-50 hover:bg-maroon-100 flex h-32 flex-col items-center justify-center gap-2 rounded-lg text-center"
        >
          <span className="font-heading text-maroon-900 text-base">{category.name}</span>
        </Link>
      ))}
    </div>
  );
}
