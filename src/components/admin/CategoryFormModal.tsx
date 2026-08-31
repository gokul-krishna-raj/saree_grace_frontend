"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/store/api/categoriesApi";
import type { Category } from "@/types";

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
  description: z.string().trim().max(1000).optional(),
  parentCategory: z.string().optional(),
  seoTitle: z.string().trim().max(100, "Maximum 100 characters").optional(),
  seoDescription: z.string().trim().max(300, "Maximum 300 characters").optional(),
});
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// A fresh instance per open (via the `key` below) so every field — including local-only UI
// state like the picked image file — starts from the right values without a reset-on-prop
// effect; unmounting on close and remounting on open already clears everything for free.
function CategoryForm({
  editingCategory,
  onClose,
}: {
  editingCategory: Category | null;
  onClose: () => void;
}) {
  const { data: categories } = useGetCategoriesQuery(undefined);
  const [createCategory, createResult] = useCreateCategoryMutation();
  const [updateCategory, updateResult] = useUpdateCategoryMutation();
  const isLoading = createResult.isLoading || updateResult.isLoading;
  const mutationError = editingCategory ? updateResult.error : createResult.error;

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [removeImage, setRemoveImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: editingCategory?.name ?? "",
      description: editingCategory?.description ?? "",
      seoTitle: editingCategory?.seoTitle ?? "",
      seoDescription: editingCategory?.seoDescription ?? "",
      parentCategory:
        (typeof editingCategory?.parentCategory === "string"
          ? editingCategory.parentCategory
          : "") ?? "",
    },
  });

  // A category can't be its own parent — the backend rejects this too, but filtering it out
  // of the dropdown is a better experience than letting someone pick it and hit a 400.
  const parentOptions =
    categories?.filter((category) => category._id !== editingCategory?._id) ?? [];

  const showExistingImage = Boolean(editingCategory?.image) && !removeImage;

  async function onSubmit(values: CategoryFormValues) {
    try {
      const image = imageFiles[0];
      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          ...values,
          parentCategory: values.parentCategory || null,
          image,
          // Only clears the image when the admin removed it without picking a replacement —
          // picking a new file already replaces the old one on the backend.
          removeImage: removeImage && !image ? true : undefined,
        }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory({
          ...values,
          parentCategory: values.parentCategory || null,
          image,
        }).unwrap();
        toast.success("Category created");
      }
      onClose();
    } catch {
      // Surfaced below via mutationError — nothing else to do here.
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input label="Name" error={errors.name?.message} {...register("name")} />
      <Input label="Description (optional)" {...register("description")} />
      <Select label="Parent category (optional)" {...register("parentCategory")}>
        <option value="">No parent (top-level)</option>
        {parentOptions.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </Select>

      <div className="border-maroon-100 bg-maroon-50/50 flex flex-col gap-3 rounded-lg border p-3">
        <h4 className="font-heading text-maroon-900 text-sm">SEO Settings (Optional)</h4>
        <Input
          label="SEO Meta Title"
          placeholder="e.g. Pure Silk Sarees Collection | Saree Grace"
          error={errors.seoTitle?.message}
          {...register("seoTitle")}
        />
        <label className="text-maroon-900 flex flex-col gap-1.5 text-sm font-medium">
          SEO Meta Description
          <textarea
            rows={2}
            placeholder="e.g. Shop handcrafted pure silk sarees from traditional Elampillai weavers..."
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
        <span className="text-maroon-900 mb-1.5 block text-sm font-medium">Image (optional)</span>
        {showExistingImage && editingCategory?.image ? (
          <div className="border-maroon-100 relative mb-3 h-20 w-20 overflow-hidden rounded-full border">
            <Image
              src={editingCategory.image.url}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setRemoveImage(true)}
              aria-label="Remove image"
              className="absolute top-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600"
            >
              ✕
            </button>
          </div>
        ) : null}
        <ImageDropzone
          files={imageFiles}
          onChange={setImageFiles}
          maxFiles={1}
          disabled={isLoading}
          label="Drag an image here, or click to browse"
        />
      </div>

      {mutationError ? (
        <p role="alert" className="text-sm text-red-600">
          {getApiErrorMessage(mutationError as FetchBaseQueryError | SerializedError)}
        </p>
      ) : null}
      <Button type="submit" isLoading={isLoading} disabled={isLoading}>
        {editingCategory ? "Save changes" : "Create category"}
      </Button>
    </form>
  );
}

export function CategoryFormModal({
  open,
  onClose,
  editingCategory,
}: {
  open: boolean;
  onClose: () => void;
  editingCategory: Category | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={editingCategory ? "Edit category" : "New category"}>
      {open ? (
        <CategoryForm
          key={editingCategory?._id ?? "new"}
          editingCategory={editingCategory}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}
