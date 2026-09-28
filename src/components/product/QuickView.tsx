"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { AddToCartControls } from "@/components/product/AddToCartControls";
import { VariantSelector } from "@/components/product/VariantSelector";
import { Modal } from "@/components/ui/Modal";
import { useProductSelection } from "@/hooks/useProductSelection";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/formatPrice";
import type { Product } from "@/types";

// Lightweight product preview opened from a listing card: pick a colour/option and add to cart
// without leaving the grid. Loaded on demand (next/dynamic in ProductCard).
export function QuickView({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const {
    attributeNames,
    variants,
    selection,
    select,
    activeVariant,
    requiresVariantSelection,
    images,
    price,
    compareAtPrice,
    discountPercent,
  } = useProductSelection(product);
  const [imageIndex, setImageIndex] = useState(0);
  const safeIndex = imageIndex < images.length ? imageIndex : 0;
  const image = images[safeIndex];

  return (
    <Modal open={open} onClose={onClose} title={product.name} className="max-w-4xl">
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col gap-3">
          <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-md">
            {image ? (
              <Image
                key={image.url}
                src={image.url}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 420px, 90vw"
                className="animate-fade-in object-contain"
              />
            ) : null}
          </div>
          {images.length > 1 ? (
            <div className="flex gap-2">
              {images.slice(0, 5).map((img, index) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={`Show photo ${index + 1}`}
                  aria-current={index === safeIndex}
                  className={cn(
                    "relative aspect-square w-14 overflow-hidden rounded-sm border",
                    index === safeIndex ? "border-foreground" : "border-transparent opacity-70",
                  )}
                >
                  <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="text-foreground text-2xl font-semibold tabular-nums">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price ? (
              <span className="text-muted-foreground tabular-nums line-through">
                {formatPrice(compareAtPrice)}
              </span>
            ) : null}
            {discountPercent > 0 ? (
              <span className="text-sale text-sm font-semibold">{discountPercent}% off</span>
            ) : null}
          </div>

          {product.type === "variant" ? (
            <VariantSelector
              attributeNames={attributeNames}
              variants={variants}
              selection={selection}
              onSelect={(name, value) => {
                select(name, value);
                setImageIndex(0);
              }}
            />
          ) : null}

          <AddToCartControls
            product={product}
            variant={activeVariant}
            requiresVariantSelection={requiresVariantSelection}
            onAdded={onClose}
          />

          <Link
            href={`/products/${product.slug}`}
            className="text-foreground text-sm font-medium underline underline-offset-4"
          >
            View full details
          </Link>
        </div>
      </div>
    </Modal>
  );
}
