import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// The backend has no anonymous-cart endpoint (`/cart` requires auth — see BACKEND_CONTRACT.md).
// Guests get a client-side-only cart here, persisted via redux-persist for reload continuity,
// and folded into the server cart with `POST /cart/merge` on login (Section 8).
export interface GuestCartLine {
  productId: string;
  variantId: string | null;
  qty: number;
  nameSnapshot: string;
  imageSnapshot?: string;
  priceSnapshot: number;
}

export interface GuestCartState {
  items: GuestCartLine[];
}

const initialState: GuestCartState = { items: [] };

function lineKey(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? ""}`;
}

const guestCartSlice = createSlice({
  name: "guestCart",
  initialState,
  reducers: {
    guestItemAdded(state, action: PayloadAction<GuestCartLine>) {
      const existing = state.items.find(
        (item) =>
          lineKey(item.productId, item.variantId) ===
          lineKey(action.payload.productId, action.payload.variantId),
      );
      if (existing) {
        existing.qty += action.payload.qty;
      } else {
        state.items.push(action.payload);
      }
    },
    guestItemQtyUpdated(
      state,
      action: PayloadAction<{ productId: string; variantId: string | null; qty: number }>,
    ) {
      const item = state.items.find(
        (item) =>
          lineKey(item.productId, item.variantId) ===
          lineKey(action.payload.productId, action.payload.variantId),
      );
      if (item) item.qty = action.payload.qty;
    },
    guestItemRemoved(
      state,
      action: PayloadAction<{ productId: string; variantId: string | null }>,
    ) {
      state.items = state.items.filter(
        (item) =>
          lineKey(item.productId, item.variantId) !==
          lineKey(action.payload.productId, action.payload.variantId),
      );
    },
    guestCartCleared(state) {
      state.items = [];
    },
  },
});

export const { guestItemAdded, guestItemQtyUpdated, guestItemRemoved, guestCartCleared } =
  guestCartSlice.actions;
export default guestCartSlice.reducer;
