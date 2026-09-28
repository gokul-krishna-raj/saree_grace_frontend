import { formatPrice } from "@/lib/formatPrice";

// Shipping depends on the delivery state (see lib/shippingFee.ts, mirroring the backend), so the
// cart shows the subtotal and defers shipping to checkout, where the address is known.
export function CartSummary({
  itemsTotal,
  shippingFee,
  total,
  shippingPendingLabel = "Calculated at checkout",
}: {
  itemsTotal: number;
  shippingPendingLabel?: string;
  /** `null` = calculated at checkout. */
  shippingFee: number | null;
  total: number;
}) {
  return (
    <dl className="flex flex-col gap-2 text-sm">
      <div className="text-muted-foreground flex justify-between">
        <dt>Subtotal</dt>
        <dd className="text-foreground tabular-nums">{formatPrice(itemsTotal)}</dd>
      </div>
      <div className="text-muted-foreground flex justify-between">
        <dt>Shipping</dt>
        <dd className="text-right">
          {shippingFee === null
            ? shippingPendingLabel
            : shippingFee === 0
              ? "Free"
              : formatPrice(shippingFee)}
        </dd>
      </div>
      <div className="border-border text-foreground mt-1 flex justify-between border-t pt-3 text-base font-semibold">
        <dt>{shippingFee === null ? "Estimated total" : "Total"}</dt>
        <dd className="tabular-nums">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
