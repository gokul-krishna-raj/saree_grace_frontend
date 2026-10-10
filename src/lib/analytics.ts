import { env } from "@/lib/env";
import {
  getOrderItemTrackingId,
  getTrackingItemColour,
  getTrackingItemId,
} from "@/lib/trackingItem";
import type { Order, Product, ProductVariant } from "@/types";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export interface GaItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_variant?: string;
}

// A no-op whenever no real GA4 property is configured (env.ts) — same placeholder-credential
// pattern as Razorpay/Cloudinary/Sentry elsewhere in this project (see NOTES.md), rather than
// calling into a gtag that was never loaded (<GoogleAnalytics/> in layout.tsx also skips
// loading the script entirely in that case). Also a no-op during SSR and when an ad blocker
// kept gtag from loading, and never throws into the flow it's called from.
function trackEvent(name: string, params: Record<string, unknown>) {
  if (!env.NEXT_PUBLIC_GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag("event", name, params);
  } catch {
    // Tracking is best-effort.
  }
}

function toGaItem(product: Product, variant?: ProductVariant, quantity?: number): GaItem {
  const colour = getTrackingItemColour(product, variant);
  return {
    item_id: getTrackingItemId(product, variant),
    item_name: product.name,
    price: (variant?.price ?? product.price ?? product.startingPrice) as number,
    ...(quantity !== undefined ? { quantity } : {}),
    ...(colour ? { item_variant: colour } : {}),
  };
}

export function trackViewItem(product: Product) {
  trackEvent("view_item", {
    currency: "INR",
    value: product.price ?? product.startingPrice,
    items: [toGaItem(product)],
  });
}

export function trackAddToCart(product: Product, variant: ProductVariant | undefined, qty: number) {
  const item = toGaItem(product, variant, qty);
  trackEvent("add_to_cart", {
    currency: "INR",
    value: item.price * qty,
    items: [item],
  });
}

export interface CheckoutLine {
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  qty: number;
}

export function trackBeginCheckout(lines: CheckoutLine[], value: number) {
  trackEvent("begin_checkout", {
    currency: "INR",
    value,
    items: lines.map((line) => ({
      item_id: getTrackingItemId(line.productId, line.variantId),
      item_name: line.name,
      price: line.price,
      quantity: line.qty,
    })),
  });
}

// Only call after the payment is verified (useRazorpayCheckout.ts), and once per order — the
// caller guards that with claimPurchaseTracking().
export function trackPurchase(order: Order) {
  trackEvent("purchase", {
    transaction_id: order._id,
    currency: "INR",
    value: order.total,
    shipping: order.shippingFee,
    items: order.items.map((item) => ({
      item_id: getOrderItemTrackingId(item),
      item_name: item.nameSnapshot,
      price: item.priceSnapshot,
      quantity: item.qty,
    })),
  });
}
