"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetProductsQuery } from "@/store/api/productsApi";
import type { Product } from "@/types";

export function RelatedProducts({
  categoryId,
  excludeProductId,
  initialProducts,
}: {
  categoryId: string;
  excludeProductId: string;
  initialProducts?: Product[];
}) {
  const { data, isLoading } = useGetProductsQuery({ category: categoryId, limit: 8 });
  const rawProducts = data?.products ?? initialProducts ?? [];
  const related = rawProducts.filter((product) => product._id !== excludeProductId).slice(0, 4);

  if (isLoading && (!initialProducts || initialProducts.length === 0)) {
    return (
      <section className="bg-cream/40 border-border/40 border-t py-12 lg:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-foreground mb-8 text-2xl font-bold lg:text-3xl">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (related.length === 0) return null;

  return (
    <section className="bg-cream/40 border-border/40 border-t py-12 lg:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-foreground mb-8 text-2xl font-bold lg:text-3xl">
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {related.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
