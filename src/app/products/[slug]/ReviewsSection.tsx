"use client";

import { skipToken } from "@reduxjs/toolkit/query/react";
import { Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { useGetMyOrdersQuery } from "@/store/api/ordersApi";
import { useGetProductReviewsQuery } from "@/store/api/reviewsApi";
import { useAppSelector } from "@/store/hooks";

import { WriteReviewForm } from "./WriteReviewForm";

export function ReviewsSection({ productId }: { productId: string }) {
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");
  const { data: reviewsResult, isLoading } = useGetProductReviewsQuery({ productId, limit: 20 });
  const { data: myOrders } = useGetMyOrdersQuery(
    isAuthenticated ? { status: "delivered", limit: 50 } : skipToken,
  );
  const [showForm, setShowForm] = useState(false);

  // Eligibility per BACKEND_CONTRACT.md: order must belong to the user, be `delivered`, and
  // include this product as a line item — enforced server-side regardless, but checking here
  // avoids showing a "write a review" button that would just 400/403 on submit. There's no
  // "have I already reviewed this" endpoint, so a duplicate attempt surfaces the backend's own
  // 409 as a form error instead of being pre-empted client-side.
  const eligibleOrder = myOrders?.orders.find((order) =>
    order.items.some((item) => item.product === productId),
  );

  const reviews = reviewsResult?.reviews ?? [];
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));
  const avgRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <section className="px-4 py-8">
      <h2 className="font-heading text-maroon-900 mb-4 text-xl">Reviews</h2>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : reviews.length === 0 ? (
        <p className="text-maroon-600 text-sm">
          No reviews yet — be the first to share your experience.
        </p>
      ) : (
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-heading text-maroon-900 text-2xl">{avgRating.toFixed(1)}</span>
            <Star className="fill-gold-600 text-gold-600 h-5 w-5" aria-hidden="true" />
            <span className="text-maroon-600 text-sm">({reviews.length} reviews)</span>
          </div>
          {ratingCounts.map(({ star, count }) => (
            <div key={star} className="text-maroon-600 flex items-center gap-2 text-sm">
              <span className="w-14">{star} star</span>
              <div className="bg-maroon-50 h-2 flex-1 rounded-full">
                <div
                  className="bg-gold-500 h-2 rounded-full"
                  style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                />
              </div>
              <span className="w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      )}

      {eligibleOrder && !showForm ? (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          Write a review
        </Button>
      ) : null}
      {eligibleOrder && showForm ? (
        <WriteReviewForm
          productId={productId}
          orderId={eligibleOrder._id}
          onDone={() => setShowForm(false)}
        />
      ) : null}

      <ul className="mt-6 flex flex-col gap-4">
        {reviews.map((review) => (
          <li key={review._id} className="border-maroon-50 rounded-lg border p-4">
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
            <p className="text-maroon-700 mt-2 text-sm">{review.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
