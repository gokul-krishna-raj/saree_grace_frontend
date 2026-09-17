"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { CategoryCard } from "@/components/category/CategoryCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import type { Category } from "@/types";

interface CategoryShowcaseProps {
  initialCategories?: Category[];
}

export function CategoryShowcase({ initialCategories }: CategoryShowcaseProps = {}) {
  const { data: categories, isLoading, isError } = useGetCategoriesQuery(undefined);
  const sourceCategories = categories ?? initialCategories;
  const topLevel = sourceCategories?.filter((category) => category.parentCategory === null) ?? [];
  const displayCategories = topLevel.slice(0, 6);

  return (
    <section className="bg-background py-12 lg:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mb-10 text-center lg:mb-12">
          <span className="text-accent text-xs font-semibold tracking-wider uppercase sm:text-sm">
            Browse by
          </span>
          <h2 className="font-display text-foreground mt-2 text-3xl font-bold sm:text-4xl">
            Shop by Category
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
            From luxurious silks to comfortable cottons, find the perfect saree for every occasion.
          </p>
        </div>

        {/* Categories Grid */}
        {isLoading && (!initialCategories || initialCategories.length === 0) ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl lg:aspect-square" />
            ))}
          </div>
        ) : isError && !displayCategories.length ? (
          <p className="text-muted-foreground px-4 text-center text-sm">
            Unable to load categories right now. Please try again later.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
            {displayCategories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}

        {/* View All Button */}
        {topLevel.length > 6 ? (
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="group">
              <Link href="/categories">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
