"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { cn } from "@/lib/cn";
import { getColorCodeValue, isColorAttribute, isValidHexColor } from "@/lib/colorCode";
import { formatPrice } from "@/lib/formatPrice";
import { getProductPrimaryImage } from "@/lib/productImage";
import type { Product, ProductImage } from "@/types";

interface ColorOption {
  colorName: string;
  colorCode?: string;
  image?: ProductImage;
  variantId: string;
}

function extractColorOptions(product: Product): ColorOption[] {
  if (product.type !== "variant" || !product.variants || product.variants.length === 0) {
    return [];
  }

  const seenColors = new Set<string>();
  const options: ColorOption[] = [];

  for (const variant of product.variants) {
    if (!variant.isActive) continue;

    const colorKey = Object.keys(variant.attributes).find((k) => isColorAttribute(k));
    const colorName = colorKey ? variant.attributes[colorKey]?.trim() : undefined;
    const colorCode = getColorCodeValue(variant.attributes);

    if (colorName) {
      const normalizedName = colorName.toLowerCase();
      if (!seenColors.has(normalizedName)) {
        seenColors.add(normalizedName);
        options.push({
          colorName,
          colorCode,
          image: variant.images?.[0],
          variantId: variant._id,
        });
      }
    } else if (colorCode) {
      const normalizedCode = colorCode.toLowerCase();
      if (!seenColors.has(normalizedCode)) {
        seenColors.add(normalizedCode);
        options.push({
          colorName: colorCode,
          colorCode,
          image: variant.images?.[0],
          variantId: variant._id,
        });
      }
    }
  }

  return options;
}

export function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggle, isLoading } = useWishlistToggle(product._id);
  const colorOptions = useMemo(() => extractColorOptions(product), [product]);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const price = product.type === "simple" ? (product.price ?? 0) : product.startingPrice;
  // A variant product spans a price range across its active variants — show it as a range
  // rather than "From <min>" once there's an actual spread to communicate (maxPrice/startingPrice
  // are Mongoose virtuals always present on Product, see types/index.ts).
  const isPriceRange = product.type === "variant" && product.maxPrice > product.startingPrice;
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

  const primaryImage = getProductPrimaryImage(product);
  const selectedOption = activeColor
    ? colorOptions.find((opt) => opt.colorName === activeColor)
    : undefined;
  const displayedImage = selectedOption?.image ?? primaryImage;

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
        {displayedImage ? (
          <Image
            src={displayedImage.url}
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
            {isPriceRange
              ? `${formatPrice(product.startingPrice)} – ${formatPrice(product.maxPrice)}`
              : `${product.type === "variant" ? "From " : ""}${formatPrice(price)}`}
          </span>
          {hasDiscount ? (
            <span className="text-maroon-400 text-xs line-through">
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
        </div>

        {colorOptions.length > 0 ? (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 pt-0.5">
            {colorOptions.map((opt) => {
              const isSelected = activeColor === opt.colorName;
              const swatchColor =
                opt.colorCode ?? (isValidHexColor(opt.colorName) ? opt.colorName : undefined);
              return (
                <button
                  key={opt.colorName}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveColor(opt.colorName);
                  }}
                  onMouseEnter={() => setActiveColor(opt.colorName)}
                  aria-label={`Select ${opt.colorName}`}
                  aria-pressed={isSelected}
                  title={opt.colorName}
                  className={cn(
                    "relative flex h-5 w-5 items-center justify-center rounded-full transition-all",
                    isSelected
                      ? "ring-maroon-800 scale-110 ring-2 ring-offset-1"
                      : "border-maroon-200 hover:border-maroon-500 border hover:scale-105",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: swatchColor ?? "#7A2635" }}
                  />
                </button>
              );
            })}
            {colorOptions.length > 1 ? (
              <span className="text-maroon-500 ml-0.5 text-xs font-normal">
                {colorOptions.length} colors
              </span>
            ) : null}
          </div>
        ) : product.type === "variant" && product.variantCount > 1 ? (
          <span className="text-maroon-600 text-xs">{product.variantCount} options</span>
        ) : null}
      </div>
    </div>
  );
}
