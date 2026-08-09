"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { type SimpleProductFormValues, simpleProductSchema } from "@/lib/validation/adminProduct";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useCreateSimpleProductMutation } from "@/store/api/productsApi";

export function SimpleProductForm() {
  const router = useRouter();
  const { data: categories } = useGetCategoriesQuery(undefined);
  const [createSimpleProduct, { isLoading }] = useCreateSimpleProductMutation();
  const [images, setImages] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
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
