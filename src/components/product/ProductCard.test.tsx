import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Product } from "@/types";

const toggleMock = jest.fn();
let mockWishlisted = false;

jest.mock("@/hooks/useWishlistToggle", () => ({
  useWishlistToggle: () => ({
    isWishlisted: mockWishlisted,
    toggle: toggleMock,
    isLoading: false,
  }),
}));

import { ProductCard } from "./ProductCard";

const simpleProduct: Product = {
  _id: "p1",
  name: "Handloom Cotton Saree - Blue",
  slug: "handloom-cotton-saree-blue",
  description: "A breathable, handwoven cotton saree.",
  type: "simple",
  category: "cat1",
  isHandloom: true,
  images: [{ url: "https://res.cloudinary.com/demo/image.jpg", publicId: "x", isPrimary: true }],
  ratingAvg: 0,
  reviewCount: 0,
  isActive: true,
  startingPrice: 1899,
  createdAt: "",
  updatedAt: "",
  price: 1899,
  stock: 25,
};

describe("ProductCard", () => {
  beforeEach(() => {
    toggleMock.mockReset();
    mockWishlisted = false;
  });

  it("renders the product name, price, and handloom badge", () => {
    render(<ProductCard product={simpleProduct} />);

    expect(screen.getByText("Handloom Cotton Saree - Blue")).toBeInTheDocument();
    expect(screen.getByText("₹1,899")).toBeInTheDocument();
    expect(screen.getByText("Handloom")).toBeInTheDocument();
  });

  it("shows an out-of-stock overlay when a simple product has no stock", () => {
    render(<ProductCard product={{ ...simpleProduct, stock: 0 }} />);
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("shows 'From' pricing for variant products using startingPrice", () => {
    render(
      <ProductCard
        product={{
          ...simpleProduct,
          type: "variant",
          price: undefined,
          stock: undefined,
          startingPrice: 7999,
          variants: [
            {
              _id: "v1",
              sku: "SKU1",
              attributes: { color: "Red" },
              price: 7999,
              stock: 8,
              images: [],
              isActive: true,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("From ₹7,999")).toBeInTheDocument();
  });

  it("calls toggle when the wishlist heart is clicked", async () => {
    render(<ProductCard product={simpleProduct} />);

    await userEvent.click(screen.getByRole("button", { name: /add .* to wishlist/i }));
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });

  it("reflects the wishlisted state in the button's accessible label", () => {
    mockWishlisted = true;
    render(<ProductCard product={simpleProduct} />);

    expect(screen.getByRole("button", { name: /remove .* from wishlist/i })).toBeInTheDocument();
  });
});
