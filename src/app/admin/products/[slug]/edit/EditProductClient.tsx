"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ImageColorPicker } from "@/components/admin/ImageColorPicker";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { Button } from "@/components/ui/Button";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { isColorAttribute, isColorCodeAttribute, isValidHexColor } from "@/lib/colorCode";
import { toast } from "@/lib/toast";
import {
  type SimpleProductFormValues,
  simpleProductSchema,
  type VariantShellFormValues,
  variantShellSchema,
} from "@/lib/validation/adminProduct";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetOccasionsQuery } from "@/store/api/occasionsApi";
import { useUpdateProductMutation } from "@/store/api/productsApi";
import type { Product, ProductImage } from "@/types";

const ATTRIBUTE_PRESETS: { name: string; label: string }[] = [
  { name: "color", label: "Color" },
  { name: "size", label: "Size" },
  { name: "fabric", label: "Fabric" },
  { name: "border", label: "Border" },
  { name: "colorCode", label: "Color code (swatch)" },
];

function categoryIdOf(product: Product) {
  return typeof product.category === "string" ? product.category : product.category._id;
}

function occasionIdsOf(product: Product) {
  return (product.occasions ?? []).map((occasion) =>
    typeof occasion === "string" ? occasion : occasion._id,
  );
}

// ---------------------------------------------------------------------------
// SIMPLE PRODUCT EDIT FORM
// ---------------------------------------------------------------------------
function EditSimpleProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: occasions } = useGetOccasionsQuery();
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SimpleProductFormValues>({
    resolver: zodResolver(simpleProductSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      category: categoryIdOf(product),
      occasions: occasionIdsOf(product),
      fabric: product.fabric ?? "",
      color: product.color ?? "",
      isHandloom: product.isHandloom,
      price: product.price ?? 0,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock ?? 0,
      sku: product.sku ?? "",
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
    },
  });

  async function onSubmit(values: SimpleProductFormValues) {
    setSubmitError(null);
    try {
      await updateProduct({
        id: product._id,
        previousSlug: product.slug,
        ...values,
        removeImagePublicIds: removedImageIds.length > 0 ? removedImageIds : undefined,
        images: newImages.length > 0 ? newImages : undefined,
      }).unwrap();
      toast.success("Product updated successfully");
      router.refresh();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  const existingImages = (product.images ?? []).filter(
    (img) => !removedImageIds.includes(img.publicId),
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="border-maroon-100 flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-heading text-maroon-900 text-lg">Product Details</h2>

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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label="Price (₹)"
            type="number"
            error={errors.price?.message}
            {...register("price", { valueAsNumber: true })}
          />
          <Input
            label="Compare-at Price (₹)"
            type="number"
            error={errors.compareAtPrice?.message}
            {...register("compareAtPrice", {
              setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
            })}
          />
          <Input
            label="Stock"
            type="number"
            error={errors.stock?.message}
            {...register("stock", { valueAsNumber: true })}
          />
        </div>

        <Input label="SKU (optional)" error={errors.sku?.message} {...register("sku")} />

        {/* SEO Settings */}
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

        {/* Existing Images */}
        {existingImages.length > 0 ? (
          <div>
            <span className="text-maroon-900 mb-2 block text-sm font-medium">
              Current Images ({existingImages.length})
            </span>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div
                  key={img.publicId}
                  className="border-maroon-100 relative h-20 w-20 overflow-hidden rounded-lg border shadow-sm"
                >
                  <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setRemovedImageIds((prev) => [...prev, img.publicId])}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Add New Images */}
        <div>
          <span className="text-maroon-900 mb-1.5 block text-sm font-medium">
            Upload New Images
          </span>
          <ImageDropzone files={newImages} onChange={setNewImages} disabled={isLoading} />
        </div>
      </div>

      {submitError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p role="alert" className="text-sm font-medium text-red-700">
            {submitError}
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} disabled={isLoading} className="px-8 py-3">
          Save Changes
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// VARIANT PRODUCT SINGLE-PAGE EDIT FORM
// ---------------------------------------------------------------------------
interface EditableVariant {
  _id?: string;
  tempId?: string;
  sku: string;
  attributes: Record<string, string>;
  price: string;
  compareAtPrice: string;
  stock: string;
  isActive: boolean;
  existingImages: ProductImage[];
  removedImagePublicIds: string[];
  newImages: File[];
  error?: string;
}

function EditVariantProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: occasions } = useGetOccasionsQuery();
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize variants state from existing product variants
  const [variants, setVariants] = useState<EditableVariant[]>(() => {
    const existing = product.variants ?? [];
    if (existing.length === 0) {
      return [
        {
          tempId: "v-new-1",
          sku: "",
          attributes: { color: "", colorCode: "#800000" },
          price: "",
          compareAtPrice: "",
          stock: "10",
          isActive: true,
          existingImages: [],
          removedImagePublicIds: [],
          newImages: [],
        },
      ];
    }
    return existing.map((v) => ({
      _id: v._id,
      sku: v.sku,
      attributes: { ...v.attributes },
      price: String(v.price),
      compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : "",
      stock: String(v.stock),
      isActive: v.isActive,
      existingImages: [...(v.images ?? [])],
      removedImagePublicIds: [],
      newImages: [],
    }));
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors: baseErrors },
  } = useForm<VariantShellFormValues>({
    resolver: zodResolver(variantShellSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      category: categoryIdOf(product),
      occasions: occasionIdsOf(product),
      fabric: product.fabric ?? "",
      color: product.color ?? "",
      isHandloom: product.isHandloom,
      variantAttributeNames: (product.variantAttributeNames ?? ["color", "colorCode"]).join(", "),
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
    },
  });

  const variantAttributeNamesStr = watch("variantAttributeNames") ?? "color, colorCode";
  const parsedAttributeNames = variantAttributeNamesStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const hasColor = parsedAttributeNames.some((a) => isColorAttribute(a) || isColorCodeAttribute(a));

  function addVariantRow() {
    setVariants((prev) => [
      ...prev,
      {
        tempId: `v-new-${Date.now()}`,
        sku: "",
        attributes: { color: "", colorCode: "#800000" },
        price: "",
        compareAtPrice: "",
        stock: "10",
        isActive: true,
        existingImages: [],
        removedImagePublicIds: [],
        newImages: [],
      },
    ]);
  }

  function removeVariantRow(index: number) {
    if (variants.length <= 1) {
      toast.error("A variant product must have at least one variant.");
      return;
    }
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

  function handleRemoveExistingImage(variantIndex: number, publicId: string) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? {
              ...v,
              existingImages: v.existingImages.filter((img) => img.publicId !== publicId),
              removedImagePublicIds: [...v.removedImagePublicIds, publicId],
              error: undefined,
            }
          : v,
      ),
    );
  }

  function handleAddNewImages(variantIndex: number, newFiles: FileList | null) {
    if (!newFiles || newFiles.length === 0) return;
    const fileArray = Array.from(newFiles);
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, newImages: [...v.newImages, ...fileArray], error: undefined }
          : v,
      ),
    );
  }

  function handleRemoveNewImage(variantIndex: number, imgIdx: number) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, newImages: v.newImages.filter((_, idx) => idx !== imgIdx) }
          : v,
      ),
    );
  }

  async function onSubmit(baseValues: VariantShellFormValues) {
    setSubmitError(null);

    // Validate all variants
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
      // Mandatory image validation per variant (existing remaining + new uploads)
      const totalImages = v.existingImages.length + v.newImages.length;
      if (totalImages === 0) {
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
        _id: v._id,
        sku: v.sku.trim().toUpperCase(),
        attributes: v.attributes,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        stock: Number(v.stock),
        isActive: v.isActive,
        removeImagePublicIds:
          v.removedImagePublicIds.length > 0 ? v.removedImagePublicIds : undefined,
      }));

      const variantImages = updatedVariants.map((v) => v.newImages);

      await updateProduct({
        id: product._id,
        previousSlug: product.slug,
        ...baseValues,
        variantAttributeNames: parsedAttributeNames,
        variants: formattedVariants,
        variantImages,
      }).unwrap();

      toast.success("Product and variants updated successfully");
      router.refresh();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* 1. Base Product Information */}
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
              Manage all variants, pricing, stock, and individual variant images on this page.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addVariantRow}
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
            const totalImageCount = variant.existingImages.length + variant.newImages.length;

            return (
              <div
                key={variant._id ?? variant.tempId ?? index}
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
                    {variant.sku ? (
                      <span className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs text-gray-800">
                        {variant.sku}
                      </span>
                    ) : null}
                    {colorVal ? (
                      <span className="bg-maroon-100 text-maroon-800 rounded-md px-2 py-0.5 text-xs font-medium">
                        {colorVal}
                      </span>
                    ) : null}
                  </div>
                  {variants.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeVariantRow(index)}
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
                          htmlFor={`color-picker-edit-${variant._id ?? variant.tempId}`}
                          className="border-maroon-100 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border bg-white shadow-sm"
                          style={{ backgroundColor: colorCodeVal }}
                          title="Click to select color"
                        >
                          <input
                            id={`color-picker-edit-${variant._id ?? variant.tempId}`}
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
                        {variant.newImages.length > 0 ? (
                          <ImageColorPicker
                            images={variant.newImages}
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

                {/* Per-Variant Images Section (Mandatory) */}
                <div className="border-maroon-100 flex flex-col gap-2.5 rounded-lg border bg-white p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-maroon-900 text-xs font-semibold">
                      Variant Images <span className="text-red-600">* (Mandatory)</span>
                    </span>
                    <span className="text-maroon-500 text-xs">
                      {totalImageCount} image{totalImageCount === 1 ? "" : "s"} total
                    </span>
                  </div>

                  {/* Existing Images */}
                  {variant.existingImages.length > 0 ? (
                    <div>
                      <span className="text-maroon-600 mb-1 block text-[11px] font-medium">
                        Current images:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {variant.existingImages.map((img) => (
                          <div
                            key={img.publicId}
                            className="border-maroon-100 relative h-16 w-16 overflow-hidden rounded-md border shadow-sm"
                          >
                            <Image
                              src={img.url}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(index, img.publicId)}
                              className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                              aria-label="Remove image"
                            >
                              <X className="h-3 w-3" aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Newly selected images */}
                  {variant.newImages.length > 0 ? (
                    <div>
                      <span className="text-maroon-600 mb-1 block text-[11px] font-medium">
                        Newly selected:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {variant.newImages.map((file, imgIdx) => {
                          const previewUrl = URL.createObjectURL(file);
                          return (
                            <div
                              key={imgIdx}
                              className="border-maroon-100 relative h-16 w-16 overflow-hidden rounded-md border"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewUrl}
                                alt={`New Image ${imgIdx + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveNewImage(index, imgIdx)}
                                className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                                aria-label="Remove image"
                              >
                                <X className="h-3 w-3" aria-hidden="true" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Upload button / file input */}
                  <label className="border-maroon-200 text-maroon-700 hover:bg-maroon-50 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-xs font-medium transition-colors">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span>Upload New Images for this Variant</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      multiple
                      className="sr-only"
                      onChange={(e) => handleAddNewImages(index, e.target.files)}
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
          onClick={addVariantRow}
          className="w-full gap-2 border-dashed py-3"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Another Variant</span>
        </Button>
      </div>

      {/* 4. Global Error and Save Button */}
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
          Save Changes
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORTED COMPONENT
// ---------------------------------------------------------------------------
export function EditProductClient({ product }: { product: Product }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-heading text-maroon-900 text-2xl font-bold">
          Edit {product.type === "variant" ? "Variant" : "Simple"} Product
        </h1>
        <p className="text-maroon-600 text-xs">
          Manage product information, attributes, variants, and images in one place.
        </p>
      </div>

      {product.type === "variant" ? (
        <EditVariantProductForm product={product} />
      ) : (
        <EditSimpleProductForm product={product} />
      )}
    </div>
  );
}
