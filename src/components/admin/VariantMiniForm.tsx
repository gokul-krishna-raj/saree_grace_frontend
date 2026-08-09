"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { type VariantFormValues, variantSchema } from "@/lib/validation/adminProduct";
import { useAddProductVariantMutation } from "@/store/api/productsApi";

export function VariantMiniForm({
  productId,
  attributeNames,
  onAdded,
}: {
  productId: string;
  attributeNames: string[];
  onAdded: () => void;
}) {
  const [addProductVariant, { isLoading }] = useAddProductVariantMutation();
  const [attributes, setAttributes] = useState<Record<string, string>>(
    Object.fromEntries(attributeNames.map((name) => [name, ""])),
  );
  const [images, setImages] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VariantFormValues>({ resolver: zodResolver(variantSchema) });

  const missingAttributes = attributeNames.filter((name) => !attributes[name]?.trim());

  async function onSubmit(values: VariantFormValues) {
    setSubmitError(null);
    if (missingAttributes.length > 0) {
      setSubmitError(`Fill in: ${missingAttributes.join(", ")}`);
      return;
    }
    try {
      await addProductVariant({ productId, variant: { ...values, attributes }, images }).unwrap();
      toast.success("Variant added");
      reset();
      setAttributes(Object.fromEntries(attributeNames.map((name) => [name, ""])));
      setImages([]);
      onAdded();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="border-maroon-100 flex flex-col gap-4 rounded-lg border p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        {attributeNames.map((name) => (
          <Input
            key={name}
            label={name.charAt(0).toUpperCase() + name.slice(1)}
            value={attributes[name] ?? ""}
            onChange={(event) => setAttributes((prev) => ({ ...prev, [name]: event.target.value }))}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="SKU" error={errors.sku?.message} {...register("sku")} />
        <Input
          label="Price (₹)"
          type="number"
          inputMode="decimal"
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Compare-at price (₹, optional)"
          type="number"
          inputMode="decimal"
          error={errors.compareAtPrice?.message}
          {...register("compareAtPrice", { valueAsNumber: true })}
        />
        <Input
          label="Stock"
          type="number"
          inputMode="numeric"
          error={errors.stock?.message}
          {...register("stock", { valueAsNumber: true })}
        />
      </div>
      <ImageDropzone files={images} onChange={setImages} disabled={isLoading} />
      {submitError ? (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-fit">
        Add variant
      </Button>
    </form>
  );
}
