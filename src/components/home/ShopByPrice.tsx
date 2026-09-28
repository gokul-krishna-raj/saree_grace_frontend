import Link from "next/link";

import { formatPrice } from "@/lib/formatPrice";

interface PriceRange {
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

const PRICE_RANGES: PriceRange[] = [
  { label: `Under ${formatPrice(999)}`, maxPrice: 999 },
  { label: `${formatPrice(999)} – ${formatPrice(1999)}`, minPrice: 999, maxPrice: 1999 },
  { label: `${formatPrice(1999)} – ${formatPrice(2999)}`, minPrice: 1999, maxPrice: 2999 },
  { label: `${formatPrice(2999)} – ${formatPrice(4999)}`, minPrice: 2999, maxPrice: 4999 },
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
    <section aria-labelledby="shop-by-price" className="container-page section-y">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
        <h2 id="shop-by-price" className="text-heading-lg text-foreground shrink-0">
          Shop by price
        </h2>
        <ul className="scrollbar-hide -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {PRICE_RANGES.map((range) => (
            <li key={range.label} className="shrink-0">
              <Link
                href={buildHref(range)}
                className="border-border text-foreground hover:border-foreground hover:bg-foreground hover:text-background inline-flex h-11 items-center rounded-full border px-5 text-sm tabular-nums transition-colors"
              >
                {range.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
