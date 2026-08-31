"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ImageColorPicker } from "@/components/admin/ImageColorPicker";
import { Button } from "@/components/ui/Button";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { isColorAttribute, isColorCodeAttribute, isValidHexColor } from "@/lib/colorCode";
import { toast } from "@/lib/toast";
import { type VariantShellFormValues, variantShellSchema } from "@/lib/validation/adminProduct";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetOccasionsQuery } from "@/store/api/occasionsApi";
import { useCreateVariantProductMutation } from "@/store/api/productsApi";

const ATTRIBUTE_PRESETS: { name: string; label: string }[] = [
  { name: "color", label: "Color" },
  { name: "size", label: "Size" },
  { name: "fabric", label: "Fabric" },
  { name: "border", label: "Border" },
  { name: "colorCode", label: "Color code (swatch)" },
];

interface LocalVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: string;
  compareAtPrice: string;
  stock: string;
  images: File[];
  error?: string;
}

function createEmptyVariant(id: string): LocalVariant {
  return {
    id,
    sku: "",
    attributes: { color: "", colorCode: "#800000" },
    price: "",
    compareAtPrice: "",
    stock: "10",
    images: [],
  };
}

export function VariantProductForm() {
  const router = useRouter();
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: occasions } = useGetOccasionsQuery();
  const [createVariantProduct, { isLoading }] = useCreateVariantProductMutation();

  const [variants, setVariants] = useState<LocalVariant[]>([createEmptyVariant("v-1")]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors: baseErrors },
  } = useForm<VariantShellFormValues>({
    resolver: zodResolver(variantShellSchema),
    defaultValues: {
      isHandloom: true,
      variantAttributeNames: "color, colorCode",
    },
  });

  const variantAttributeNamesStr = watch("variantAttributeNames") ?? "color, colorCode";
  const parsedAttributeNames = variantAttributeNamesStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const hasColor = parsedAttributeNames.some((a) => isColorAttribute(a) || isColorCodeAttribute(a));

  function addVariant() {
    setVariants((prev) => [...prev, createEmptyVariant(`v-${Date.now()}`)]);
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariantField(
    index: number,
    field: "sku" | "price" | "compareAtPrice" | "stock",
    value: string,
  ) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value, error: undefined } : v)),
    );
  }

  function updateVariantAttribute(index: number, attrName: string, value: string) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? {
              ...v,
              attributes: { ...v.attributes, [attrName]: value },
              error: undefined,
            }
          : v,
      ),
    );
  }

  function handleAddVariantImages(index: number, newFiles: FileList | null) {
    if (!newFiles || newFiles.length === 0) return;
    const fileArray = Array.from(newFiles);
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, images: [...v.images, ...fileArray], error: undefined } : v,
      ),
    );
  }

  function handleRemoveVariantImage(variantIndex: number, imageIndex: number) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, images: v.images.filter((_, imgIdx) => imgIdx !== imageIndex) }
          : v,
      ),
    );
  }

  async function onSubmit(baseValues: VariantShellFormValues) {
    setSubmitError(null);

    // Validate variants
    let hasVariantErrors = false;
    const updatedVariants = variants.map((v, i) => {
      if (!v.sku.trim()) {
        hasVariantErrors = true;
        return { ...v, error: `Variant #${i + 1}: SKU is required` };
      }
      const priceNum = Number(v.price);
      if (!v.price || isNaN(priceNum) || priceNum <= 0) {
        hasVariantErrors = true;
        return { ...v, error: `Variant #${i + 1} (${v.sku}): Price must be greater than 0` };
      }
      const stockNum = Number(v.stock);
      if (v.stock === "" || isNaN(stockNum) || stockNum < 0) {
        hasVariantErrors = true;
        return { ...v, error: `Variant #${i + 1} (${v.sku}): Stock cannot be negative` };
      }
      if (hasColor) {
        const colorVal = v.attributes.color?.trim();
        if (!colorVal) {
          hasVariantErrors = true;
          return { ...v, error: `Variant #${i + 1} (${v.sku}): Color name is required` };
        }
      }
      const colorCodeVal = v.attributes.colorCode?.trim();
      if (colorCodeVal && !isValidHexColor(colorCodeVal)) {
        hasVariantErrors = true;
        return {
          ...v,
          error: `Variant #${i + 1} (${v.sku}): Color code must be a valid hex format (e.g. #800000)`,
        };
      }
      // Mandatory Image Check per variant
      if (v.images.length === 0) {
        hasVariantErrors = true;
        return {
          ...v,
          error: `Variant #${i + 1} (${v.sku || "Variant"}): At least one image is mandatory`,
        };
      }
      return { ...v, error: undefined };
    });

    setVariants(updatedVariants);

    if (hasVariantErrors) {
      setSubmitError("Please resolve the errors in the variant rows below before saving.");
      return;
    }

    try {
      const formattedVariants = updatedVariants.map((v) => ({
        sku: v.sku.trim().toUpperCase(),
        attributes: v.attributes,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        stock: Number(v.stock),
      }));

      const variantImages = updatedVariants.map((v) => v.images);

      await createVariantProduct({
        ...baseValues,
        variantAttributeNames: parsedAttributeNames,
        variants: formattedVariants,
        variantImages,
      }).unwrap();

      toast.success("Variant product created successfully");
      router.push("/admin/products");
    } catch (error) {
      setSubmitError(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* 1. Base Product Details */}
      <div className="border-maroon-100 flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-heading text-maroon-900 text-lg">1. Product Information</h2>

        <Input label="Name" error={baseErrors.name?.message} {...register("name")} />

        <label className="text-maroon-900 flex flex-col gap-1.5 text-sm font-medium">
          Description
          <textarea
            {...register("description")}
            rows={4}
            className="border-maroon-100 rounded-lg border p-3 text-base font-normal"
          />
          {baseErrors.description ? (
            <span role="alert" className="text-sm font-normal text-red-600">
              {baseErrors.description.message}
            </span>
          ) : null}
        </label>

        <Select label="Category" error={baseErrors.category?.message} {...register("category")}>
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
              error={baseErrors.occasions?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Fabric (optional)" {...register("fabric")} />
          <Input label="Primary Colour (optional)" {...register("color")} />
        </div>

        {/* SEO Settings */}
        <div className="border-maroon-100 bg-maroon-50/50 flex flex-col gap-3 rounded-lg border p-4">
          <h3 className="font-heading text-maroon-900 text-base">SEO Settings (Optional)</h3>
          <p className="text-maroon-600 text-xs">
            Leave blank to automatically generate SEO title and description from product details.
          </p>
          <Input
            label="SEO Meta Title"
            placeholder="e.g. Designer Silk Saree | Saree Grace"
            error={baseErrors.seoTitle?.message}
            {...register("seoTitle")}
          />
          <label className="text-maroon-900 flex flex-col gap-1.5 text-sm font-medium">
            SEO Meta Description
            <textarea
              rows={2}
              placeholder="e.g. Shop handcrafted designer silk sarees with rich border and pallu..."
              {...register("seoDescription")}
              className="border-maroon-200 focus:border-maroon-500 focus:ring-maroon-500 rounded-md border p-2 text-sm"
            />
            {baseErrors.seoDescription ? (
              <span role="alert" className="text-sm font-normal text-red-600">
                {baseErrors.seoDescription.message}
              </span>
            ) : null}
          </label>
        </div>
      </div>

      {/* 2. Variant Attributes Configuration */}
      <div className="border-maroon-100 flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-heading text-maroon-900 text-lg">
          2. Variant Attributes Configuration
        </h2>
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
              <div className="flex flex-col gap-3">
                <span className="text-maroon-900 text-sm font-medium">
                  Select attribute dimensions:
                </span>
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
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
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
                  label="Attributes (comma-separated)"
                  hint="e.g. color, colorCode, size"
                  error={baseErrors.variantAttributeNames?.message}
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
      </div>

      {/* 3. Variants & Per-Variant Images (Mandatory) */}
      <div className="border-maroon-100 flex flex-col gap-5 rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-maroon-900 text-lg">
              3. Product Variants ({variants.length})
            </h2>
            <p className="text-maroon-600 mt-0.5 text-xs">
              Each variant must have its own dedicated images, SKU, pricing, and stock.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addVariant}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Variant</span>
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {variants.map((variant, index) => {
            const hasColorAttr = parsedAttributeNames.some((a) => isColorAttribute(a));
            const colorVal = variant.attributes.color ?? "";
            const colorCodeVal = variant.attributes.colorCode ?? "#800000";

            return (
              <div
                key={variant.id}
                className={cn(
                  "border-maroon-100 relative flex flex-col gap-4 rounded-xl border bg-gray-50/50 p-4 transition-all",
                  variant.error && "border-red-400 bg-red-50/30 ring-1 ring-red-400",
                )}
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-maroon-900 text-sm font-semibold">
                      Variant #{index + 1}
                    </span>
                    {colorVal ? (
                      <span className="bg-maroon-100 text-maroon-800 rounded-md px-2 py-0.5 text-xs font-medium">
                        {colorVal}
                      </span>
                    ) : null}
                  </div>
                  {variants.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  ) : null}
                </div>

                {variant.error ? (
                  <p role="alert" className="text-xs font-medium text-red-600">
                    {variant.error}
                  </p>
                ) : null}

                {/* Variant Attributes */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {hasColorAttr ? (
                    <div className="flex flex-col gap-1.5">
                      <Input
                        label="Color Name"
                        placeholder="e.g. Maroon, Mustard Gold"
                        value={colorVal}
                        onChange={(e) => updateVariantAttribute(index, "color", e.target.value)}
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <label
                          htmlFor={`color-picker-${variant.id}`}
                          className="border-maroon-100 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border bg-white shadow-sm"
                          style={{ backgroundColor: colorCodeVal }}
                          title="Click to select color"
                        >
                          <input
                            id={`color-picker-${variant.id}`}
                            type="color"
                            value={isValidHexColor(colorCodeVal) ? colorCodeVal : "#800000"}
                            onChange={(e) =>
                              updateVariantAttribute(index, "colorCode", e.target.value)
                            }
                            className="sr-only"
                          />
                        </label>
                        <div className="flex-1">
                          <Input
                            label="Color Hex Code"
                            placeholder="#800000"
                            value={colorCodeVal}
                            onChange={(e) =>
                              updateVariantAttribute(index, "colorCode", e.target.value)
                            }
                          />
                        </div>
                        {variant.images.length > 0 ? (
                          <ImageColorPicker
                            images={variant.images}
                            onPick={(hex) => updateVariantAttribute(index, "colorCode", hex)}
                          />
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {/* Other attributes */}
                  {parsedAttributeNames
                    .filter((a) => !isColorAttribute(a) && !isColorCodeAttribute(a))
                    .map((attrName) => (
                      <Input
                        key={attrName}
                        label={attrName.charAt(0).toUpperCase() + attrName.slice(1)}
                        value={variant.attributes[attrName] ?? ""}
                        onChange={(e) => updateVariantAttribute(index, attrName, e.target.value)}
                      />
                    ))}

                  <Input
                    label="SKU"
                    placeholder="e.g. SG-MAROON-01"
                    value={variant.sku}
                    onChange={(e) => updateVariantField(index, "sku", e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Price (₹)"
                      type="number"
                      placeholder="3999"
                      value={variant.price}
                      onChange={(e) => updateVariantField(index, "price", e.target.value)}
                    />
                    <Input
                      label="Compare Price"
                      type="number"
                      placeholder="4999"
                      value={variant.compareAtPrice}
                      onChange={(e) => updateVariantField(index, "compareAtPrice", e.target.value)}
                    />
                  </div>
                  <Input
                    label="Stock"
                    type="number"
                    placeholder="10"
                    value={variant.stock}
                    onChange={(e) => updateVariantField(index, "stock", e.target.value)}
                  />
                </div>

                {/* Per-Variant Mandatory Images Upload */}
                <div className="border-maroon-100 flex flex-col gap-2 rounded-lg border bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-maroon-900 text-xs font-semibold">
                      Variant Images <span className="text-red-600">* (Mandatory)</span>
                    </span>
                    <span className="text-maroon-500 text-xs">
                      {variant.images.length} image{variant.images.length === 1 ? "" : "s"} selected
                    </span>
                  </div>

                  {/* Image Previews */}
                  {variant.images.length > 0 ? (
                    <div className="flex flex-wrap gap-2 py-1">
                      {variant.images.map((file, imgIdx) => {
                        const previewUrl = URL.createObjectURL(file);
                        return (
                          <div
                            key={imgIdx}
                            className="border-maroon-100 relative h-16 w-16 overflow-hidden rounded-md border"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewUrl}
                              alt={`Variant ${index + 1} Image ${imgIdx + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantImage(index, imgIdx)}
                              className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                              aria-label="Remove image"
                            >
                              <X className="h-3 w-3" aria-hidden="true" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Upload button / file input */}
                  <label className="border-maroon-200 text-maroon-700 hover:bg-maroon-50 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-xs font-medium transition-colors">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span>Upload Images for this Variant</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      multiple
                      className="sr-only"
                      onChange={(e) => handleAddVariantImages(index, e.target.files)}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={addVariant}
          className="w-full gap-2 border-dashed py-3"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Another Variant</span>
        </Button>
      </div>

      {/* 4. Global Action & Submit Error */}
      {submitError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p role="alert" className="text-sm font-medium text-red-700">
            {submitError}
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} disabled={isLoading} className="px-8 py-3">
          Create Product
        </Button>
      </div>
    </form>
  );
}
