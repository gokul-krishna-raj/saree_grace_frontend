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
  maxPrice: 1899,
  totalStock: 25,
  variantCount: 0,
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

  it("shows 'From' pricing for a variant product whose variants share one price", () => {
    render(
      <ProductCard
        product={{
          ...simpleProduct,
          type: "variant",
          price: undefined,
          stock: undefined,
          startingPrice: 7999,
          maxPrice: 7999,
          totalStock: 8,
          variantCount: 1,
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

  it("shows a price range when a variant product's variants span different prices", () => {
    render(
      <ProductCard
        product={{
          ...simpleProduct,
          type: "variant",
          price: undefined,
          stock: undefined,
          startingPrice: 4999,
          maxPrice: 5299,
          totalStock: 17,
          variantCount: 4,
        }}
      />,
    );

    expect(screen.getByText("₹4,999 – ₹5,299")).toBeInTheDocument();
    expect(screen.getByText("4 options")).toBeInTheDocument();
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

  it("renders color swatches and switches variant images on click without duplicates", async () => {
    const variantProduct: Product = {
      ...simpleProduct,
      type: "variant",
      price: undefined,
      stock: undefined,
      startingPrice: 3000,
      maxPrice: 3500,
      totalStock: 10,
      variantCount: 3,
      variants: [
        {
          _id: "v-red-s",
          sku: "SKU-RED-S",
          attributes: { color: "Red", colorCode: "#ff0000", size: "S" },
          price: 3000,
          stock: 5,
          images: [{ url: "https://example.com/red.jpg", publicId: "img-red", isPrimary: true }],
          isActive: true,
        },
        {
          _id: "v-red-m",
          sku: "SKU-RED-M",
          attributes: { color: "Red", colorCode: "#ff0000", size: "M" },
          price: 3000,
          stock: 3,
          images: [{ url: "https://example.com/red.jpg", publicId: "img-red", isPrimary: true }],
          isActive: true,
        },
        {
          _id: "v-blue",
          sku: "SKU-BLUE",
          attributes: { color: "Blue", colorCode: "#0000ff" },
          price: 3500,
          stock: 2,
          images: [{ url: "https://example.com/blue.jpg", publicId: "img-blue", isPrimary: true }],
          isActive: true,
        },
      ],
    };

    render(<ProductCard product={variantProduct} />);

    // 2 unique colors should be rendered ("Red" and "Blue"), ignoring duplicate "Red"
    const redButton = screen.getByRole("button", { name: "Select Red" });
    const blueButton = screen.getByRole("button", { name: "Select Blue" });
    expect(redButton).toBeInTheDocument();
    expect(blueButton).toBeInTheDocument();
    expect(screen.getByText("2 colors")).toBeInTheDocument();

    const redSwatch = redButton.querySelector("span[aria-hidden='true']");
    expect(redSwatch).toHaveStyle({ backgroundColor: "#ff0000" });

    const blueSwatch = blueButton.querySelector("span[aria-hidden='true']");
    expect(blueSwatch).toHaveStyle({ backgroundColor: "#0000ff" });

    // Click blue swatch to switch image
    await userEvent.click(blueButton);
    expect(blueButton).toHaveAttribute("aria-pressed", "true");
    const image = screen.getByAltText(variantProduct.name);
    expect(image).toHaveAttribute("src", expect.stringContaining("blue.jpg"));
  });

  it("does not render color swatches for simple products", () => {
    render(<ProductCard product={simpleProduct} />);
    expect(screen.queryByRole("button", { name: /^Select /i })).not.toBeInTheDocument();
  });
});
