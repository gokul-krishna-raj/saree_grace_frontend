"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { cn } from "@/lib/cn";
import { getColorCodeValue, isColorAttribute, isValidHexColor } from "@/lib/colorCode";
import { getColorHex } from "@/lib/colors";
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
    <div className="group border-border bg-card hover:shadow-elegant relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-500">
      <Link
        href={`/products/${product.slug}`}
        aria-label={product.name}
        className="bg-muted relative block aspect-[3/4] w-full overflow-hidden"
      >
        {displayedImage ? (
          <Image
            src={displayedImage.url}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {outOfStock ? (
          <span className="text-foreground bg-background/80 absolute inset-0 flex items-center justify-center text-xs font-medium backdrop-blur-xs sm:text-sm">
            Out of stock
          </span>
        ) : null}
        {hasDiscount ? (
          <Badge
            variant="destructive"
            className="absolute top-2 left-2 text-[10px] font-semibold sm:top-2.5 sm:left-2.5 sm:text-xs"
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
        className="text-primary bg-card/90 absolute top-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 sm:top-2.5 sm:right-2.5 sm:h-10 sm:w-10"
      >
        <Heart
          className={cn("h-4 w-4 sm:h-5 sm:w-5", isWishlisted && "fill-primary text-primary")}
          aria-hidden="true"
        />
      </button>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-3.5">
        {product.isHandloom ? (
          <Badge variant="gold" className="w-fit text-[10px] sm:text-xs">
            Handloom
          </Badge>
        ) : null}
        <Link
          href={`/products/${product.slug}`}
          className="font-display text-foreground group-hover:text-primary line-clamp-2 text-xs leading-snug font-semibold transition-colors sm:text-sm md:text-base"
        >
          {product.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-primary text-xs font-bold tabular-nums sm:text-sm md:text-base">
            {isPriceRange
              ? `${formatPrice(product.startingPrice)} – ${formatPrice(product.maxPrice)}`
              : `${product.type === "variant" ? "From " : ""}${formatPrice(price)}`}
          </span>
          {hasDiscount ? (
            <span className="text-muted-foreground text-[10px] tabular-nums line-through sm:text-xs">
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
        </div>

        {colorOptions.length > 0 ? (
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1.5">
            {colorOptions.map((opt) => {
              const isSelected = activeColor === opt.colorName;
              const swatchColor =
                opt.colorCode ??
                (isValidHexColor(opt.colorName) ? opt.colorName : getColorHex(opt.colorName));
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
                      ? "ring-primary scale-110 ring-2 ring-offset-1"
                      : "border-border hover:border-primary border hover:scale-105",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-inner sm:h-3.5 sm:w-3.5"
                    style={{ backgroundColor: swatchColor ?? "#800000" }}
                  />
                </button>
              );
            })}
            {colorOptions.length > 1 ? (
              <span className="text-muted-foreground text-[10px] font-normal sm:text-xs">
                {colorOptions.length} colors
              </span>
            ) : null}
          </div>
        ) : product.type === "variant" && product.variantCount > 1 ? (
          <span className="text-muted-foreground mt-auto text-[10px] sm:text-xs">
            {product.variantCount} options
          </span>
        ) : null}
      </div>
    </div>
  );
}
