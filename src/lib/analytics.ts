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
    dataLayer?: unknown[];
  }
}

export interface GaItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_variant?: string;
}

// GA4 half: a no-op whenever no real GA4 property is configured (env.ts) — same
// placeholder-credential pattern as Razorpay/Cloudinary/Sentry elsewhere in this project (see
// NOTES.md), rather than calling into a gtag that was never loaded (<GoogleAnalytics/> in
// layout.tsx also skips loading the script entirely in that case).
//
// GTM half: the same event as a standard GA4-ecommerce dataLayer push, for tags configured in
// the container (Google Ads etc. — never a second GA4 tag, see GoogleTagManager.tsx). The
// `ecommerce: null` push first is Google's recommended reset, so GTM's data model doesn't merge
// one event's items into the next. Pushing before gtm.js has loaded is fine: GTM replays the
// queue on load.
//
// Both halves are no-ops during SSR, never throw into the flow they're called from, and run
// independently so an ad blocker stopping one doesn't affect the other.
function trackEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (env.NEXT_PUBLIC_GA_MEASUREMENT_ID && window.gtag) {
    try {
      window.gtag("event", name, params);
    } catch {
      // Tracking is best-effort.
    }
  }
  if (env.NEXT_PUBLIC_GTM_ID) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({ event: name, ecommerce: params });
    } catch {
      // Tracking is best-effort.
    }
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

// Clicks on a WhatsApp updates-group invite; `location` says which one (popup/footer/home).
export function trackJoinWhatsAppGroup(location: "popup" | "footer" | "home") {
  trackEvent("join_whatsapp_group", { location });
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

function toCheckoutLineItems(lines: CheckoutLine[]): GaItem[] {
  return lines.map((line) => ({
    item_id: getTrackingItemId(line.productId, line.variantId),
    item_name: line.name,
    price: line.price,
    quantity: line.qty,
  }));
}

function toOrderItems(order: Order): GaItem[] {
  return order.items.map((item) => ({
    item_id: getOrderItemTrackingId(item),
    item_name: item.nameSnapshot,
    price: item.priceSnapshot,
    quantity: item.qty,
  }));
}

// Cart page only (not the drawer); the caller fires it once per visit.
export function trackViewCart(lines: CheckoutLine[], value: number) {
  trackEvent("view_cart", { currency: "INR", value, items: toCheckoutLineItems(lines) });
}

export function trackBeginCheckout(lines: CheckoutLine[], value: number) {
  trackEvent("begin_checkout", { currency: "INR", value, items: toCheckoutLineItems(lines) });
}

// Sent as the Razorpay modal opens for an order (useRazorpayCheckout.ts). The payment method is
// picked inside Razorpay's own modal, which the site can't observe, so payment_type is omitted.
export function trackAddPaymentInfo(order: Order) {
  trackEvent("add_payment_info", {
    currency: "INR",
    value: order.total,
    items: toOrderItems(order),
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
    items: toOrderItems(order),
  });
}
