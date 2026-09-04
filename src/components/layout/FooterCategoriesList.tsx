"use client";

import Link from "next/link";

import { Skeleton } from "@/components/ui/Skeleton";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import type { Category } from "@/types";

const MAX_LINKS = 8;

interface FooterCategoriesListProps {
  initialCategories?: Category[];
}

export function FooterCategoriesList({ initialCategories }: FooterCategoriesListProps = {}) {
  const { data: categories, isLoading } = useGetCategoriesQuery(undefined);
  const rawList = categories ?? initialCategories ?? [];
  const topLevel = rawList.filter((category) => category.parentCategory === null);

  if (isLoading && (!initialCategories || initialCategories.length === 0)) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-24" />
        ))}
      </>
    );
  }

  if (topLevel.length === 0) {
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
          href={`/categories/${category.slug}`}
          className="text-maroon-700 hover:text-maroon-900 text-sm"
        >
          {category.name}
        </Link>
      ))}
    </>
  );
}
