"use client";

import { Heart, Plus, Star } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useAddToCart } from "@/hooks/useAddToCart";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { cn } from "@/lib/cn";
import { getColorCodeValue, isColorAttribute, isValidHexColor } from "@/lib/colorCode";
import { getColorHex } from "@/lib/colors";
import { formatPrice } from "@/lib/formatPrice";
import { getProductPrimaryImage } from "@/lib/productImage";
import { toast } from "@/lib/toast";
import { useAppDispatch } from "@/store/hooks";
import { setCartDrawerOpen } from "@/store/slices/uiSlice";
import type { Product, ProductImage } from "@/types";

// Quick view is only needed after an explicit click, so its code (variant selector, gallery,
// cart controls) is split out of the listing bundle and fetched on demand.
const QuickView = dynamic(() => import("./QuickView").then((mod) => mod.QuickView), {
  ssr: false,
});

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

const MAX_SWATCHES = 4;

export function ProductCard({
  product,
  imageSizes = "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw",
  preloadImage = false,
  headingLevel: Heading = "h3",
}: {
  product: Product;
  imageSizes?: string;
  /** Only for the first row of an above-the-fold grid. */
  preloadImage?: boolean;
  /** `h2` when cards sit directly under the page's h1 (listing grid), `h3` inside a section. */
  headingLevel?: "h2" | "h3";
}) {
  const dispatch = useAppDispatch();
  const { isWishlisted, toggle, isLoading } = useWishlistToggle(product._id);
  const { addToCart, isLoading: isAdding } = useAddToCart();
  const colorOptions = useMemo(() => extractColorOptions(product), [product]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  // The hover image is only mounted after the first hover, so a grid of 12 cards doesn't
  // download 24 images up front.
  const [hoverImageArmed, setHoverImageArmed] = useState(false);

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

  // Second photo of the *same* colour only — swapping to a different colour on hover would
  // misrepresent what the card is showing.
  const hoverImage = useMemo(() => {
    if (!displayedImage) return undefined;
    const pool =
      product.type === "variant"
        ? (product.variants ?? [])
            .filter((variant) => variant.images?.some((img) => img.url === displayedImage.url))
            .flatMap((variant) => variant.images ?? [])
        : (product.images ?? []);
    return pool.find((img) => img.url !== displayedImage.url);
  }, [product, displayedImage]);

  const outOfStock =
    product.type === "simple"
      ? (product.stock ?? 0) <= 0
      : !(product.variants ?? []).some((variant) => variant.isActive && variant.stock > 0);

  const href = `/products/${product.slug}`;
  const needsOptions = product.type === "variant";

  async function handleQuickAdd() {
    if (needsOptions) {
      setQuickViewOpen(true);
      return;
    }
    const added = await addToCart(product, undefined, 1);
    if (added) {
      toast.success(`${product.name} added to cart`);
      dispatch(setCartDrawerOpen(true));
    }
  }

  const visibleSwatches = colorOptions.slice(0, MAX_SWATCHES);

  return (
    <article className="group/card relative flex flex-col">
      <div
        className="bg-muted relative aspect-[4/5] overflow-hidden rounded-md"
        onPointerEnter={(event) => event.pointerType === "mouse" && setHoverImageArmed(true)}
      >
        <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
          {displayedImage ? (
            <Image
              src={displayedImage.url}
              alt={product.name}
              fill
              sizes={imageSizes}
              // `preload` has no effect when this client component renders on the server, so
              // above-the-fold cards ask for their image eagerly and at high priority instead.
              loading={preloadImage ? "eager" : undefined}
              fetchPriority={preloadImage ? "high" : undefined}
              className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.03]"
            />
          ) : (
            <span className="font-display text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
              Saree Grace
            </span>
          )}
          {hoverImage && hoverImageArmed ? (
            <Image
              src={hoverImage.url}
              alt=""
              fill
              sizes={imageSizes}
              className="object-cover opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
            />
          ) : null}
        </Link>

        <div className="pointer-events-none absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          {outOfStock ? (
            <span className="bg-card/95 text-foreground rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide">
              Out of stock
            </span>
          ) : hasDiscount ? (
            <span className="bg-sale rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white">
              {discountPercent}% off
            </span>
          ) : null}
          {product.isHandloom ? (
            <span className="bg-gold-50/95 text-maroon-900 rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide">
              Handloom
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={isLoading}
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="text-foreground bg-card/90 hover:bg-card absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-[transform,background-color] duration-200 active:scale-90"
        >
          <Heart
            key={isWishlisted ? "on" : "off"}
            className={cn(
              "h-[18px] w-[18px]",
              isWishlisted && "fill-primary text-primary animate-pop",
            )}
            aria-hidden="true"
          />
        </button>

        {!outOfStock ? (
          <>
            {/* Desktop: full-width bar revealed on hover/focus */}
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isAdding}
              aria-label={`${needsOptions ? "Quick view" : "Quick add"}: ${product.name}`}
              className="bg-card/95 text-foreground hover:bg-foreground hover:text-background absolute inset-x-2.5 bottom-2.5 z-10 hidden h-11 translate-y-2 items-center justify-center rounded-md text-[13px] font-medium tracking-wide opacity-0 transition-[opacity,transform,background-color,color] duration-200 group-hover/card:translate-y-0 group-hover/card:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 lg:flex"
            >
              {needsOptions ? "Quick view" : "Quick add"}
            </button>
            {/* Touch: compact always-visible button */}
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isAdding}
              aria-label={
                needsOptions ? `Choose options for ${product.name}` : `Add ${product.name} to cart`
              }
              className="bg-card/95 text-foreground absolute right-2 bottom-2 z-10 flex h-10 w-10 items-center justify-center rounded-full active:scale-90 lg:hidden"
            >
              <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-3">
        <Heading className="text-foreground line-clamp-2 text-sm leading-snug sm:text-[15px]">
          <Link
            href={href}
            className="hover:text-primary transition-colors after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </Heading>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-foreground text-sm font-semibold tabular-nums sm:text-[15px]">
            {isPriceRange
              ? `${formatPrice(product.startingPrice)} – ${formatPrice(product.maxPrice)}`
              : `${product.type === "variant" ? "From " : ""}${formatPrice(price)}`}
          </span>
          {hasDiscount ? (
            <span className="text-muted-foreground text-xs tabular-nums line-through">
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
        </div>

        {product.reviewCount > 0 ? (
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <Star className="fill-gold-500 text-gold-500 h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-foreground font-medium">{product.ratingAvg.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
            <span className="sr-only">
              Rated {product.ratingAvg.toFixed(1)} out of 5 from {product.reviewCount} reviews
            </span>
          </p>
        ) : null}

        {colorOptions.length > 0 ? (
          <div className="relative z-10 mt-0.5 flex flex-wrap items-center gap-0.5">
            {visibleSwatches.map((opt) => {
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
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 rounded-full border border-black/15 transition-shadow",
                      isSelected && "ring-foreground ring-1 ring-offset-2",
                    )}
                    style={{ backgroundColor: swatchColor ?? "#800000" }}
                  />
                </button>
              );
            })}
            {colorOptions.length > MAX_SWATCHES ? (
              <span className="text-muted-foreground ml-0.5 text-xs">
                +{colorOptions.length - MAX_SWATCHES}
              </span>
            ) : colorOptions.length > 1 ? (
              <span className="text-muted-foreground ml-1 text-xs">
                {colorOptions.length} colors
              </span>
            ) : null}
          </div>
        ) : product.type === "variant" && product.variantCount > 1 ? (
          <span className="text-muted-foreground text-xs">{product.variantCount} options</span>
        ) : null}
      </div>

      {quickViewOpen ? (
        <QuickView product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
      ) : null}
    </article>
  );
}
