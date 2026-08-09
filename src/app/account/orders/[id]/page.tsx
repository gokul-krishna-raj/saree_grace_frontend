"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Script from "next/script";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { formatPrice } from "@/lib/formatPrice";
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { useGetOrderByIdQuery } from "@/store/api/ordersApi";

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(id);
  const { payForOrder, isProcessing } = useRazorpayCheckout();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return <p className="text-maroon-700">We couldn&apos;t find that order.</p>;
  }

  const needsPayment = order.status === "pending" || order.status === "payment_failed";

  return (
    <div className="flex flex-col gap-6">
      <Link href="/account/orders" className="text-maroon-700 text-sm underline">
        ← Back to orders
      </Link>
      {needsPayment ? (
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-maroon-900 text-2xl">Order #{order.orderNumber}</h1>
          <p className="text-maroon-600 text-sm">
            Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
          </p>
        </div>
        <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {needsPayment ? (
        <div className="border-gold-100 bg-gold-50 rounded-lg border p-4">
          <p className="text-maroon-800 mb-3 text-sm">This order is awaiting payment.</p>
          <Button
            onClick={() => payForOrder(order)}
            isLoading={isProcessing}
            disabled={isProcessing}
          >
            Complete payment
          </Button>
        </div>
      ) : null}

      <section className="border-maroon-50 flex flex-col gap-2 rounded-lg border bg-white p-4">
        <h2 className="font-heading text-maroon-900 text-lg">Status history</h2>
        <ol className="text-maroon-700 flex flex-col gap-2 text-sm">
          {order.statusHistory.map((entry, index) => (
            <li
              key={index}
              className="border-maroon-50 flex justify-between gap-4 border-b pb-2 last:border-0"
            >
              <span>{ORDER_STATUS_LABELS[entry.status]}</span>
              <span className="text-maroon-400">
                {new Date(entry.changedAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-maroon-50 flex flex-col gap-2 rounded-lg border bg-white p-4">
        <h2 className="font-heading text-maroon-900 text-lg">Items</h2>
        <ul className="text-maroon-700 flex flex-col gap-2 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>
                {item.nameSnapshot} × {item.qty}
              </span>
              <span>{formatPrice(item.priceSnapshot * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="border-maroon-100 mt-2 flex flex-col gap-1 border-t pt-2 text-sm">
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

      <section className="border-maroon-50 text-maroon-700 flex flex-col gap-1 rounded-lg border bg-white p-4 text-sm">
        <h2 className="font-heading text-maroon-900 mb-1 text-lg">Shipping address</h2>
        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.line1}</p>
        {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
          {order.shippingAddress.postalCode}
        </p>
        <p>{order.shippingAddress.phone}</p>
      </section>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <OrderDetailContent />
      </main>
    </ProtectedRoute>
  );
}
