"use client";

import { skipToken } from "@reduxjs/toolkit/query/react";
import { Star } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { useGetMyOrdersQuery } from "@/store/api/ordersApi";
import { useGetProductReviewsQuery } from "@/store/api/reviewsApi";
import { useAppSelector } from "@/store/hooks";

// The review form (react-hook-form + zod) is only needed by a signed-in buyer who clicks
// "Write a review" — loading it on demand keeps ~75 KB of validation code off every PDP.
const WriteReviewForm = dynamic(
  () => import("./WriteReviewForm").then((mod) => mod.WriteReviewForm),
  {
    ssr: false,
  },
);

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
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="container-page scroll-mt-24 pt-14 pb-4 lg:pt-20"
    >
      <div className="border-border border-t pt-10 lg:pt-14">
        <h2 id="reviews-title" className="text-heading-lg text-foreground mb-6">
          Customer reviews
        </h2>

        {isLoading ? (
          <Skeleton className="h-24 w-full max-w-md" />
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No reviews yet — be the first to share your experience.
          </p>
        ) : (
          <div className="bg-cream mb-6 flex flex-col gap-3 rounded-md p-6 sm:max-w-md">
            <div className="flex items-center gap-3">
              <span className="font-display text-foreground text-3xl">{avgRating.toFixed(1)}</span>
              <span className="sr-only">out of 5 stars</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "h-5 w-5",
                      index < Math.round(avgRating) ? "fill-gold-500 text-gold-500" : "text-border",
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
            </div>
            {ratingCounts.map(({ star, count }) => (
              <div
                key={star}
                className="text-muted-foreground flex items-center gap-2 text-xs font-medium"
              >
                <span className="w-12">{star} star</span>
                <div className="bg-card h-1.5 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-gold-500 h-1.5 rounded-full"
                    style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-right tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        )}

        {eligibleOrder && !showForm ? (
          <Button variant="outline" onClick={() => setShowForm(true)} className="mb-6">
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

        <ul className="mt-6 flex max-w-3xl flex-col gap-5">
          {reviews.map((review) => (
            <li key={review._id} className="border-border border-b pb-5">
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-0.5"
                  role="img"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        "h-4 w-4",
                        index < review.rating ? "fill-gold-500 text-gold-500" : "text-border",
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="text-foreground text-sm font-semibold">
                  {typeof review.user === "string" ? "Verified buyer" : review.user.name}
                </span>
              </div>
              <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
