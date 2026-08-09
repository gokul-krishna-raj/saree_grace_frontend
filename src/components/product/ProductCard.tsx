"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/formatPrice";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggle, isLoading } = useWishlistToggle(product._id);

  const price = product.type === "simple" ? (product.price ?? 0) : product.startingPrice;
  // Variant products have no single compareAtPrice — use the active variant priced at
  // `startingPrice` (the one the card's price actually refers to) as the discount reference.
  const compareAtPrice =
    product.type === "simple"
      ? product.compareAtPrice
      : (product.variants ?? []).find((variant) => variant.isActive && variant.price === price)
          ?.compareAtPrice;
  const hasDiscount = compareAtPrice !== undefined && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const outOfStock =
    product.type === "simple"
      ? (product.stock ?? 0) <= 0
      : !(product.variants ?? []).some((variant) => variant.isActive && variant.stock > 0);

  return (
    <div className="group border-maroon-50 relative flex flex-col overflow-hidden rounded-lg border bg-white">
      {/* aria-label, not just the image's alt text — found via a real Lighthouse audit that a
          product with no images yet (images: []) renders no <img> at all here, leaving the
          link with no accessible name whatsoever. */}
      <Link
        href={`/products/${product.slug}`}
        aria-label={product.name}
        className="bg-maroon-50 relative block aspect-[3/4] w-full overflow-hidden"
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : null}
        {outOfStock ? (
          <span className="text-maroon-900 absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-medium">
            Out of stock
          </span>
        ) : null}
        {hasDiscount ? (
          <Badge variant="gold" className="absolute top-2 left-2 shadow-sm">
            {discountPercent}% off
          </Badge>
        ) : null}
      </Link>
      <button
        type="button"
        onClick={toggle}
        disabled={isLoading}
        aria-pressed={isWishlisted}
        aria-label={
          isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
        }
        className="text-maroon-700 absolute top-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
      >
        <Heart
          className={cn("h-5 w-5", isWishlisted && "fill-maroon-700 text-maroon-700")}
          aria-hidden="true"
        />
      </button>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.isHandloom ? (
          <Badge variant="gold" className="w-fit">
            Handloom
          </Badge>
        ) : null}
        <Link
          href={`/products/${product.slug}`}
          className="font-heading text-maroon-900 line-clamp-2 text-base"
        >
          {product.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-maroon-900 text-sm font-medium">
            {product.type === "variant" ? "From " : ""}
            {formatPrice(price)}
          </span>
          {hasDiscount ? (
            <span className="text-maroon-400 text-xs line-through">
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
