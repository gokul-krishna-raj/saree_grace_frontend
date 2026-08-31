"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { SimpleProductForm } from "@/components/admin/SimpleProductForm";
import { VariantProductForm } from "@/components/admin/VariantProductForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

function NewProductContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "variant" ? "variant" : "simple";
  const [productType, setProductType] = useState<"simple" | "variant">(initialType);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-maroon-900 text-2xl font-bold">Create New Product</h1>
          <p className="text-maroon-600 text-xs">
            Configure all product details and variants on a single page.
          </p>
        </div>

        {/* Product Type Selector */}
        <div className="border-maroon-100 flex w-fit rounded-lg border bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setProductType("simple")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              productType === "simple"
                ? "bg-maroon-900 text-white"
                : "text-maroon-700 hover:bg-maroon-50",
            )}
          >
            Simple Product
          </button>
          <button
            type="button"
            onClick={() => setProductType("variant")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              productType === "variant"
                ? "bg-maroon-900 text-white"
                : "text-maroon-700 hover:bg-maroon-50",
            )}
          >
            Variant Product
          </button>
        </div>
      </div>

      {productType === "variant" ? <VariantProductForm /> : <SimpleProductForm />}
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-3xl" />}>
      <NewProductContent />
    </Suspense>
  );
}
