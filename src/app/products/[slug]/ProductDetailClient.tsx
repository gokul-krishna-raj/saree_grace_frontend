"use client";

import { RefreshCw, Shield, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AddToCartControls } from "@/components/product/AddToCartControls";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ProductDescription } from "@/components/product/ProductDescription";
import { VariantSelector } from "@/components/product/VariantSelector";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { trackViewItem } from "@/lib/analytics";
import { selectableAttributeNames } from "@/lib/colorCode";
import { formatPrice } from "@/lib/formatPrice";
import {
  applySelection,
  findMatchingVariant,
  getAttrValue,
  getDefaultSelection,
} from "@/lib/variantSelection";
import type { Occasion, Product, ProductImage, ProductVariant } from "@/types";

function getImagesForSelection(
  product: Product,
  variants: ProductVariant[],
  activeVariant: ProductVariant | undefined,
  selection: Record<string, string>,
): ProductImage[] {
  if (product.type !== "variant") {
    return product.images ?? [];
  }

  // Find the selected color attribute value, if any
  const selectedColor = getAttrValue(selection, "color");

  // Collect images strictly for the selected color / active variant
  if (selectedColor) {
    const matchingVariants = variants.filter(
      (v) =>
        v.isActive &&
        getAttrValue(v.attributes, "color")?.trim().toLowerCase() ===
          selectedColor.trim().toLowerCase(),
    );

    const colorImages: ProductImage[] = [];
    const seenUrls = new Set<string>();

    // Prioritize activeVariant's images first if activeVariant matches
    const priorityVariants = activeVariant
      ? [activeVariant, ...matchingVariants.filter((v) => v._id !== activeVariant._id)]
      : matchingVariants;

    for (const v of priorityVariants) {
      for (const img of v.images ?? []) {
        if (img?.url && !seenUrls.has(img.url)) {
          seenUrls.add(img.url);
          colorImages.push(img);
        }
      }
    }

    if (colorImages.length > 0) {
      return colorImages;
    }
  } else if (activeVariant?.images && activeVariant.images.length > 0) {
    return activeVariant.images;
  }

  // Fall back to top-level product images if no variant-specific images exist for this color,
  // but NEVER mix images from other colors!
  return product.images ?? [];
}

export function ProductDetailClient({ product }: { product: Product }) {
  // Fall back to collecting attribute keys from variant items if variantAttributeNames is missing or empty
  const rawAttributeNames =
    product.variantAttributeNames && product.variantAttributeNames.length > 0
      ? product.variantAttributeNames
      : Array.from(
          new Set((product.variants ?? []).flatMap((v) => Object.keys(v.attributes ?? {}))),
        );
  // "colorCode" (when an admin included it in variantAttributeNames) is metadata for a swatch,
  // not a dimension a shopper picks — excluded here so selection/matching never requires it.
  const attributeNames = selectableAttributeNames(rawAttributeNames);
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  // Only entries the API actually populated (not just an ObjectId string) can be shown —
  // rendering a raw id would be a meaningless label and a broken link.
  const occasions = (product.occasions ?? []).filter(
    (occasion): occasion is Occasion => typeof occasion !== "string",
  );
  const [selection, setSelection] = useState(() => getDefaultSelection(variants, attributeNames));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { isWishlisted, toggle, isLoading: isWishlistLoading } = useWishlistToggle(product._id);

  useEffect(() => {
    trackViewItem(product);
    // Fire once per product page view, not on every selection/re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  const activeVariant =
    product.type === "variant"
      ? findMatchingVariant(variants, attributeNames, selection)
      : undefined;
  const requiresVariantSelection = product.type === "variant" && !activeVariant;

  const images = useMemo(
    () => getImagesForSelection(product, variants, activeVariant, selection),
    [product, variants, activeVariant, selection],
  );
  const price =
    product.type === "variant"
      ? (activeVariant?.price ?? product.startingPrice)
      : (product.price ?? 0);
  const compareAtPrice =
    product.type === "variant" ? activeVariant?.compareAtPrice : product.compareAtPrice;
  const discountPercent =
    compareAtPrice && compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : 0;

  const categoryName =
    typeof product.category === "object" && product.category?.name
      ? product.category.name
      : undefined;

  function handleSelect(attributeName: string, value: string) {
    setSelection((current) =>
      applySelection(variants, attributeNames, current, attributeName, value),
    );
    // Reset image index to primary variant image when switching variants
    setSelectedImageIndex(0);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <ImageGallery
          images={images}
          alt={product.name}
          isHandloom={product.isHandloom}
          discountPercent={discountPercent}
          isWishlisted={isWishlisted}
          onWishlistToggle={toggle}
          isWishlistLoading={isWishlistLoading}
          selectedIndex={selectedImageIndex}
          onSelectImage={setSelectedImageIndex}
        />

        {/* Right Column: Product Information & Purchase Actions */}
        <div className="flex flex-col gap-5 sm:gap-6">
          <div>
            {categoryName ? (
              <p className="text-accent mb-2 text-xs font-semibold tracking-wider uppercase sm:text-sm">
                {categoryName}
              </p>
            ) : null}
            <h1 className="font-display text-foreground mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
              <span className="text-primary text-2xl font-bold tabular-nums sm:text-3xl">
                {formatPrice(price)}
              </span>
              {compareAtPrice && compareAtPrice > price ? (
                <span className="text-muted-foreground text-base tabular-nums line-through sm:text-lg">
                  {formatPrice(compareAtPrice)}
                </span>
              ) : null}
              {discountPercent > 0 ? (
                <span className="bg-destructive/10 text-destructive rounded-full px-2.5 py-0.5 text-xs font-semibold sm:text-sm">
                  {discountPercent}% OFF
                </span>
              ) : null}
            </div>
          </div>

          {/* Variant / Color Selectors */}
          {product.type === "variant" ? (
            <VariantSelector
              attributeNames={attributeNames}
              variants={variants}
              selection={selection}
              onSelect={handleSelect}
            />
          ) : null}

          {/* Add to Cart + Buy Now Controls */}
          <AddToCartControls
            product={product}
            variant={activeVariant}
            requiresVariantSelection={requiresVariantSelection}
          />

          {/* USPs / Trust Badges */}
          <div className="border-border my-2 grid grid-cols-3 gap-2 border-y py-6 sm:my-3 sm:gap-4 sm:py-8">
            <div className="group text-center">
              <div className="bg-accent/10 text-accent group-hover:bg-accent/20 mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full transition-colors sm:h-12 sm:w-12">
                <Truck className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase sm:text-xs">
                Fast Delivery
              </p>
            </div>
            <div className="group text-center">
              <div className="bg-accent/10 text-accent group-hover:bg-accent/20 mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full transition-colors sm:h-12 sm:w-12">
                <Shield className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase sm:text-xs">
                Authentic Product
              </p>
            </div>
            <div className="group text-center">
              <div className="bg-accent/10 text-accent group-hover:bg-accent/20 mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full transition-colors sm:h-12 sm:w-12">
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase sm:text-xs">
                Easy Returns
              </p>
            </div>
          </div>

          {/* Product Highlights Card */}
          <ProductDescription
            title="Product Highlights"
            description={product.description}
            fabric={product.fabric}
            color={product.color}
            isHandloom={product.isHandloom}
            occasions={occasions}
            sku={activeVariant?.sku || product.sku}
          />
        </div>
      </div>
    </div>
  );
}
