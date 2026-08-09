"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";
import {
  useApproveReviewMutation,
  useDeleteReviewMutation,
  useGetAdminReviewsQuery,
} from "@/store/api/reviewsApi";
import type { Review } from "@/types";

function ReviewRow({
  review,
  approvedFilter,
}: {
  review: Review;
  approvedFilter: "false" | "true";
}) {
  const [approveReview, { isLoading: isApproving }] = useApproveReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  async function handleApprove() {
    try {
      await approveReview({ id: review._id }).unwrap();
      toast.success("Review approved");
    } catch (error) {
      toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  async function handleDelete() {
    const verb = approvedFilter === "false" ? "Reject" : "Delete";
    if (!window.confirm(`${verb} this review?`)) return;
    try {
      await deleteReview({ id: review._id, productId: review.product }).unwrap();
      toast.success(`Review ${verb.toLowerCase()}d`);
    } catch (error) {
      toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  return (
    <div className="border-maroon-50 flex flex-col gap-2 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              "h-4 w-4",
              index < review.rating ? "fill-gold-600 text-gold-600" : "text-maroon-100",
            )}
            aria-hidden="true"
          />
        ))}
        <span className="text-maroon-900 text-sm font-medium">
          {typeof review.user === "string" ? "Verified buyer" : review.user.name}
        </span>
      </div>
      <p className="text-maroon-700 text-sm">{review.comment}</p>
      <div className="flex gap-2">
        {approvedFilter === "false" ? (
          <Button
            variant="secondary"
            onClick={handleApprove}
            isLoading={isApproving}
            disabled={isApproving}
          >
            Approve
          </Button>
        ) : null}
        <Button variant="ghost" onClick={handleDelete} isLoading={isDeleting} disabled={isDeleting}>
          {approvedFilter === "false" ? "Reject" : "Delete"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [approvedFilter, setApprovedFilter] = useState<"false" | "true">("false");
  const { data, isLoading } = useGetAdminReviewsQuery({
    approved: approvedFilter === "true",
    limit: 30,
  });

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-maroon-900 text-2xl">Reviews</h1>
        <Select
          aria-label="Filter"
          value={approvedFilter}
          onChange={(event) => setApprovedFilter(event.target.value as "false" | "true")}
          className="w-auto"
        >
          <option value="false">Pending approval</option>
          <option value="true">Approved</option>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : !data || data.reviews.length === 0 ? (
        <p className="text-maroon-600 text-sm">
          {approvedFilter === "false" ? "No reviews pending approval." : "No approved reviews yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.reviews.map((review) => (
            <ReviewRow key={review._id} review={review} approvedFilter={approvedFilter} />
          ))}
        </div>
      )}
    </div>
  );
}
