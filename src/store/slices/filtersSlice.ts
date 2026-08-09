import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ProductSort } from "@/types";

// The URL query string is the source of truth for active filters (Section 6 — shareable,
// bookmarkable, survives refresh). This slice only remembers the last-applied filters so the
// listing page can restore them when navigating back without a URL (e.g. from a product page
// via browser back where Next.js already gives us this for free, but also from links that
// don't carry filter state, like a header nav "Shop" link).
export interface ProductFilters {
  category?: string;
  fabric?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  handloomOnly?: boolean;
  sort: ProductSort;
}

export interface FiltersState {
  lastApplied: ProductFilters;
}

const initialState: FiltersState = {
  lastApplied: { sort: "newest" },
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    filtersApplied(state, action: PayloadAction<ProductFilters>) {
      state.lastApplied = action.payload;
    },
    filtersReset(state) {
      state.lastApplied = { sort: "newest" };
    },
  },
});

export const { filtersApplied, filtersReset } = filtersSlice.actions;
export default filtersSlice.reducer;
