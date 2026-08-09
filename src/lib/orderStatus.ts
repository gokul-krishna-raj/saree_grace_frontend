import type { OrderStatus } from "@/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Payment pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment failed",
};

export const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "maroon" | "gold" | "outline" | "danger"
> = {
  pending: "outline",
  payment_failed: "danger",
  paid: "gold",
  processing: "gold",
  shipped: "gold",
  delivered: "maroon",
  cancelled: "danger",
};
