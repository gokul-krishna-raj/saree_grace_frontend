"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { SimpleProductForm } from "@/components/admin/SimpleProductForm";
import { VariantProductWizard } from "@/components/admin/VariantProductWizard";
import { Skeleton } from "@/components/ui/Skeleton";

function NewProductContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") === "variant" ? "variant" : "simple";

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-maroon-900 mb-4 text-2xl">
        New {type === "variant" ? "variant" : "simple"} product
      </h1>
      {type === "variant" ? <VariantProductWizard /> : <SimpleProductForm />}
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-xl" />}>
      <NewProductContent />
    </Suspense>
  );
}
