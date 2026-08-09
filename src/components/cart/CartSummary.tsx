import { formatPrice } from "@/lib/formatPrice";

export function CartSummary({
  itemsTotal,
  shippingFee,
  total,
}: {
  itemsTotal: number;
  shippingFee: number;
  total: number;
}) {
  return (
    <div className="border-maroon-100 flex flex-col gap-1 border-t pt-3 text-sm">
      <div className="text-maroon-700 flex justify-between">
        <span>Subtotal</span>
        <span>{formatPrice(itemsTotal)}</span>
      </div>
      <div className="text-maroon-700 flex justify-between">
        <span>Shipping</span>
        <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
      </div>
      <div className="font-heading text-maroon-900 flex justify-between text-base">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
