// Mirrors the backend's state-tiered shipping rule exactly (shipping.service.ts,
// `computeShippingFeeForState`). Checkout prices from the pincode via the backend's shipping
// quote; this is only the fallback when that quote can't be fetched.
const SHIPPING_FEE_BY_STATE: Record<string, number> = {
  "tamil nadu": 40,
  puducherry: 40,
  pondicherry: 40,
  kerala: 60,
  "andhra pradesh": 60,
  karnataka: 60,
};
const DEFAULT_SHIPPING_FEE = 130;

export function getShippingFeeForState(state: string): number {
  return SHIPPING_FEE_BY_STATE[state.trim().toLowerCase()] ?? DEFAULT_SHIPPING_FEE;
}
