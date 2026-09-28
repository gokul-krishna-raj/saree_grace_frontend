"use client";

import { Check, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useAddToCart } from "@/hooks/useAddToCart";
import { cn } from "@/lib/cn";
import { useAppDispatch } from "@/store/hooks";
import { setCartDrawerOpen } from "@/store/slices/uiSlice";
import type { Product, ProductVariant } from "@/types";

export function AddToCartControls({
  product,
  variant,
  requiresVariantSelection = false,
  onAdded,
  openCartOnAdd = true,
  className,
}: {
  product: Product;
  variant?: ProductVariant;
  requiresVariantSelection?: boolean;
  /** Called after a successful add (e.g. quick view closes itself). */
  onAdded?: () => void;
  openCartOnAdd?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { addToCart, isLoading, isAuthPending } = useAddToCart();
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    [],
  );

  const stock = product.type === "variant" ? (variant?.stock ?? 0) : (product.stock ?? 0);
  const needsSelection = product.type === "variant" && requiresVariantSelection;
  // Stock is only meaningful once we know which variant we're checking — with no variant
  // selected yet, "stock" is 0 by default, but that's "unknown," not "out of stock."
  const outOfStock = !needsSelection && stock <= 0;
  const disabled = needsSelection || outOfStock || isLoading || isAuthPending;

  async function handleAddToCart() {
    const added = await addToCart(product, variant, qty);
    if (!added) return;
    setJustAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1800);
    if (openCartOnAdd) dispatch(setCartDrawerOpen(true));
    onAdded?.();
  }

  async function handleBuyNow() {
    setIsBuyNowLoading(true);
    try {
      const added = await addToCart(product, variant, qty);
      if (added) router.push("/checkout");
    } finally {
      setIsBuyNowLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex gap-3">
        <div
          className="border-input bg-card flex h-12 shrink-0 items-center rounded-md border"
          role="group"
          aria-label="Quantity"
        >
          <button
            type="button"
            onClick={() => setQty((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
            disabled={qty <= 1}
            className="text-foreground hover:bg-muted flex h-full w-11 items-center justify-center rounded-l-md transition-colors disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span
            className="text-foreground w-8 text-center text-sm font-medium tabular-nums"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((current) => Math.min(stock || 1, current + 1))}
            aria-label="Increase quantity"
            disabled={qty >= stock}
            className="text-foreground hover:bg-muted flex h-full w-11 items-center justify-center rounded-r-md transition-colors disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <Button
          size="lg"
          className="flex-1 px-4"
          onClick={handleAddToCart}
          disabled={disabled}
          isLoading={isLoading || isAuthPending}
        >
          {needsSelection ? (
            "Select an option"
          ) : outOfStock ? (
            "Out of stock"
          ) : justAdded ? (
            <>
              <Check aria-hidden="true" /> Added to cart
            </>
          ) : (
            "Add to cart"
          )}
        </Button>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleBuyNow}
        disabled={disabled}
        isLoading={isBuyNowLoading}
      >
        Buy Now
      </Button>

      {needsSelection ? (
        <p className="text-muted-foreground text-sm">Choose an option above to continue.</p>
      ) : null}

      {!needsSelection && !outOfStock && stock <= 5 ? (
        <p className="text-accent text-sm font-medium">Only {stock} left in stock</p>
      ) : null}
    </div>
  );
}
