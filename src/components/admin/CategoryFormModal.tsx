"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
});
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoryFormModal({
  open,
  onClose,
  editingCategory,
}: {
  open: boolean;
  onClose: () => void;
  editingCategory: Category | null;
}) {
  const { data: categories } = useGetCategoriesQuery(undefined);
  const [createCategory, createResult] = useCreateCategoryMutation();
  const [updateCategory, updateResult] = useUpdateCategoryMutation();
  // RTK Query resets each mutation's own `error` on the next trigger call, so reusing it here
  // (rather than separate local state) means there's nothing to manually clear when the modal
  // reopens for a different category — one less "reset UI state on prop change" effect to write.
  const isLoading = createResult.isLoading || updateResult.isLoading;
  const mutationError = editingCategory ? updateResult.error : createResult.error;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({ resolver: zodResolver(categoryFormSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: editingCategory?.name ?? "",
        description: editingCategory?.description ?? "",
        parentCategory:
          (typeof editingCategory?.parentCategory === "string"
            ? editingCategory.parentCategory
            : "") ?? "",
      });
    }
  }, [open, editingCategory, reset]);

  // A category can't be its own parent — the backend rejects this too, but filtering it out
  // of the dropdown is a better experience than letting someone pick it and hit a 400.
  const parentOptions =
    categories?.filter((category) => category._id !== editingCategory?._id) ?? [];

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          ...values,
          parentCategory: values.parentCategory || null,
        }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory({ ...values, parentCategory: values.parentCategory || null }).unwrap();
        toast.success("Category created");
      }
      onClose();
    } catch {
      // Surfaced below via mutationError — nothing else to do here.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editingCategory ? "Edit category" : "New category"}>
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
        {mutationError ? (
          <p role="alert" className="text-sm text-red-600">
            {getApiErrorMessage(mutationError as FetchBaseQueryError | SerializedError)}
          </p>
        ) : null}
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          {editingCategory ? "Save changes" : "Create category"}
        </Button>
      </form>
    </Modal>
  );
}
