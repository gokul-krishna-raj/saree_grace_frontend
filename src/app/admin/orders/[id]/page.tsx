"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatPrice } from "@/lib/formatPrice";
import { ALLOWED_STATUS_TRANSITIONS } from "@/lib/orderStateMachine";
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { toast } from "@/lib/toast";
import { useGetAdminOrderByIdQuery, useUpdateOrderStatusMutation } from "@/store/api/ordersApi";
import type { OrderStatus } from "@/types";

function StatusUpdateForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const options = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [carrier, setCarrier] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [note, setNote] = useState("");

  if (options.length === 0) {
    return <p className="text-maroon-600 text-sm">This order is in a final state.</p>;
  }

  async function handleUpdate() {
    if (!nextStatus) return;
    try {
      await updateStatus({
        id: orderId,
        status: nextStatus,
        note: note || undefined,
        carrier: carrier || undefined,
        trackingId: trackingId || undefined,
        trackingUrl: trackingUrl || undefined,
      }).unwrap();
      toast.success("Order status updated");
      setNextStatus("");
      setNote("");
    } catch (error) {
      toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  return (
    <div className="border-maroon-100 bg-gold-50 flex flex-col gap-3 rounded-lg border p-4">
      <Select
        label="Update status to"
        value={nextStatus}
        onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
      >
        <option value="">Select a status</option>
        {options.map((status) => (
          <option key={status} value={status}>
            {ORDER_STATUS_LABELS[status]}
          </option>
        ))}
      </Select>
      {nextStatus === "shipped" ? (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
          <Input
            label="Tracking ID"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />
          <Input
            label="Tracking URL"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            className="col-span-2"
          />
        </div>
      ) : null}
      <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button
        onClick={handleUpdate}
        isLoading={isLoading}
        disabled={isLoading || !nextStatus}
        className="w-fit"
      >
        Update status
      </Button>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useGetAdminOrderByIdQuery(id);

  if (isLoading) return <Skeleton className="h-96 w-full max-w-2xl" />;
  if (isError || !order) return <p className="text-maroon-700">Couldn&apos;t find that order.</p>;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link href="/admin/orders" className="text-maroon-700 text-sm underline">
        ← Back to orders
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-maroon-900 text-2xl">Order #{order.orderNumber}</h1>
        <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <StatusUpdateForm orderId={order._id} currentStatus={order.status} />

      <section className="border-maroon-50 rounded-lg border bg-white p-4">
        <h2 className="font-heading text-maroon-900 mb-2 text-lg">Items</h2>
        <ul className="text-maroon-700 flex flex-col gap-1 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>
                {item.nameSnapshot} × {item.qty}
              </span>
              <span>{formatPrice(item.priceSnapshot * item.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="border-maroon-100 font-heading text-maroon-900 mt-2 flex justify-between border-t pt-2 text-base">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </p>
      </section>

      <section className="border-maroon-50 text-maroon-700 rounded-lg border bg-white p-4 text-sm">
        <h2 className="font-heading text-maroon-900 mb-2 text-lg">Shipping address</h2>
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
