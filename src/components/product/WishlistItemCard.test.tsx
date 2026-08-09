import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { WishlistProductSummary } from "@/types";

const addCartItemMock = jest.fn();
const removeFromWishlistMock = jest.fn();

jest.mock("@/store/api/cartApi", () => ({
  useAddCartItemMutation: () => [addCartItemMock, { isLoading: false }],
}));
jest.mock("@/store/api/wishlistApi", () => ({
  useRemoveFromWishlistMutation: () => [removeFromWishlistMock, { isLoading: false }],
}));
jest.mock("@/store/hooks", () => ({
  useAppDispatch: () => jest.fn(),
}));

import { WishlistItemCard } from "./WishlistItemCard";

const simpleProduct: WishlistProductSummary = {
  _id: "p1",
  name: "Handloom Cotton Saree",
  slug: "handloom-cotton-saree",
  images: [],
  type: "simple",
  isActive: true,
  price: 1899,
  startingPrice: 1899,
};

describe("WishlistItemCard", () => {
  beforeEach(() => {
    addCartItemMock.mockReset();
    removeFromWishlistMock.mockReset();
    addCartItemMock.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    removeFromWishlistMock.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });

  it("shows the simple product's price and a working 'Move to cart' button", async () => {
    render(<WishlistItemCard product={simpleProduct} />);

    expect(screen.getByText("₹1,899")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Move to cart" }));

    expect(addCartItemMock).toHaveBeenCalledWith({ productId: "p1", variantId: null, qty: 1 });
    expect(removeFromWishlistMock).toHaveBeenCalledWith({ productId: "p1" });
  });

  it("shows the lowest active variant price with a 'From' prefix for variant products", () => {
    render(
      <WishlistItemCard
        product={{
          ...simpleProduct,
          type: "variant",
          price: undefined,
          startingPrice: 7999,
          variants: [
            {
              _id: "v1",
              sku: "S1",
              attributes: {},
              price: 8999,
              stock: 2,
              images: [],
              isActive: true,
            },
            {
              _id: "v2",
              sku: "S2",
              attributes: {},
              price: 7999,
              stock: 0,
              images: [],
              isActive: true,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("From ₹7,999")).toBeInTheDocument();
  });

  it("disables 'Move to cart' when a variant product has no active variants left", () => {
    render(
      <WishlistItemCard
        product={{
          ...simpleProduct,
          type: "variant",
          price: undefined,
          startingPrice: 0,
          variants: [],
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Currently unavailable" })).toBeDisabled();
  });
});
