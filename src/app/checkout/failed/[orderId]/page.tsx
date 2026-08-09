"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Script from "next/script";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { useGetOrderByIdQuery } from "@/store/api/ordersApi";

function FailedContent() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(orderId);
  const { payForOrder, isProcessing } = useRazorpayCheckout();

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center gap-3">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  if (isError || !order) {
    return <p className="text-maroon-700">We couldn&apos;t find that order.</p>;
  }

  // Retrying re-runs payment for the SAME order — it's never re-created from the cart, which
  // is already empty by this point (BACKEND_CONTRACT.md — the cart clears at order-creation,
  // not at payment).
  const canRetry = order.status === "pending" || order.status === "payment_failed";

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <XCircle className="h-16 w-16 text-red-600" aria-hidden="true" />
      <h1 className="font-heading text-maroon-900 text-2xl">Payment didn&apos;t go through</h1>
      <p className="text-maroon-600 max-w-sm text-sm">
        Order <span className="font-medium">#{order.orderNumber}</span> is saved — you can complete
        payment without re-selecting your items.
      </p>
      {canRetry ? (
        <Button onClick={() => payForOrder(order)} isLoading={isProcessing} disabled={isProcessing}>
          Retry payment
        </Button>
      ) : (
        <p className="text-maroon-600 text-sm">This order is no longer awaiting payment.</p>
      )}
      <Link href={`/account/orders/${order._id}`} className="text-maroon-700 text-sm underline">
        View order details
      </Link>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16">
        <FailedContent />
      </main>
    </ProtectedRoute>
  );
}
