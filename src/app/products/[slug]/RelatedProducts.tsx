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
      <section className="px-3 py-8 sm:px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (related.length === 0) return null;

  return (
    <section className="px-3 py-8 sm:px-4">
      <h2 className="font-heading text-maroon-900 mb-4 text-xl">You may also like</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {related.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
