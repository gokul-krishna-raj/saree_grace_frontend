import { env } from "@/lib/env";
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
}

// A no-op whenever no real GA4 property is configured (env.ts) — same placeholder-credential
// pattern as Razorpay/Cloudinary/Sentry elsewhere in this project (see NOTES.md), rather than
// calling into a gtag that was never loaded (<GoogleAnalytics/> in layout.tsx also skips
// loading the script entirely in that case).
function trackEvent(name: string, params: Record<string, unknown>) {
  if (!env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
  window.gtag?.("event", name, params);
}

function toGaItem(product: Product, variant?: ProductVariant, quantity?: number): GaItem {
  return {
    item_id: variant?._id ?? product._id,
    item_name: product.name,
    price: (variant?.price ?? product.price ?? product.startingPrice) as number,
    ...(quantity !== undefined ? { quantity } : {}),
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

const TRACKED_PURCHASES_KEY = "sg_tracked_purchases";

// GA4's client-side gtag doesn't dedupe a repeated "purchase" event with the same
// transaction_id — a user refreshing or revisiting /checkout/success/[orderId] would otherwise
// double-count real revenue. sessionStorage (not state) survives exactly a refresh, which is the
// case this guards against.
function alreadyTrackedPurchase(orderNumber: string): boolean {
  try {
    const tracked: string[] = JSON.parse(sessionStorage.getItem(TRACKED_PURCHASES_KEY) ?? "[]");
    if (tracked.includes(orderNumber)) return true;
    sessionStorage.setItem(TRACKED_PURCHASES_KEY, JSON.stringify([...tracked, orderNumber]));
    return false;
  } catch {
    return false;
  }
}

export function trackPurchase(order: Order) {
  if (!env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
  if (alreadyTrackedPurchase(order.orderNumber)) return;

  trackEvent("purchase", {
    transaction_id: order.orderNumber,
    currency: "INR",
    value: order.total,
    shipping: order.shippingFee,
    items: order.items.map((item) => ({
      item_id: item.variantId ?? item.product,
      item_name: item.nameSnapshot,
      price: item.priceSnapshot,
      quantity: item.qty,
    })),
  });
}
