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
import { isColorAttribute, isColorCodeAttribute, isValidHexColor } from "@/lib/colorCode";
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

  const colorAttrName = attributeNames.find((name) => isColorAttribute(name));
  const explicitColorCodeName = attributeNames.find((name) => isColorCodeAttribute(name));
  const colorCodeAttrName = explicitColorCodeName ?? (colorAttrName ? "colorCode" : undefined);
  const colorCodeValue = colorCodeAttrName ? (attributes[colorCodeAttrName] ?? "") : "";
  const colorCodeError =
    colorCodeAttrName && colorCodeValue.trim() && !isValidHexColor(colorCodeValue.trim())
      ? "Must be a valid hex color, e.g. #800000"
      : undefined;

  const missingAttributes = attributeNames.filter(
    (name) => !isColorCodeAttribute(name) && !attributes[name]?.trim(),
  );

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
      const finalAttributes = { ...attributes };
      if (colorCodeAttrName && colorCodeValue.trim()) {
        finalAttributes[colorCodeAttrName] = colorCodeValue.trim();
      }
      await addProductVariant({
        productId,
        variant: { ...values, attributes: finalAttributes },
        images,
      }).unwrap();
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
        {attributeNames
          .filter((name) => !isColorCodeAttribute(name))
          .map((name) => {
            const value = attributes[name] ?? "";
            const isColor = isColorAttribute(name);

            if (isColor) {
              const swatchValue = isValidHexColor(colorCodeValue) ? colorCodeValue : "#800000";
              return (
                <div key={name} className="col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label={name.charAt(0).toUpperCase() + name.slice(1)}
                    value={value}
                    onChange={(event) =>
                      setAttributes((prev) => ({ ...prev, [name]: event.target.value }))
                    }
                  />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-maroon-900 text-sm font-medium">Color code</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label="Pick color"
                        value={swatchValue}
                        onChange={(event) =>
                          setAttributes((prev) => ({
                            ...prev,
                            [colorCodeAttrName || "colorCode"]: event.target.value,
                          }))
                        }
                        className="border-maroon-100 h-11 w-11 shrink-0 cursor-pointer rounded-lg border p-1"
                      />
                      <ImageColorPicker
                        images={images}
                        onPick={(hex) =>
                          setAttributes((prev) => ({
                            ...prev,
                            [colorCodeAttrName || "colorCode"]: hex,
                          }))
                        }
                      />
                      <Input
                        value={colorCodeValue}
                        placeholder="#800000"
                        error={colorCodeError}
                        onChange={(event) =>
                          setAttributes((prev) => ({
                            ...prev,
                            [colorCodeAttrName || "colorCode"]: event.target.value,
                          }))
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              );
            }

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
          })}

        {explicitColorCodeName && !colorAttrName ? (
          <div className="col-span-2 flex flex-col gap-1.5">
            <span className="text-maroon-900 text-sm font-medium">Color code</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick color"
                value={isValidHexColor(colorCodeValue) ? colorCodeValue : "#800000"}
                onChange={(event) =>
                  setAttributes((prev) => ({
                    ...prev,
                    [explicitColorCodeName]: event.target.value,
                  }))
                }
                className="border-maroon-100 h-11 w-11 shrink-0 cursor-pointer rounded-lg border p-1"
              />
              <ImageColorPicker
                images={images}
                onPick={(hex) =>
                  setAttributes((prev) => ({
                    ...prev,
                    [explicitColorCodeName]: hex,
                  }))
                }
              />
              <Input
                value={colorCodeValue}
                placeholder="#800000"
                error={colorCodeError}
                onChange={(event) =>
                  setAttributes((prev) => ({
                    ...prev,
                    [explicitColorCodeName]: event.target.value,
                  }))
                }
                className="flex-1"
              />
            </div>
          </div>
        ) : null}
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
