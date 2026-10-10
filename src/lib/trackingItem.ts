import { isColorAttribute } from "@/lib/colorCode";
import type { OrderItem, Product, ProductVariant } from "@/types";

type IdRef = string | { _id: string } | null | undefined;

function idOf(ref: IdRef): string | undefined {
  if (!ref) return undefined;
  return typeof ref === "string" ? ref : ref._id;
}

// The one item-ID scheme shared by GA4 (item_id) and Meta (content_ids): the variant's id when
// the line is a specific variant, otherwise the product's id. A product feed for Merchant Center
// or a Meta catalog must use the same ids (with item_group_id = product id for variants) for
// events to match catalog items.
export function getTrackingItemId(product: IdRef, variant?: IdRef): string {
  return idOf(variant) ?? idOf(product) ?? "";
}

export function getOrderItemTrackingId(item: OrderItem): string {
  return getTrackingItemId(item.product, item.variantId);
}

// Colour for GA4 item_variant: the variant's "color"/"colour" attribute, else the product-level
// colour. Order items and cart lines don't carry either, so purchase/begin_checkout omit it.
export function getTrackingItemColour(
  product: Pick<Product, "color">,
  variant?: Pick<ProductVariant, "attributes">,
): string | undefined {
  const attributes = variant?.attributes ?? {};
  const key = Object.keys(attributes).find(isColorAttribute);
  const colour = (key ? attributes[key] : undefined) ?? product.color;
  return colour?.trim() || undefined;
}

const TRACKED_PURCHASES_KEY = "sg_tracked_purchases";

// Purchase is sent from the payment-verified handler, never from the success page, so a refresh
// there can't re-send it. This additionally makes it once-per-order across a second verify
// round-trip (e.g. a retry from the failed page after a late success) and across tabs.
// Returns true the first time it's called for an order, false afterwards.
export function claimPurchaseTracking(orderId: string): boolean {
  try {
    const tracked: string[] = JSON.parse(localStorage.getItem(TRACKED_PURCHASES_KEY) ?? "[]");
    if (tracked.includes(orderId)) return false;
    localStorage.setItem(TRACKED_PURCHASES_KEY, JSON.stringify([...tracked, orderId].slice(-50)));
    return true;
  } catch {
    return true;
  }
}
