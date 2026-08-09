"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { useCreateReviewMutation } from "@/store/api/reviewsApi";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, "Please share a few words").max(2000),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;

export function WriteReviewForm({
  productId,
  orderId,
  onDone,
}: {
  productId: string;
  orderId: string;
  onDone: () => void;
}) {
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  async function onSubmit(values: ReviewFormValues) {
    try {
      await createReview({ productId, orderId, ...values }).unwrap();
      toast.success("Thanks for your review — it'll appear once approved.");
      onDone();
    } catch (error) {
      setError("root", {
        message: getApiErrorMessage(error as FetchBaseQueryError | SerializedError),
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-maroon-100 mt-4 flex flex-col gap-3 rounded-lg border p-4"
      noValidate
    >
      <label className="text-maroon-900 text-sm font-medium">
        Rating
        <select
          {...register("rating", { valueAsNumber: true })}
          className="border-maroon-100 mt-1 block h-11 w-full rounded-lg border px-3 text-base"
        >
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star} star{star > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="text-maroon-900 text-sm font-medium">
        Your review
        <textarea
          {...register("comment")}
          rows={4}
          className="border-maroon-100 mt-1 block w-full rounded-lg border p-3 text-base"
        />
        {errors.comment ? (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {errors.comment.message}
          </p>
        ) : null}
      </label>
      {errors.root ? (
        <p role="alert" className="text-sm text-red-600">
          {errors.root.message}
        </p>
      ) : null}
      <Button type="submit" isLoading={isLoading}>
        Submit review
      </Button>
    </form>
  );
}
