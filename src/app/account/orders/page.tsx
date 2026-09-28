"use client";

import Link from "next/link";
import { useState } from "react";

import { AccountNav } from "@/components/account/AccountNav";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { buttonVariants } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/formatPrice";
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { useGetMyOrdersQuery } from "@/store/api/ordersApi";
import type { Order } from "@/types";

function OrderHistoryContent() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [orders, setOrders] = useState<Order[]>([]);
  const { data, isLoading, isFetching, isError, refetch } = useGetMyOrdersQuery({
    cursor,
    limit: 10,
  });

  // Accumulate pages as "Load more" is clicked — a deliberate manual-pagination choice here
  // (unlike the product grid's intersection-observer infinite scroll, Section 6), since an
  // account's order list is typically short and a "Load more" button is easier to navigate
  // back to a specific point in than continuous scroll for this kind of record-lookup UI.
  const seenIds = new Set(orders.map((order) => order._id));
  const merged =
    data && cursor !== undefined
      ? [...orders, ...data.orders.filter((order) => !seenIds.has(order._id))]
      : (data?.orders ?? orders);

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (isError && orders.length === 0) {
    return (
      <ErrorState
        headingAs="h1"
        title="Couldn't load your orders"
        message="Check your connection and try again."
        onRetry={refetch}
        isRetrying={isFetching}
      />
    );
  }

  if (merged.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-maroon-700">You haven&apos;t placed any orders yet.</p>
        <Link href="/products" className={cn(buttonVariants({ variant: "primary" }))}>
          Shop sarees
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {merged.map((order) => (
        <Link
          key={order._id}
          href={`/account/orders/${order._id}`}
          className="border-maroon-50 hover:border-maroon-200 flex flex-col gap-1 rounded-lg border bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-maroon-900 font-medium">#{order.orderNumber}</span>
            <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <div className="text-maroon-600 flex items-center justify-between text-sm">
            <span>
              {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </Link>
      ))}
      {data?.nextCursor ? (
        <Button
          variant="ghost"
          onClick={() => {
            setOrders(merged);
            setCursor(data.nextCursor ?? undefined);
          }}
          isLoading={isFetching}
          disabled={isFetching}
          className="mt-2"
        >
          Load more
        </Button>
      ) : null}
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="font-heading text-maroon-900 mb-4 text-2xl">Your orders</h1>
        <AccountNav />
        <OrderHistoryContent />
      </main>
    </ProtectedRoute>
  );
}
