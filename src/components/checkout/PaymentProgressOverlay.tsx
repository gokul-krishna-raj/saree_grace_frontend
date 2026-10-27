"use client";

import type { PaymentStage } from "@/hooks/useRazorpayCheckout";

const STAGE_COPY: Record<Exclude<PaymentStage, "idle">, { title: string; message: string }> = {
  starting: {
    title: "Preparing secure payment...",
    message: "Connecting to Razorpay. This only takes a moment.",
  },
  paying: {
    title: "Waiting for your payment...",
    message: "Complete the payment in the Razorpay window to continue.",
  },
  verifying: {
    title: "Confirming your payment...",
    message:
      "Please do not refresh or close this page while we verify your transaction and prepare your order.",
  },
  redirecting: {
    title: "Payment confirmed!",
    message: "Taking you to your order...",
  },
};

// Full-screen so a slow backend response never leaves the customer looking at a stale page (or
// the emptied cart) with no feedback. Sits under Razorpay's own modal while it's open.
export function PaymentProgressOverlay({ stage }: { stage: PaymentStage }) {
  if (stage === "idle") return null;
  const { title, message } = STAGE_COPY[stage];

  return (
    <div
      className="bg-background/95 fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 px-4 text-center backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="border-maroon-200 border-t-maroon-700 h-12 w-12 animate-spin rounded-full border-4" />
      <h2 className="font-heading text-maroon-900 text-xl">{title}</h2>
      <p className="text-maroon-600 max-w-sm text-sm">{message}</p>
    </div>
  );
}
