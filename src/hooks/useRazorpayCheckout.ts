"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { trackPurchase as trackMetaPurchase } from "@/components/analytics/MetaPixel";
import { trackAddPaymentInfo, trackPurchase as trackGaPurchase } from "@/lib/analytics";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { claimPurchaseTracking } from "@/lib/trackingItem";
import { useCreateRazorpayOrderMutation, useVerifyPaymentMutation } from "@/store/api/paymentsApi";
import type { Order } from "@/types";

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  method?: {
    netbanking?: boolean;
    card?: boolean;
    wallet?: boolean;
    upi?: boolean;
    paylater?: boolean;
    emi?: boolean;
  };
  config?: {
    display?: {
      blocks?: Record<
        string,
        {
          name?: string;
          instruments?: Array<{
            method: string;
          }>;
        }
      >;
      sequence?: string[];
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
  handler: (response: RazorpaySuccessResponse) => void;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayFailureResponse {
  error: {
    code?: string;
    description?: string;
    reason?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", callback: (response: RazorpayFailureResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function toErrorMessage(error: unknown, fallback?: string) {
  return getApiErrorMessage(error as FetchBaseQueryError | SerializedError, fallback);
}

// Only ever called after verifyPayment succeeds — never on the failed/dismissed paths — and at
// most once per order (claimPurchaseTracking). Swallows any error so analytics can never push a
// paid order onto the failed-payment route.
function trackVerifiedPurchase(order: Order) {
  try {
    if (!claimPurchaseTracking(order._id)) return;
    trackGaPurchase(order);
    trackMetaPurchase(order);
  } catch {
    // Tracking is best-effort.
  }
}

// "paying" = Razorpay's modal is open; "redirecting" = verified and navigating to the success
// page — the stage is deliberately left there (the page unmounts) so the loader doesn't drop
// for a beat and flash the now-empty checkout before the success page renders.
export type PaymentStage = "idle" | "starting" | "paying" | "verifying" | "redirecting";

// Shared by the checkout page (first payment attempt) and the failed-payment page (retry) —
// retrying re-uses the SAME internal order rather than creating a new one, since the backend
// clears the cart and decrements stock at order-creation time, not at payment time (see
// NOTES.md) — there's nothing left in the cart to rebuild a second order from, and there
// shouldn't be a duplicate order for the same purchase attempt either way.
export function useRazorpayCheckout() {
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const router = useRouter();
  const [stage, setStage] = useState<PaymentStage>("idle");

  const payForOrder = useCallback(
    async (order: Order) => {
      setStage("starting");
      try {
        const paymentOrder = await createRazorpayOrder({ orderId: order._id }).unwrap();

        // Handle development mock order
        if (paymentOrder.razorpayOrderId.startsWith("order_mock_")) {
          toast.info("Simulating payment in development mock mode...");
          setStage("verifying");
          try {
            await verifyPayment({
              razorpayOrderId: paymentOrder.razorpayOrderId,
              razorpayPaymentId: `pay_mock_${Date.now()}`,
              razorpaySignature: "mock_signature",
            }).unwrap();
            setStage("redirecting");
            router.push(`/checkout/success/${order._id}`);
            trackVerifiedPurchase(order);
          } catch (err) {
            setStage("idle");
            toast.error(toErrorMessage(err, "We couldn't confirm your test payment."));
            router.push(`/checkout/failed/${order._id}`);
          }
          return;
        }

        if (typeof window === "undefined" || !window.Razorpay) {
          toast.error("Payment couldn't load. Please refresh and try again.");
          setStage("idle");
          router.push(`/checkout/failed/${order._id}`);
          return;
        }

        const razorpay = new window.Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          order_id: paymentOrder.razorpayOrderId,
          name: "Saree Grace",
          description: `Order ${order.orderNumber}`,
          prefill: order.shippingAddress
            ? {
                name: order.shippingAddress.fullName,
                contact: order.shippingAddress.phone,
              }
            : undefined,
          method: {
            upi: true,
            card: true,
            netbanking: false,
            wallet: false,
            paylater: false,
            emi: false,
          },
          config: {
            display: {
              blocks: {
                paymentMethods: {
                  name: "Pay via UPI or Card",
                  instruments: [{ method: "upi" }, { method: "card" }],
                },
              },
              sequence: ["block.paymentMethods"],
              preferences: {
                show_default_blocks: false,
              },
            },
          },
          theme: { color: "#7A2635" },
          handler: (response) => {
            // Real payment confirmation only ever comes from the backend's own signature
            // verification below — this callback firing is not treated as "paid" on its own.
            setStage("verifying");
            void (async () => {
              try {
                await verifyPayment({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }).unwrap();
                setStage("redirecting");
                router.push(`/checkout/success/${order._id}`);
                trackVerifiedPurchase(order);
              } catch (error) {
                setStage("idle");
                toast.error(toErrorMessage(error, "We couldn't confirm your payment."));
                router.push(`/checkout/failed/${order._id}`);
              }
            })();
          },
          modal: {
            ondismiss: () => {
              setStage("idle");
              router.push(`/checkout/failed/${order._id}`);
            },
          },
        });
        // A failed attempt leaves the modal open so the customer can retry with another
        // method — just surface the reason here; closing the modal (ondismiss) is what
        // routes to the failed-payment page.
        razorpay.on("payment.failed", (response) => {
          toast.error(response.error?.description || "Payment failed. Please try again.");
        });
        try {
          trackAddPaymentInfo(order);
        } catch {
          // Tracking is best-effort — it must never send a payable order to the failed page.
        }
        setStage("paying");
        razorpay.open();
      } catch (error) {
        setStage("idle");
        toast.error(toErrorMessage(error, "Payment initialization failed."));
        router.push(`/checkout/failed/${order._id}`);
      }
    },
    [createRazorpayOrder, verifyPayment, router],
  );

  return { payForOrder, stage, isProcessing: stage !== "idle" };
}
