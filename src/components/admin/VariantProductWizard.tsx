"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { VariantMiniForm } from "@/components/admin/VariantMiniForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { type VariantShellFormValues, variantShellSchema } from "@/lib/validation/adminProduct";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useCreateVariantShellProductMutation } from "@/store/api/productsApi";
import type { Product } from "@/types";

function ShellForm({ onCreated }: { onCreated: (product: Product) => void }) {
  const { data: categories } = useGetCategoriesQuery(undefined);
  const [createShell, { isLoading }] = useCreateVariantShellProductMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VariantShellFormValues>({
    resolver: zodResolver(variantShellSchema),
    defaultValues: { isHandloom: true },
  });

  async function onSubmit(values: VariantShellFormValues) {
    setSubmitError(null);
    try {
      const product = await createShell({
        ...values,
        variantAttributeNames: values.variantAttributeNames
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }).unwrap();
      toast.success("Product created — now add its variants");
      onCreated(product);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input label="Name" error={errors.name?.message} {...register("name")} />
      <label className="text-maroon-900 flex flex-col gap-1.5 text-sm font-medium">
        Description
        <textarea
          {...register("description")}
          rows={4}
          className="border-maroon-100 rounded-lg border p-3 text-base font-normal"
        />
        {errors.description ? (
          <span role="alert" className="text-sm font-normal text-red-600">
            {errors.description.message}
          </span>
        ) : null}
      </label>
      <Select label="Category" error={errors.category?.message} {...register("category")}>
        <option value="">Select a category</option>
        {categories?.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Fabric" {...register("fabric")} />
        <Input label="Colour" {...register("color")} />
      </div>
      <label className="text-maroon-800 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("isHandloom")}
          className="border-maroon-200 h-5 w-5 rounded"
        />
        This is a handloom product
      </label>
      <Input
        label="Variant attributes (comma-separated)"
        hint="e.g. color, borderWidth — these become the selectable options for every variant"
        error={errors.variantAttributeNames?.message}
        {...register("variantAttributeNames")}
      />
      {submitError ? (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-fit">
        Create & continue
      </Button>
    </form>
  );
}

export function VariantProductWizard() {
  const [product, setProduct] = useState<Product | null>(null);
  const [variantCount, setVariantCount] = useState(0);

  if (!product) {
    return <ShellForm onCreated={setProduct} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-maroon-50 text-maroon-800 rounded-lg p-3 text-sm">
        <p className="font-medium">{product.name}</p>
        <p>
          {variantCount} variant{variantCount === 1 ? "" : "s"} added so far.
        </p>
      </div>
      <VariantMiniForm
        productId={product._id}
        attributeNames={product.variantAttributeNames ?? []}
        onAdded={() => setVariantCount((count) => count + 1)}
      />
      <Link
        href={`/admin/products/${product.slug}/edit`}
        className="text-maroon-700 text-sm underline"
      >
        Done adding variants — go to product page
      </Link>
    </div>
  );
}
