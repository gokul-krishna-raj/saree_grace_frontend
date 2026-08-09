import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/store/api/wishlistApi";
import { useAppSelector } from "@/store/hooks";
import type { WishlistProductSummary } from "@/types";

// The backend has no guest wishlist (auth required on every /wishlist route) — rather than
// fake a local-only "wishlist" that vanishes on login (misleading), guests get a prompt to
// sign in. Wishlist state itself is driven entirely by the `getWishlist` RTK Query cache, not
// local component state, so the heart icon stays in sync across every page that renders it
// (checklist Section 9's explicit requirement).
export function useWishlistToggle(productId: string) {
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === "authenticated";
  // See the identical, real-bug comment in AddToCartControls.tsx: "checking" (silent refresh in
  // flight after a hard navigation) is not the same as "guest," and telling a genuinely
  // logged-in user "Sign in to save items" during that brief window would be actively wrong,
  // not just unhelpful.
  const isAuthPending = authStatus === "checking";
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

  const isWishlisted = Boolean(
    wishlist?.productIds.some((entry: WishlistProductSummary | string) =>
      typeof entry === "string" ? entry === productId : entry._id === productId,
    ),
  );

  async function toggle() {
    if (isAuthPending) return;
    if (!isAuthenticated) {
      toast.error("Sign in to save items you love");
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist({ productId }).unwrap();
      } else {
        await addToWishlist({ productId }).unwrap();
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error as FetchBaseQueryError | SerializedError,
          "Couldn't update your wishlist.",
        ),
      );
    }
  }

  return { isWishlisted, toggle, isLoading: isAdding || isRemoving || isAuthPending };
}
