"use client";

import Link from "next/link";

import { Skeleton } from "@/components/ui/Skeleton";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";

const MAX_LINKS = 8;

export function FooterCategoriesList() {
  const { data: categories, isLoading, isError } = useGetCategoriesQuery(undefined);
  const topLevel = categories?.filter((category) => category.parentCategory === null) ?? [];

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-24" />
        ))}
      </>
    );
  }

  if (isError || topLevel.length === 0) {
    return (
      <Link href="/products" className="text-maroon-700 hover:text-maroon-900 text-sm">
        Browse all sarees
      </Link>
    );
  }

  return (
    <>
      {topLevel.slice(0, MAX_LINKS).map((category) => (
        <Link
          key={category._id}
          href={`/products?category=${category.slug}`}
          className="text-maroon-700 hover:text-maroon-900 text-sm"
        >
          {category.name}
        </Link>
      ))}
    </>
  );
}
