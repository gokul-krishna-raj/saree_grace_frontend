"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/lib/formatPrice";
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { useGetAdminOrdersQuery } from "@/store/api/ordersApi";
import type { Order, OrderStatus } from "@/types";

const STATUS_FILTERS: Array<OrderStatus | "all"> = [
  "all",
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "payment_failed",
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [orders, setOrders] = useState<Order[]>([]);
  const { data, isLoading, isFetching } = useGetAdminOrdersQuery({
    cursor,
    limit: 20,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const seenIds = new Set(orders.map((order) => order._id));
  const merged =
    data && cursor !== undefined
      ? [...orders, ...data.orders.filter((order) => !seenIds.has(order._id))]
      : (data?.orders ?? orders);

  function handleFilterChange(next: OrderStatus | "all") {
    setStatusFilter(next);
    setCursor(undefined);
    setOrders([]);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-maroon-900 text-2xl">Orders</h1>
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(event) => handleFilterChange(event.target.value as OrderStatus | "all")}
          className="w-auto"
        >
          {STATUS_FILTERS.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "All statuses" : ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : merged.length === 0 ? (
        <p className="text-maroon-600 text-sm">No orders match this filter.</p>
      ) : (
        <div className="divide-maroon-50 border-maroon-50 flex flex-col divide-y rounded-lg border bg-white">
          {merged.map((order) => (
            <Link
              key={order._id}
              href={`/admin/orders/${order._id}`}
              className="hover:bg-maroon-50 flex items-center justify-between gap-3 p-3"
            >
              <div>
                <p className="text-maroon-900 font-medium">#{order.orderNumber}</p>
                <p className="text-maroon-600 text-sm">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
              </div>
              <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <span className="text-maroon-900 font-medium">{formatPrice(order.total)}</span>
            </Link>
          ))}
        </div>
      )}

      {data?.nextCursor ? (
        <Button
          variant="ghost"
          onClick={() => {
            setOrders(merged);
            setCursor(data.nextCursor ?? undefined);
          }}
          isLoading={isFetching}
          disabled={isFetching}
          className="mt-3"
        >
          Load more
        </Button>
      ) : null}
    </div>
  );
}
