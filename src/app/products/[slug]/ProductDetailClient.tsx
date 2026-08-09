"use client";

import { Heart, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AddToCartControls } from "@/components/product/AddToCartControls";
import { ImageGallery } from "@/components/product/ImageGallery";
import { VariantSelector } from "@/components/product/VariantSelector";
import { Badge } from "@/components/ui/Badge";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { trackViewItem } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/formatPrice";
import { applySelection, findMatchingVariant, getDefaultSelection } from "@/lib/variantSelection";
import type { Occasion, Product } from "@/types";

export function ProductDetailClient({ product }: { product: Product }) {
  const attributeNames = product.variantAttributeNames ?? [];
  const variants = product.variants ?? [];
  // Only entries the API actually populated (not just an ObjectId string) can be shown —
  // rendering a raw id would be a meaningless label and a broken link.
  const occasions = (product.occasions ?? []).filter(
    (occasion): occasion is Occasion => typeof occasion !== "string",
  );
  const [selection, setSelection] = useState(() => getDefaultSelection(variants, attributeNames));
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

  const images = activeVariant?.images.length ? activeVariant.images : product.images;
  const price =
    product.type === "variant"
      ? (activeVariant?.price ?? product.startingPrice)
      : (product.price ?? 0);
  const compareAtPrice =
    product.type === "variant" ? activeVariant?.compareAtPrice : product.compareAtPrice;

  function handleSelect(attributeName: string, value: string) {
    setSelection((current) =>
      applySelection(variants, attributeNames, current, attributeName, value),
    );
  }

  return (
    <div className="grid gap-8 px-4 py-6 lg:grid-cols-2 lg:gap-12">
      <ImageGallery images={images} alt={product.name} />

      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            {product.isHandloom ? (
              <Badge variant="gold" className="mb-2 w-fit">
                Handloom
              </Badge>
            ) : null}
            <h1 className="font-heading text-maroon-900 text-2xl sm:text-3xl">{product.name}</h1>
            {product.fabric || product.color ? (
              <p className="text-maroon-600 mt-1 text-sm">
                {[product.fabric, product.color].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={toggle}
            disabled={isWishlistLoading}
            aria-pressed={isWishlisted}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="border-maroon-100 text-maroon-700 hover:bg-maroon-50 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
          >
            <Heart
              className={cn("h-5 w-5", isWishlisted && "fill-maroon-700 text-maroon-700")}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-heading text-maroon-900 text-2xl">{formatPrice(price)}</span>
          {compareAtPrice && compareAtPrice > price ? (
            <span className="text-maroon-400 text-base line-through">
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
        </div>

        {product.type === "variant" ? (
          <VariantSelector
            attributeNames={attributeNames}
            variants={variants}
            selection={selection}
            onSelect={handleSelect}
          />
        ) : null}

        <AddToCartControls
          product={product}
          variant={activeVariant}
          requiresVariantSelection={requiresVariantSelection}
        />

        <p className="text-maroon-700 leading-relaxed">{product.description}</p>

        {occasions.length > 0 ? (
          <div>
            <h2 className="text-maroon-900 text-sm font-medium">Occasions</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {occasions.map((occasion) => (
                <Link key={occasion._id} href={`/products?occasion=${occasion._id}`}>
                  <Badge variant="outline" className="hover:bg-maroon-50">
                    {occasion.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="bg-maroon-50 flex items-start gap-3 rounded-lg p-4">
          <ShieldCheck className="text-maroon-700 mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="text-maroon-800 text-sm">
            <p className="font-medium">
              {product.isHandloom ? "Certified handloom weave" : "Care & authenticity"}
            </p>
            <p className="text-maroon-600 mt-1">
              {product.isHandloom
                ? "Hand-woven on a traditional loom in Elampillai — small variations in weave and colour are part of the handmade craft, not a defect."
                : "Made with care using quality materials."}{" "}
              Dry clean recommended for silk; hand-wash cold and line-dry in shade for cotton.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
