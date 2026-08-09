import Link from "next/link";

import { formatPrice } from "@/lib/formatPrice";

interface PriceRange {
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

const PRICE_RANGES: PriceRange[] = [
  { label: `Under ${formatPrice(999)}`, maxPrice: 999 },
  { label: `${formatPrice(999)} - ${formatPrice(1999)}`, minPrice: 999, maxPrice: 1999 },
  { label: `${formatPrice(1999)} - ${formatPrice(2999)}`, minPrice: 1999, maxPrice: 2999 },
  { label: `${formatPrice(2999)} - ${formatPrice(4999)}`, minPrice: 2999, maxPrice: 4999 },
  { label: `Above ${formatPrice(4999)}`, minPrice: 4999 },
];

function buildHref({ minPrice, maxPrice }: PriceRange): string {
  const params = new URLSearchParams();
  if (minPrice !== undefined) params.set("minPrice", String(minPrice));
  if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
  return `/products?${params.toString()}`;
}

export function ShopByPrice() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-maroon-900 px-4 text-2xl">Shop by Price</h2>
      <div className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-1">
        {PRICE_RANGES.map((range) => (
          <Link
            key={range.label}
            href={buildHref(range)}
            className="border-maroon-100 bg-maroon-50 hover:border-maroon-400 text-maroon-800 flex w-36 shrink-0 items-center justify-center rounded-lg border-2 px-4 py-6 text-center text-sm font-medium transition-colors"
          >
            {range.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
