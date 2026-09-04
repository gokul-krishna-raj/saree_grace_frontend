"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { trackPurchase } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/formatPrice";
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { useGetOrderByIdQuery } from "@/store/api/ordersApi";

function SuccessSkeleton() {
  return (
    <div
      className="flex w-full flex-col items-center gap-6 text-center"
      role="status"
      aria-live="polite"
    >
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="border-maroon-50 w-full rounded-lg border bg-white p-5 text-left">
        <Skeleton className="mb-3 h-5 w-32" />
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="border-maroon-100 mt-4 border-t pt-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>

      <div className="border-maroon-50 w-full rounded-lg border bg-white p-5 text-left">
        <Skeleton className="mb-2 h-5 w-36" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
    </div>
  );
}

function SuccessContent() {
  const { orderId } = useParams<{ orderId: string }>();
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (order) trackPurchase(order);
    // Fire once per order landed on, not on every unrelated re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?._id]);

  if (isLoading && !order) {
    return <SuccessSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="border-maroon-100 flex w-full flex-col items-center gap-4 rounded-lg border bg-white p-8 text-center">
        <h2 className="font-heading text-maroon-900 text-xl">
          We couldn&apos;t load your order details
        </h2>
        <p className="text-maroon-600 max-w-sm text-sm">
          If your payment was successful, your order is safe and being processed. You can retry
          loading or view all your orders.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/account/orders" className={cn(buttonVariants({ variant: "primary" }))}>
            View order history
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-600" aria-hidden="true" />
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-heading text-maroon-900 text-2xl lg:text-3xl">Order confirmed!</h1>
        <div className="flex items-center gap-2">
          <p className="text-maroon-700 font-medium">Order #{order.orderNumber}</p>
          <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>
        <p className="text-maroon-600 max-w-sm text-sm">
          Thank you for your purchase! We&apos;ll send you an update when it ships.
        </p>
      </div>

      <section className="border-maroon-50 w-full rounded-lg border bg-white p-5 text-left">
        <h2 className="font-heading text-maroon-900 mb-3 text-lg">Order items</h2>
        <ul className="text-maroon-700 flex flex-col gap-3 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-center justify-between gap-4">
              <span className="flex-1 font-medium">
                {item.nameSnapshot}{" "}
                <span className="text-maroon-500 font-normal">× {item.qty}</span>
              </span>
              <span className="text-maroon-900 font-semibold">
                {formatPrice(item.priceSnapshot * item.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-maroon-100 mt-4 flex flex-col gap-1.5 border-t pt-3 text-sm">
          <div className="text-maroon-700 flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.itemsTotal)}</span>
          </div>
          <div className="text-maroon-700 flex justify-between">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span>
          </div>
          <div className="font-heading text-maroon-900 flex justify-between text-base">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="border-maroon-50 text-maroon-700 w-full rounded-lg border bg-white p-5 text-left text-sm">
        <h2 className="font-heading text-maroon-900 mb-2 text-lg">Shipping address</h2>
        <p className="text-maroon-900 font-medium">{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.line1}</p>
        {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
          {order.shippingAddress.postalCode}
        </p>
        <p className="text-maroon-600 mt-1">Phone: {order.shippingAddress.phone}</p>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={`/account/orders/${order._id}`}
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          Track order
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
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12">
        <SuccessContent />
      </main>
    </ProtectedRoute>
  );
}
