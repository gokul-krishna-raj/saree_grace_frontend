"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatPrice } from "@/lib/formatPrice";
import { readRecentlyViewed, type RecentlyViewedItem } from "@/lib/recentlyViewed";

// Reads the per-device list after mount (it's never in the server HTML — it's personal, and
// it keeps the PDP cacheable). Renders nothing until there's at least one *other* product.
export function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    // Deferred to after mount on purpose: localStorage isn't available during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(
      readRecentlyViewed()
        .filter((item) => item.slug !== currentSlug)
        .slice(0, 6),
    );
  }, [currentSlug]);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed" className="container-page pb-16 lg:pb-24">
      <h2 id="recently-viewed" className="text-heading-lg text-foreground mb-6">
        Recently viewed
      </h2>
      <ul className="scrollbar-hide flex snap-x gap-4 overflow-x-auto lg:grid lg:grid-cols-6 lg:overflow-visible">
        {items.map((item) => (
          <li key={item.slug} className="w-[38%] shrink-0 snap-start sm:w-[24%] lg:w-auto">
            <Link href={`/products/${item.slug}`} className="group block">
              <span className="bg-muted relative block aspect-[4/5] overflow-hidden rounded-md">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 14vw, 38vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : null}
              </span>
              <span className="text-foreground mt-2 line-clamp-2 block text-sm leading-snug">
                {item.name}
              </span>
              <span className="text-foreground mt-1 block text-sm font-medium tabular-nums">
                {item.isFromPrice ? "From " : ""}
                {formatPrice(item.price)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
