import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useMemo } from "react";

import { useHydrated } from "@/hooks/useHydrated";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/store/api/cartApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { guestItemQtyUpdated, guestItemRemoved } from "@/store/slices/guestCartSlice";

export interface CartLine {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  image?: string;
  price: number;
  qty: number;
}

// One hook, consumed by both CartDrawer and the full cart page, so a qty change made in either
// place is immediately reflected in the other — they render the same underlying RTK Query
// cache (authenticated) or Redux slice (guest), never a locally-duplicated copy.
export function useCart() {
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === "authenticated";
  // "checking" (silent refresh in flight after a hard navigation, see AddToCartControls.tsx
  // for the full story) is genuinely different from "guest" — while it's unresolved, we don't
  // yet know whether to show the server cart or the guest cart, so this shows a loading state
  // rather than confidently rendering the guest cart (possibly empty/stale) for a real
  // logged-in user, or letting a qty update/remove action during that window hit the wrong one.
  const isAuthPending = authStatus === "checking";
  const dispatch = useAppDispatch();
  const guestItems = useAppSelector((state) => state.guestCart.items);
  // The guest cart is restored from localStorage after mount (see StoreProvider) — until then an
  // empty list means "not read yet", not "empty cart".
  const hydrated = useHydrated();
  const guestCartNotRehydrated = useAppSelector(
    (state) => state.guestCart._persist?.rehydrated === false,
  );
  const isGuestCartRestoring = !isAuthenticated && (!hydrated || guestCartNotRehydrated);
  const {
    data: serverCart,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateCartItemMutation] = useUpdateCartItemMutation();
  const [removeCartItemMutation] = useRemoveCartItemMutation();

  const lines: CartLine[] = useMemo(() => {
    if (isAuthPending) return [];
    if (isAuthenticated) {
      return (serverCart?.items ?? []).map((item) => ({
        id: item._id,
        productId: typeof item.product === "string" ? item.product : item.product._id,
        variantId: item.variantId,
        name: item.nameSnapshot,
        image: item.imageSnapshot,
        price: item.priceSnapshot,
        qty: item.qty,
      }));
    }
    return guestItems.map((item) => ({
      id: `${item.productId}:${item.variantId ?? ""}`,
      productId: item.productId,
      variantId: item.variantId,
      name: item.nameSnapshot,
      image: item.imageSnapshot,
      price: item.priceSnapshot,
      qty: item.qty,
    }));
  }, [isAuthPending, isAuthenticated, serverCart, guestItems]);

  const itemsTotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  // Shipping depends on the delivery state (backend `computeShippingFee`, mirrored in
  // lib/shippingFee.ts), which isn't known until checkout — the cart used to show a made-up
  // "free over ₹999, else ₹99" rule the backend never applied. `null` = calculated at checkout.
  const shippingFee = null;
  const total = itemsTotal;

  async function updateQty(line: CartLine, qty: number) {
    if (isAuthPending) return;
    try {
      if (isAuthenticated) {
        await updateCartItemMutation({ itemId: line.id, qty }).unwrap();
      } else {
        dispatch(
          guestItemQtyUpdated({ productId: line.productId, variantId: line.variantId, qty }),
        );
      }
    } catch (error) {
      // The backend re-validates live stock on every cart mutation (BACKEND_CONTRACT.md — no
      // endpoint exists to proactively check this on cart *load*, see NOTES.md) — a 409 here is
      // the real, current stock limit, surfaced as soon as it's actually knowable.
      toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  async function removeItem(line: CartLine) {
    if (isAuthPending) return;
    try {
      if (isAuthenticated) {
        await removeCartItemMutation({ itemId: line.id }).unwrap();
      } else {
        dispatch(guestItemRemoved({ productId: line.productId, variantId: line.variantId }));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
  }

  // A failed getCart must never be presented as "your cart is empty" — that's a real,
  // recoverable network error, not the user's actual (empty) cart.
  const hasLoadError = isAuthenticated && isError;

  return {
    lines,
    itemsTotal,
    shippingFee,
    total,
    isLoading: isAuthPending || isGuestCartRestoring || (isAuthenticated && isLoading),
    isFetching,
    isError: hasLoadError,
    isEmpty: !isAuthPending && !isGuestCartRestoring && !hasLoadError && lines.length === 0,
    isAuthenticated,
    updateQty,
    removeItem,
    refetch,
  };
}
