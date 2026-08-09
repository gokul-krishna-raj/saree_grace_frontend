"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { VariantMiniForm } from "@/components/admin/VariantMiniForm";
import { Button } from "@/components/ui/Button";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import {
  productBaseFieldsSchema,
  type ProductBaseFormValues,
  type SimpleProductFormValues,
  simpleProductSchema,
} from "@/lib/validation/adminProduct";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetOccasionsQuery } from "@/store/api/occasionsApi";
import {
  useDeleteProductVariantMutation,
  useUpdateProductMutation,
  useUpdateProductVariantMutation,
} from "@/store/api/productsApi";
import type { Product, ProductVariant } from "@/types";

function categoryIdOf(product: Product) {
  return typeof product.category === "string" ? product.category : product.category._id;
}

function occasionIdsOf(product: Product) {
  return (product.occasions ?? []).map((occasion) =>
    typeof occasion === "string" ? occasion : occasion._id,
  );
}

function VariantRow({ productId, variant }: { productId: string; variant: ProductVariant }) {
  const [updateVariant, { isLoading: isSaving }] = useUpdateProductVariantMutation();
  const [deleteVariant, { isLoading: isDeleting }] = useDeleteProductVariantMutation();
  const [price, setPrice] = useState(String(variant.price));
  const [stock, setStock] = useState(String(variant.stock));

  async function handleSave() {
    try {
      await updateVariant({
        productId,
        variantId: variant._id,
        price: Number(price),
        stock: Number(stock),
      }).unwrap();
      toast.success("Variant updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete variant "${variant.sku}"?`)) return;
    try {
      await deleteVariant({ productId, variantId: variant._id }).unwrap();
      toast.success("Variant deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  return (
    <div className="border-maroon-50 flex flex-wrap items-end gap-3 rounded-lg border p-3">
      <div className="text-maroon-700 text-sm">
        <p className="text-maroon-900 font-medium">{variant.sku}</p>
        <p>
          {Object.entries(variant.attributes)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")}
        </p>
      </div>
      <Input
        label="Price"
        type="number"
        inputMode="decimal"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        className="w-28"
      />
      <Input
        label="Stock"
        type="number"
        inputMode="numeric"
        value={stock}
        onChange={(event) => setStock(event.target.value)}
        className="w-24"
      />
      <Button variant="secondary" onClick={handleSave} isLoading={isSaving} disabled={isSaving}>
        Save
      </Button>
      <Button variant="ghost" onClick={handleDelete} isLoading={isDeleting} disabled={isDeleting}>
        Delete
      </Button>
    </div>
  );
}

function CurrentImages({
  images,
  removedImageIds,
  onRemove,
}: {
  images: Product["images"];
  removedImageIds: string[];
  onRemove: (publicId: string) => void;
}) {
  const remaining = images.filter((image) => !removedImageIds.includes(image.publicId));

  return (
    <div>
      <span className="text-maroon-900 mb-1.5 block text-sm font-medium">Current images</span>
      {remaining.length === 0 ? (
        <p className="text-maroon-500 text-sm">No images yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {remaining.map((image) => (
            <div
              key={image.publicId}
              className="border-maroon-100 relative h-16 w-16 overflow-hidden rounded-lg border"
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
              <button
                type="button"
                onClick={() => onRemove(image.publicId)}
                aria-label="Remove image"
                className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-xs text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditSimpleProductForm({
  product,
  newImages,
  setNewImages,
  removedImageIds,
  onRemoveImage,
}: {
  product: Product;
  newImages: File[];
  setNewImages: (files: File[]) => void;
  removedImageIds: string[];
  onRemoveImage: (publicId: string) => void;
}) {
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: occasions } = useGetOccasionsQuery();
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
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
    },
  });

  async function onSubmit(values: SimpleProductFormValues) {
    setSubmitError(null);
    try {
      await updateProduct({
        id: product._id,
        ...values,
        removeImagePublicIds: removedImageIds.length ? removedImageIds : undefined,
        images: newImages,
      }).unwrap();
      toast.success("Product updated");
      setNewImages([]);
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
          label="Compare-at price (₹)"
          type="number"
          inputMode="decimal"
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
        <Input label="SKU" {...register("sku")} />
      </div>
      <CurrentImages
        images={product.images}
        removedImageIds={removedImageIds}
        onRemove={onRemoveImage}
      />
      <div>
        <span className="text-maroon-900 mb-1.5 block text-sm font-medium">Add images</span>
        <ImageDropzone files={newImages} onChange={setNewImages} disabled={isLoading} />
      </div>
      {submitError ? (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-fit">
        Save changes
      </Button>
    </form>
  );
}

function EditVariantBaseForm({
  product,
  newImages,
  setNewImages,
  removedImageIds,
  onRemoveImage,
}: {
  product: Product;
  newImages: File[];
  setNewImages: (files: File[]) => void;
  removedImageIds: string[];
  onRemoveImage: (publicId: string) => void;
}) {
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: occasions } = useGetOccasionsQuery();
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductBaseFormValues>({
    resolver: zodResolver(productBaseFieldsSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      category: categoryIdOf(product),
      occasions: occasionIdsOf(product),
      fabric: product.fabric ?? "",
      color: product.color ?? "",
      isHandloom: product.isHandloom,
    },
  });

  async function onSubmit(values: ProductBaseFormValues) {
    setSubmitError(null);
    try {
      await updateProduct({
        id: product._id,
        ...values,
        removeImagePublicIds: removedImageIds.length ? removedImageIds : undefined,
        images: newImages,
      }).unwrap();
      toast.success("Product updated");
      setNewImages([]);
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
      <label className="text-maroon-800 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("isHandloom")}
          className="border-maroon-200 h-5 w-5 rounded"
        />
        This is a handloom product
      </label>
      <CurrentImages
        images={product.images}
        removedImageIds={removedImageIds}
        onRemove={onRemoveImage}
      />
      <div>
        <span className="text-maroon-900 mb-1.5 block text-sm font-medium">Add images</span>
        <ImageDropzone files={newImages} onChange={setNewImages} disabled={isLoading} />
      </div>
      {submitError ? (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-fit">
        Save changes
      </Button>
    </form>
  );
}

export function EditProductClient({ product }: { product: Product }) {
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const onRemoveImage = (publicId: string) => setRemovedImageIds((prev) => [...prev, publicId]);

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {product.type === "simple" ? (
        <EditSimpleProductForm
          product={product}
          newImages={newImages}
          setNewImages={setNewImages}
          removedImageIds={removedImageIds}
          onRemoveImage={onRemoveImage}
        />
      ) : (
        <EditVariantBaseForm
          product={product}
          newImages={newImages}
          setNewImages={setNewImages}
          removedImageIds={removedImageIds}
          onRemoveImage={onRemoveImage}
        />
      )}

      {product.type === "variant" ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-maroon-900 text-lg">Variants</h2>
          {(product.variants ?? []).map((variant) => (
            <VariantRow key={variant._id} productId={product._id} variant={variant} />
          ))}
          <h3 className="font-heading text-maroon-900 mt-2 text-base">Add another variant</h3>
          <VariantMiniForm
            productId={product._id}
            attributeNames={product.variantAttributeNames ?? []}
            onAdded={() => undefined}
          />
        </section>
      ) : null}
    </div>
  );
}
