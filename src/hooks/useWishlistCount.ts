import { useGetWishlistQuery } from "@/store/api/wishlistApi";
import { useAppSelector } from "@/store/hooks";

// The backend has no guest wishlist (BACKEND_CONTRACT.md) — only logged-in users have a count,
// sourced from the server wishlist's RTK Query cache.
export function useWishlistCount(): number {
  const status = useAppSelector((state) => state.auth.status);
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: status !== "authenticated" });

  return wishlist?.productIds.length ?? 0;
}
