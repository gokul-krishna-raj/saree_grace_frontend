"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ImageColorPicker } from "@/components/admin/ImageColorPicker";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/apiError";
import { isColorCodeAttribute, isValidHexColor } from "@/lib/colorCode";
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
  const colorCodeAttrName = attributeNames.find((name) => isColorCodeAttribute(name));
  const colorCodeValue = colorCodeAttrName ? (attributes[colorCodeAttrName] ?? "") : "";
  const colorCodeError =
    colorCodeAttrName && colorCodeValue.trim() && !isValidHexColor(colorCodeValue.trim())
      ? "Must be a valid hex color, e.g. #800000"
      : undefined;

  async function onSubmit(values: VariantFormValues) {
    setSubmitError(null);
    if (missingAttributes.length > 0) {
      setSubmitError(`Fill in: ${missingAttributes.join(", ")}`);
      return;
    }
    // No setSubmitError duplicate here — the colorCode field already shows this inline via
    // `error={colorCodeError}`, same as every other field's zod error.
    if (colorCodeError) return;
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
        {attributeNames.map((name) => {
          const value = attributes[name] ?? "";
          if (!isColorCodeAttribute(name)) {
            return (
              <Input
                key={name}
                label={name.charAt(0).toUpperCase() + name.slice(1)}
                value={value}
                onChange={(event) =>
                  setAttributes((prev) => ({ ...prev, [name]: event.target.value }))
                }
              />
            );
          }
          // "colorCode" is a hex swatch, not free text — a native color input pairs with the
          // text field so an admin can either pick visually or paste an exact hex value.
          const swatchValue = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#000000";
          return (
            <div key={name} className="flex flex-col gap-1.5">
              <span className="text-maroon-900 text-sm font-medium">Color code</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Pick color"
                  value={swatchValue}
                  onChange={(event) =>
                    setAttributes((prev) => ({ ...prev, [name]: event.target.value }))
                  }
                  className="border-maroon-100 h-11 w-11 shrink-0 cursor-pointer rounded-lg border p-1"
                />
                <ImageColorPicker
                  images={images}
                  onPick={(hex) => setAttributes((prev) => ({ ...prev, [name]: hex }))}
                />
                <Input
                  value={value}
                  placeholder="#800000"
                  error={colorCodeError}
                  onChange={(event) =>
                    setAttributes((prev) => ({ ...prev, [name]: event.target.value }))
                  }
                  className="flex-1"
                />
              </div>
            </div>
          );
        })}
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
          // Not `valueAsNumber: true` — an empty optional number input's `.valueAsNumber` is
          // `NaN`, not `undefined`, and `z.number().optional()` rejects NaN. setValueAs maps
          // "" to undefined so the field can actually be left blank.
          {...register("compareAtPrice", {
            setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
          })}
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
