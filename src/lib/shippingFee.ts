// Mirrors the backend's state-tiered shipping rule exactly (order.service.ts,
// `computeShippingFee`) so the checkout preview matches what the order will actually charge.
const SHIPPING_FEE_BY_STATE: Record<string, number> = {
  "tamil nadu": 40,
  kerala: 60,
  "andhra pradesh": 60,
  karnataka: 60,
};
const DEFAULT_SHIPPING_FEE = 130;

export function getShippingFeeForState(state: string): number {
  return SHIPPING_FEE_BY_STATE[state.trim().toLowerCase()] ?? DEFAULT_SHIPPING_FEE;
}
