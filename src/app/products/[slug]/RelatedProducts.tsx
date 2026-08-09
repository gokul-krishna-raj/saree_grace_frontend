"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetProductsQuery } from "@/store/api/productsApi";

export function RelatedProducts({
  categoryId,
  excludeProductId,
}: {
  categoryId: string;
  excludeProductId: string;
}) {
  const { data, isLoading } = useGetProductsQuery({ category: categoryId, limit: 8 });
  const related = (data?.products ?? [])
    .filter((product) => product._id !== excludeProductId)
    .slice(0, 4);

  if (isLoading) {
    return (
      <section className="px-4 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (related.length === 0) return null;

  return (
    <section className="px-4 py-8">
      <h2 className="font-heading text-maroon-900 mb-4 text-xl">You may also like</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {related.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
