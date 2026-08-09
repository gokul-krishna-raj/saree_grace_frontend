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
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { useCreateOccasionMutation, useUpdateOccasionMutation } from "@/store/api/occasionsApi";
import type { Occasion } from "@/types";

const occasionFormSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
  description: z.string().trim().max(1000).optional(),
  isActive: z.boolean(),
});
type OccasionFormValues = z.infer<typeof occasionFormSchema>;

// A fresh instance per open (via the `key` below), same reset-on-remount trick as
// CategoryFormModal's CategoryForm — see that file for why.
function OccasionForm({
  editingOccasion,
  onClose,
}: {
  editingOccasion: Occasion | null;
  onClose: () => void;
}) {
  const [createOccasion, createResult] = useCreateOccasionMutation();
  const [updateOccasion, updateResult] = useUpdateOccasionMutation();
  const isLoading = createResult.isLoading || updateResult.isLoading;
  const mutationError = editingOccasion ? updateResult.error : createResult.error;

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [removeImage, setRemoveImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OccasionFormValues>({
    resolver: zodResolver(occasionFormSchema),
    defaultValues: {
      name: editingOccasion?.name ?? "",
      description: editingOccasion?.description ?? "",
      isActive: editingOccasion?.isActive ?? true,
    },
  });

  const showExistingImage = Boolean(editingOccasion?.image) && !removeImage;

  async function onSubmit(values: OccasionFormValues) {
    try {
      const image = imageFiles[0];
      if (editingOccasion) {
        await updateOccasion({
          id: editingOccasion._id,
          ...values,
          image,
          removeImage: removeImage && !image ? true : undefined,
        }).unwrap();
        toast.success("Occasion updated");
      } else {
        await createOccasion({ ...values, image }).unwrap();
        toast.success("Occasion created");
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
      <label className="text-maroon-800 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("isActive")}
          className="border-maroon-200 h-5 w-5 rounded"
        />
        Active (visible to shoppers)
      </label>

      <div>
        <span className="text-maroon-900 mb-1.5 block text-sm font-medium">Image (optional)</span>
        {showExistingImage && editingOccasion?.image ? (
          <div className="border-maroon-100 relative mb-3 h-20 w-20 overflow-hidden rounded-full border">
            <Image
              src={editingOccasion.image.url}
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
        {editingOccasion ? "Save changes" : "Create occasion"}
      </Button>
    </form>
  );
}

export function OccasionFormModal({
  open,
  onClose,
  editingOccasion,
}: {
  open: boolean;
  onClose: () => void;
  editingOccasion: Occasion | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={editingOccasion ? "Edit occasion" : "New occasion"}>
      {open ? (
        <OccasionForm
          key={editingOccasion?._id ?? "new"}
          editingOccasion={editingOccasion}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}
