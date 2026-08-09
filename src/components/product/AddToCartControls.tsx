"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { trackAddToCart } from "@/lib/analytics";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { useAddCartItemMutation } from "@/store/api/cartApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { guestItemAdded } from "@/store/slices/guestCartSlice";
import { setCartDrawerOpen } from "@/store/slices/uiSlice";
import type { Product, ProductVariant } from "@/types";

export function AddToCartControls({
  product,
  variant,
  requiresVariantSelection,
}: {
  product: Product;
  variant?: ProductVariant;
  requiresVariantSelection: boolean;
}) {
  const [qty, setQty] = useState(1);
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === "authenticated";
  // On a hard navigation/reload, the store resets (accessToken is memory-only by design — see
  // CLAUDE_FRONTEND.md) and AuthBootstrap's silent refresh takes a real round trip to confirm a
  // returning user is actually logged in — status is "checking" during that window, not yet
  // "authenticated". Found via a real Playwright E2E run, not theorized: without this
  // distinction, a genuinely logged-in user who clicks "Add to cart" during that window gets
  // silently misrouted to the local guest cart instead of their server cart, because
  // `!isAuthenticated` was true for "checking" exactly the same as it is for a real guest.
  const isAuthPending = authStatus === "checking";
  const dispatch = useAppDispatch();
  const [addCartItem, { isLoading }] = useAddCartItemMutation();

  const stock = product.type === "variant" ? (variant?.stock ?? 0) : (product.stock ?? 0);
  const price = product.type === "variant" ? variant?.price : product.price;
  const needsSelection = product.type === "variant" && requiresVariantSelection;
  // Stock is only meaningful once we know which variant we're checking — with no variant
  // selected yet, "stock" is 0 by default, but that's "unknown," not "out of stock."
  const outOfStock = !needsSelection && stock <= 0;
  const disabled = needsSelection || outOfStock || isLoading || isAuthPending;

  async function handleAddToCart() {
    if (product.type === "variant" && !variant) return;
    if (isAuthPending) return;

    if (!isAuthenticated) {
      dispatch(
        guestItemAdded({
          productId: product._id,
          variantId: variant?._id ?? null,
          qty,
          nameSnapshot: product.name,
          imageSnapshot: (variant?.images[0] ?? product.images[0])?.url,
          priceSnapshot: price ?? 0,
        }),
      );
      dispatch(setCartDrawerOpen(true));
      trackAddToCart(product, variant, qty);
      return;
    }

    try {
      await addCartItem({ productId: product._id, variantId: variant?._id ?? null, qty }).unwrap();
      dispatch(setCartDrawerOpen(true));
      trackAddToCart(product, variant, qty);
    } catch (error) {
      toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="border-maroon-200 flex h-11 items-center rounded-lg border">
          <button
            type="button"
            onClick={() => setQty((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
            className="text-maroon-700 flex h-11 w-11 items-center justify-center"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-base" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((current) => Math.min(stock || 1, current + 1))}
            aria-label="Increase quantity"
            disabled={qty >= stock}
            className="text-maroon-700 flex h-11 w-11 items-center justify-center disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={disabled}
          isLoading={isLoading || isAuthPending}
        >
          {needsSelection ? "Select an option" : outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
      </div>
      {!needsSelection && !outOfStock && stock <= 5 ? (
        // Badge, not plain text-gold-600 on white — measured 3.99:1 (needs 4.5:1 for text).
        <Badge variant="gold" className="w-fit">
          Only {stock} left in stock
        </Badge>
      ) : null}
    </div>
  );
}
