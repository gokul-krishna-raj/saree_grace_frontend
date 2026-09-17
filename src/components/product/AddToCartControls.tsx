"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { trackAddToCart } from "@/lib/analytics";
import { getApiErrorMessage } from "@/lib/apiError";
import { getProductPrimaryImage } from "@/lib/productImage";
import { toast } from "@/lib/toast";
import { useAddCartItemMutation } from "@/store/api/cartApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { guestItemAdded } from "@/store/slices/guestCartSlice";
import { setCartDrawerOpen } from "@/store/slices/uiSlice";
import type { Product, ProductVariant } from "@/types";

export function AddToCartControls({
  product,
  variant,
  requiresVariantSelection = false,
}: {
  product: Product;
  variant?: ProductVariant;
  requiresVariantSelection?: boolean;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === "authenticated";
  const isAuthPending = authStatus === "checking";
  const [addCartItem, { isLoading }] = useAddCartItemMutation();
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  const [qty, setQty] = useState(1);

  const price = product.type === "variant" ? variant?.price : product.price;
  const stock = product.type === "variant" ? (variant?.stock ?? 0) : (product.stock ?? 0);
  const needsSelection = product.type === "variant" && requiresVariantSelection;
  // Stock is only meaningful once we know which variant we're checking — with no variant
  // selected yet, "stock" is 0 by default, but that's "unknown," not "out of stock."
  const outOfStock = !needsSelection && stock <= 0;
  const disabled = needsSelection || outOfStock || isLoading || isAuthPending;

  async function handleAddToCart() {
    if (product.type === "variant" && !variant) return;
    if (isAuthPending) return;

    const primaryImg = variant?.images?.[0] ?? getProductPrimaryImage(product);

    if (!isAuthenticated) {
      dispatch(
        guestItemAdded({
          productId: product._id,
          variantId: variant?._id ?? null,
          qty,
          nameSnapshot: product.name,
          imageSnapshot: primaryImg?.url,
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

  async function handleBuyNow() {
    if (product.type === "variant" && !variant) return;
    if (isAuthPending) return;

    setIsBuyNowLoading(true);
    const primaryImg = variant?.images?.[0] ?? getProductPrimaryImage(product);

    try {
      if (!isAuthenticated) {
        dispatch(
          guestItemAdded({
            productId: product._id,
            variantId: variant?._id ?? null,
            qty,
            nameSnapshot: product.name,
            imageSnapshot: primaryImg?.url,
            priceSnapshot: price ?? 0,
          }),
        );
      } else {
        await addCartItem({
          productId: product._id,
          variantId: variant?._id ?? null,
          qty,
        }).unwrap();
      }
      trackAddToCart(product, variant, qty);
      router.push("/checkout");
    } catch (error) {
      toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    } finally {
      setIsBuyNowLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity Stepper */}
      <div className="flex items-center gap-3">
        <span className="text-foreground text-sm font-semibold">Quantity:</span>
        <div className="border-border bg-card flex h-11 items-center rounded-xl border">
          <button
            type="button"
            onClick={() => setQty((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
            className="text-foreground hover:bg-muted flex h-11 w-11 items-center justify-center transition-colors"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span
            className="text-foreground w-9 text-center text-sm font-semibold"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((current) => Math.min(stock || 1, current + 1))}
            aria-label="Increase quantity"
            disabled={qty >= stock}
            className="text-foreground hover:bg-muted flex h-11 w-11 items-center justify-center transition-colors disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Dual Purchase Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button
          variant="gold"
          size="lg"
          className="flex-1 font-semibold"
          onClick={handleAddToCart}
          disabled={disabled}
          isLoading={isLoading || isAuthPending}
        >
          {needsSelection ? "Select an option" : outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
        <Button
          variant="default"
          size="lg"
          className="flex-1 font-semibold"
          onClick={handleBuyNow}
          disabled={disabled}
          isLoading={isBuyNowLoading}
        >
          Buy Now
        </Button>
      </div>

      {needsSelection ? (
        <p className="text-destructive text-center text-sm sm:text-left">
          * Please select an option to proceed
        </p>
      ) : null}

      {!needsSelection && !outOfStock && stock <= 5 ? (
        <Badge variant="gold" className="w-fit">
          Only {stock} left in stock
        </Badge>
      ) : null}
    </div>
  );
}
