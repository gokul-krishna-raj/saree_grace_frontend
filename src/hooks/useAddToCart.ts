import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

import { trackAddToCart } from "@/lib/analytics";
import { getApiErrorMessage } from "@/lib/apiError";
import { getProductPrimaryImage } from "@/lib/productImage";
import { toast } from "@/lib/toast";
import { useAddCartItemMutation } from "@/store/api/cartApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { guestItemAdded } from "@/store/slices/guestCartSlice";
import type { Product, ProductVariant } from "@/types";

// One add-to-cart path shared by the PDP, quick view and the product card's quick add:
// guests go to the persisted guest cart (merged on login), signed-in users hit the API.
// Resolves `true` when the item was added.
export function useAddToCart() {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === "authenticated";
  const isAuthPending = authStatus === "checking";
  const [addCartItem, { isLoading }] = useAddCartItemMutation();

  async function addToCart(product: Product, variant: ProductVariant | undefined, qty: number) {
    if (product.type === "variant" && !variant) return false;
    if (isAuthPending) return false;

    const price = product.type === "variant" ? variant?.price : product.price;
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
      trackAddToCart(product, variant, qty);
      return true;
    }

    try {
      await addCartItem({ productId: product._id, variantId: variant?._id ?? null, qty }).unwrap();
      trackAddToCart(product, variant, qty);
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
      return false;
    }
  }

  return { addToCart, isLoading, isAuthPending };
}
