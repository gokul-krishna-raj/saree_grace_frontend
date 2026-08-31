"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { VariantMiniForm } from "@/components/admin/VariantMiniForm";
import { Button } from "@/components/ui/Button";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";
import { type VariantShellFormValues, variantShellSchema } from "@/lib/validation/adminProduct";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetOccasionsQuery } from "@/store/api/occasionsApi";
import { useCreateVariantShellProductMutation } from "@/store/api/productsApi";
import type { Product } from "@/types";

// Presets for the common saree variant dimensions — lets an admin build up
// `variantAttributeNames` with a click instead of typing it from scratch. "colorCode" is
// included as "Color code (swatch)" since it's a real supported attribute (see colorCode.ts),
// just a hex swatch rather than a shopper-facing dimension like the others.
const ATTRIBUTE_PRESETS: { name: string; label: string }[] = [
  { name: "color", label: "Color" },
  { name: "size", label: "Size" },
  { name: "fabric", label: "Fabric" },
  { name: "border", label: "Border" },
  { name: "colorCode", label: "Color code (swatch)" },
];

function ShellForm({ onCreated }: { onCreated: (product: Product) => void }) {
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: occasions } = useGetOccasionsQuery();
  const [createShell, { isLoading }] = useCreateVariantShellProductMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VariantShellFormValues>({
    resolver: zodResolver(variantShellSchema),
    defaultValues: { isHandloom: true, variantAttributeNames: "" },
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
      <Controller
        control={control}
        name="occasions"
        render={({ field }) => (
          <CheckboxGroup
            label="Occasions (optional)"
            options={(occasions ?? []).map((occasion) => ({
              value: occasion._id,
              label: occasion.name,
            }))}
            value={field.value ?? []}
            onChange={field.onChange}
            error={errors.occasions?.message}
          />
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Fabric" {...register("fabric")} />
        <Input label="Colour" {...register("color")} />
      </div>
      {/* <label className="text-maroon-800 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("isHandloom")}
          className="border-maroon-200 h-5 w-5 rounded"
        />
        This is a handloom product
      </label> */}
      <div className="border-maroon-100 bg-maroon-50/50 flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="font-heading text-maroon-900 text-base">SEO Settings (Optional)</h3>
        <p className="text-maroon-600 text-xs">
          Leave blank to automatically generate SEO title and description from product details.
        </p>
        <Input
          label="SEO Meta Title"
          placeholder="e.g. Traditional Kanjivaram Silk Saree | Saree Grace"
          error={errors.seoTitle?.message}
          {...register("seoTitle")}
        />
        <label className="text-maroon-900 flex flex-col gap-1.5 text-sm font-medium">
          SEO Meta Description
          <textarea
            rows={2}
            placeholder="e.g. Discover our authentic handwoven Kanjivaram silk saree with rich zari pallu..."
            {...register("seoDescription")}
            className="border-maroon-200 focus:border-maroon-500 focus:ring-maroon-500 rounded-md border p-2 text-sm"
          />
          {errors.seoDescription ? (
            <span role="alert" className="text-sm font-normal text-red-600">
              {errors.seoDescription.message}
            </span>
          ) : null}
        </label>
      </div>
      <Controller
        control={control}
        name="variantAttributeNames"
        render={({ field }) => {
          const activeAttributes = (field.value ?? "")
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean);

          function toggleAttributePreset(name: string) {
            const isActive = activeAttributes.some((a) => a.toLowerCase() === name.toLowerCase());
            const next = isActive
              ? activeAttributes.filter((a) => a.toLowerCase() !== name.toLowerCase())
              : [...activeAttributes, name];
            field.onChange(next.join(", "));
          }

          return (
            <div className="flex flex-col gap-2">
              <span className="text-maroon-900 text-sm font-medium">Variant attributes</span>
              <div className="flex flex-wrap gap-2">
                {ATTRIBUTE_PRESETS.map(({ name, label }) => {
                  const isActive = activeAttributes.some(
                    (a) => a.toLowerCase() === name.toLowerCase(),
                  );
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleAttributePreset(name)}
                      aria-pressed={isActive}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        isActive
                          ? "border-maroon-700 bg-maroon-700 text-white"
                          : "border-maroon-200 text-maroon-700 hover:border-maroon-400",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <Input
                label="Or type comma-separated (e.g. color, borderWidth)"
                hint="These become the selectable options for every variant"
                error={errors.variantAttributeNames?.message}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </div>
          );
        }}
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
