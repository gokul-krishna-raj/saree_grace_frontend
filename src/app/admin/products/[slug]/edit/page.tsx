"use client";

import { useParams } from "next/navigation";

import { Skeleton } from "@/components/ui/Skeleton";
import { useGetProductBySlugQuery } from "@/store/api/productsApi";

import { EditProductClient } from "./EditProductClient";

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug);

  if (isLoading) return <Skeleton className="h-96 w-full max-w-2xl" />;

  if (isError || !product) {
    return <p className="text-maroon-700">Couldn&apos;t find that product.</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-maroon-900 mb-4 text-2xl">Edit {product.name}</h1>
      <EditProductClient product={product} />
    </div>
  );
}
