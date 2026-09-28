import { useHydrated } from "@/hooks/useHydrated";
import { useGetCartQuery } from "@/store/api/cartApi";
import { useAppSelector } from "@/store/hooks";

// The backend has no guest cart (BACKEND_CONTRACT.md) — guests count from the persisted
// `guestCartSlice`, logged-in users count from the server cart's RTK Query cache.
export function useCartCount(): number {
  const status = useAppSelector((state) => state.auth.status);
  const guestItems = useAppSelector((state) => state.guestCart.items);
  const { data: cart } = useGetCartQuery(undefined, { skip: status !== "authenticated" });
  // The guest cart comes from localStorage, which the server can't see — report 0 until
  // hydration finishes so the header badge matches the server-rendered HTML.
  const hydrated = useHydrated();

  if (status === "authenticated") {
    return cart?.items.reduce((sum, item) => sum + item.qty, 0) ?? 0;
  }
  if (!hydrated) return 0;
  return guestItems.reduce((sum, item) => sum + item.qty, 0);
}
