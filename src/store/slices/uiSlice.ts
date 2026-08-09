import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  mobileMenuOpen: boolean;
  cartDrawerOpen: boolean;
  activeModal: string | null;
}

const initialState: UiState = {
  mobileMenuOpen: false,
  cartDrawerOpen: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.mobileMenuOpen = action.payload;
    },
    setCartDrawerOpen(state, action: PayloadAction<boolean>) {
      state.cartDrawerOpen = action.payload;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
  },
});

export const { setMobileMenuOpen, setCartDrawerOpen, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
