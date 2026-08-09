import type { OrderStatus } from "@/types";

// Mirrors the backend's orderStateMachine.ts exactly (BACKEND_CONTRACT.md) — used to restrict
// the admin status-update UI to transitions that will actually succeed, instead of letting an
// admin pick anything and learn about the state machine one 409 at a time.
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "payment_failed", "cancelled"],
  payment_failed: ["pending", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
