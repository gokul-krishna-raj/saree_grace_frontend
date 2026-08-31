"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { Button } from "@/components/ui/Button";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { type SimpleProductFormValues, simpleProductSchema } from "@/lib/validation/adminProduct";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetOccasionsQuery } from "@/store/api/occasionsApi";
import { useCreateSimpleProductMutation } from "@/store/api/productsApi";

export function SimpleProductForm() {
  const router = useRouter();
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: occasions } = useGetOccasionsQuery();
  const [createSimpleProduct, { isLoading }] = useCreateSimpleProductMutation();
  const [images, setImages] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SimpleProductFormValues>({
    resolver: zodResolver(simpleProductSchema),
    defaultValues: { isHandloom: true },
  });

  async function onSubmit(values: SimpleProductFormValues) {
    setSubmitError(null);
    try {
      const product = await createSimpleProduct({ ...values, images }).unwrap();
      toast.success("Product created");
      router.push(`/admin/products/${product.slug}/edit`);
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
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price (₹)"
          type="number"
          inputMode="decimal"
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
        <Input
          label="Compare-at price (₹, optional)"
          type="number"
          inputMode="decimal"
          error={errors.compareAtPrice?.message}
          {...register("compareAtPrice", { valueAsNumber: true })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Stock"
          type="number"
          inputMode="numeric"
          error={errors.stock?.message}
          {...register("stock", { valueAsNumber: true })}
        />
        <Input label="SKU (optional)" {...register("sku")} />
      </div>
      <div className="border-maroon-100 bg-maroon-50/50 flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="font-heading text-maroon-900 text-base">SEO Settings (Optional)</h3>
        <p className="text-maroon-600 text-xs">
          Leave blank to automatically generate SEO title and description from product details.
        </p>
        <Input
          label="SEO Meta Title"
          placeholder="e.g. Designer Soft Silk Saree | Saree Grace"
          error={errors.seoTitle?.message}
          {...register("seoTitle")}
        />
        <label className="text-maroon-900 flex flex-col gap-1.5 text-sm font-medium">
          SEO Meta Description
          <textarea
            rows={2}
            placeholder="e.g. Explore our handcrafted soft silk saree featuring elegant gold zari border..."
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
      <div>
        <span className="text-maroon-900 mb-1.5 block text-sm font-medium">Images</span>
        <ImageDropzone files={images} onChange={setImages} disabled={isLoading} />
      </div>
      {submitError ? (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-fit">
        Create product
      </Button>
    </form>
  );
}
