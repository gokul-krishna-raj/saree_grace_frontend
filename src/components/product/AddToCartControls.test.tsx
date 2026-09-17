import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";

import { makeStore } from "@/store";
import { accessTokenSet, checkingSession } from "@/store/slices/authSlice";
import type { Product, ProductVariant } from "@/types";

const addCartItemMock = jest.fn();
jest.mock("@/store/api/cartApi", () => ({
  useAddCartItemMutation: () => [addCartItemMock, { isLoading: false }],
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import { AddToCartControls } from "./AddToCartControls";

const simpleProduct: Product = {
  _id: "p1",
  name: "Handloom Cotton Saree",
  slug: "handloom-cotton-saree",
  description: "d",
  type: "simple",
  category: "cat1",
  isHandloom: true,
  images: [],
  ratingAvg: 0,
  reviewCount: 0,
  isActive: true,
  startingPrice: 1899,
  maxPrice: 1899,
  totalStock: 3,
  variantCount: 0,
  createdAt: "",
  updatedAt: "",
  price: 1899,
  stock: 3,
};

const variant: ProductVariant = {
  _id: "v1",
  sku: "SKU1",
  attributes: { color: "Red" },
  price: 7999,
  stock: 8,
  images: [],
  isActive: true,
};

function renderWithStore(
  ui: React.ReactElement,
  { authenticated = false, checking = false }: { authenticated?: boolean; checking?: boolean } = {},
) {
  const store = makeStore();
  if (authenticated) store.dispatch(accessTokenSet({ accessToken: "token" }));
  if (checking) store.dispatch(checkingSession());
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

describe("AddToCartControls", () => {
  beforeEach(() => {
    addCartItemMock.mockReset();
    addCartItemMock.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });

  it("disables add-to-cart and shows 'Out of stock' when stock is zero", () => {
    renderWithStore(
      <AddToCartControls
        product={{ ...simpleProduct, stock: 0 }}
        requiresVariantSelection={false}
      />,
    );

    const button = screen.getByRole("button", { name: "Out of stock" });
    expect(button).toBeDisabled();
  });

  it("shows 'Select an option' and disables add-to-cart for an incomplete variant selection", () => {
    renderWithStore(
      <AddToCartControls
        product={{ ...simpleProduct, type: "variant" }}
        requiresVariantSelection
      />,
    );

    expect(screen.getByRole("button", { name: "Select an option" })).toBeDisabled();
  });

  it("caps the quantity stepper at the available stock", async () => {
    renderWithStore(
      <AddToCartControls
        product={{ ...simpleProduct, stock: 2 }}
        requiresVariantSelection={false}
      />,
    );

    const increment = screen.getByRole("button", { name: "Increase quantity" });
    await userEvent.click(increment);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(increment).toBeDisabled();
  });

  it("calls the addCartItem mutation with the selected variant when authenticated", async () => {
    renderWithStore(
      <AddToCartControls
        product={{ ...simpleProduct, type: "variant" }}
        variant={variant}
        requiresVariantSelection={false}
      />,
      { authenticated: true },
    );

    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(addCartItemMock).toHaveBeenCalledWith({ productId: "p1", variantId: "v1", qty: 1 });
  });

  // Regression test for a real bug caught by a Playwright E2E run (Section 17, see NOTES.md):
  // a returning logged-in user's click during the silent-refresh window after a hard navigation
  // was silently misrouted to the local guest cart instead of their server cart, because
  // `status === "checking"` was treated identically to "guest."
  it("disables add-to-cart while auth status is 'checking', and does not add to the guest cart", async () => {
    const { store } = renderWithStore(
      <AddToCartControls product={simpleProduct} requiresVariantSelection={false} />,
      { checking: true },
    );

    const button = screen.getByRole("button", { name: "Add to cart" });
    expect(button).toBeDisabled();

    await userEvent.click(button);

    expect(addCartItemMock).not.toHaveBeenCalled();
    expect(store.getState().guestCart.items).toHaveLength(0);
  });
});
