/**
 * Saree Grace Checkout Coupon Registry
 *
 * Manages active platform coupons usable during checkout.
 * Used by promotional components (e.g. Hero banner) to verify coupon validity
 * before advertising promotional discount codes to shoppers.
 */

export interface CheckoutCoupon {
  code: string;
  discountPercent: number;
  description: string;
  isActive: boolean;
}

export const ACTIVE_CHECKOUT_COUPONS: Record<string, CheckoutCoupon> = {
  WELCOME10: {
    code: "WELCOME10",
    discountPercent: 10,
    description: "10% OFF on your first order",
    isActive: true,
  },
};

/**
 * Checks whether a given coupon code is registered and active in the Saree Grace checkout system.
 */
export function isCouponUsableInCheckout(code?: string): boolean {
  if (!code) return false;
  const coupon = ACTIVE_CHECKOUT_COUPONS[code.trim().toUpperCase()];
  return Boolean(coupon && coupon.isActive);
}
