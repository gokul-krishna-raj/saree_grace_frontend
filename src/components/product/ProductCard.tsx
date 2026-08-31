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
    <div className="group border-maroon-50 relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-xs transition-shadow hover:shadow-md">
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
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {outOfStock ? (
          <span className="text-maroon-900 absolute inset-0 flex items-center justify-center bg-white/75 text-xs font-medium sm:text-sm">
            Out of stock
          </span>
        ) : null}
        {hasDiscount ? (
          <Badge
            variant="gold"
            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] shadow-sm sm:top-2 sm:left-2 sm:px-2 sm:text-xs"
          >
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
        className="text-maroon-700 absolute top-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform hover:bg-white active:scale-95 sm:top-2 sm:right-2 sm:h-11 sm:w-11"
      >
        <Heart
          className={cn("h-4 w-4 sm:h-5 sm:w-5", isWishlisted && "fill-maroon-700 text-maroon-700")}
          aria-hidden="true"
        />
      </button>
      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
        {product.isHandloom ? (
          <Badge variant="gold" className="w-fit px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-xs">
            Handloom
          </Badge>
        ) : null}
        <Link
          href={`/products/${product.slug}`}
          className="font-heading text-maroon-900 hover:text-maroon-700 line-clamp-2 text-xs leading-snug transition-colors sm:text-sm md:text-base"
        >
          {product.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-maroon-900 text-xs font-semibold sm:text-sm sm:font-medium">
            {isPriceRange
              ? `${formatPrice(product.startingPrice)} – ${formatPrice(product.maxPrice)}`
              : `${product.type === "variant" ? "From " : ""}${formatPrice(price)}`}
          </span>
          {hasDiscount ? (
            <span className="text-maroon-400 text-[10px] line-through sm:text-xs">
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
        </div>

        {colorOptions.length > 0 ? (
          <div className="mt-auto flex flex-wrap items-center gap-1 pt-1 sm:gap-1.5">
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
                    "relative flex h-4 w-4 items-center justify-center rounded-full transition-all sm:h-5 sm:w-5",
                    isSelected
                      ? "ring-maroon-800 ring-1.5 scale-110 ring-offset-1 sm:ring-2"
                      : "border-maroon-200 hover:border-maroon-500 border hover:scale-105",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-inner sm:h-3.5 sm:w-3.5"
                    style={{ backgroundColor: swatchColor ?? "#7A2635" }}
                  />
                </button>
              );
            })}
            {colorOptions.length > 1 ? (
              <span className="text-maroon-500 text-[10px] font-normal sm:text-xs">
                {colorOptions.length} colors
              </span>
            ) : null}
          </div>
        ) : product.type === "variant" && product.variantCount > 1 ? (
          <span className="text-maroon-600 mt-auto text-[10px] sm:text-xs">
            {product.variantCount} options
          </span>
        ) : null}
      </div>
    </div>
  );
}
