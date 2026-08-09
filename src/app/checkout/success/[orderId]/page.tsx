"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { buttonVariants } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { trackPurchase } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { useGetOrderByIdQuery } from "@/store/api/ordersApi";

function SuccessContent() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(orderId);

  useEffect(() => {
    if (order) trackPurchase(order);
    // Fire once per order landed on, not on every unrelated re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?._id]);

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center gap-3">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (isError || !order) {
    return <p className="text-maroon-700">We couldn&apos;t find that order.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-600" aria-hidden="true" />
      <h1 className="font-heading text-maroon-900 text-2xl">Order confirmed!</h1>
      <p className="text-maroon-700">
        Order <span className="font-medium">#{order.orderNumber}</span>
      </p>
      <p className="text-maroon-600 max-w-sm text-sm">
        We&apos;ll send you an update when it ships. You can track your order anytime from your
        account.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={`/account/orders/${order._id}`}
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          View order
        </Link>
        <Link href="/products" className={cn(buttonVariants({ variant: "primary" }))}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16">
        <SuccessContent />
      </main>
    </ProtectedRoute>
  );
}
