import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";

import { makeStore } from "@/store";
import type { Product } from "@/types";

import { ProductDetailClient } from "./ProductDetailClient";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/lib/analytics", () => ({
  trackViewItem: jest.fn(),
  trackAddToCart: jest.fn(),
}));

jest.mock("@/hooks/useWishlistToggle", () => ({
  useWishlistToggle: () => ({
    isWishlisted: false,
    toggle: jest.fn(),
    isLoading: false,
  }),
}));

const variantProduct: Product = {
  _id: "prod-variant-1",
  name: "Kanjivaram Silk Saree",
  slug: "kanjivaram-silk-saree",
  description: "Traditional Kanjivaram silk saree with zari border",
  type: "variant",
  category: {
    _id: "cat-1",
    name: "Silk Sarees",
    slug: "silk-sarees",
    parentCategory: null,
    isActive: true,
  },
  isHandloom: true,
  images: [{ url: "https://example.com/general-product.jpg", publicId: "gen-1", isPrimary: true }],
  ratingAvg: 4.8,
  reviewCount: 12,
  isActive: true,
  startingPrice: 7999,
  maxPrice: 8999,
  totalStock: 13,
  variantCount: 2,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  variantAttributeNames: ["color", "colorCode"],
  variants: [
    {
      _id: "var-red",
      sku: "SG-VAR-RED",
      attributes: { color: "Red", colorCode: "#ff0000" },
      price: 7999,
      compareAtPrice: 9999,
      stock: 8,
      images: [
        { url: "https://example.com/red-1.jpg", publicId: "red-1", isPrimary: true },
        { url: "https://example.com/red-2.jpg", publicId: "red-2" },
        { url: "https://example.com/red-3.jpg", publicId: "red-3" },
      ],
      isActive: true,
    },
    {
      _id: "var-blue",
      sku: "SG-VAR-BLUE",
      attributes: { color: "Blue", colorCode: "#0000ff" },
      price: 8999,
      compareAtPrice: 10999,
      stock: 5,
      images: [
        { url: "https://example.com/blue-1.jpg", publicId: "blue-1", isPrimary: true },
        { url: "https://example.com/blue-2.jpg", publicId: "blue-2" },
      ],
      isActive: true,
    },
  ],
};

const simpleProduct: Product = {
  _id: "prod-simple-1",
  name: "Handloom Cotton Saree",
  slug: "handloom-cotton-saree",
  description: "Breathable cotton saree",
  type: "simple",
  category: {
    _id: "cat-2",
    name: "Cotton Sarees",
    slug: "cotton-sarees",
    parentCategory: null,
    isActive: true,
  },
  isHandloom: true,
  images: [
    { url: "https://example.com/cotton-1.jpg", publicId: "cot-1", isPrimary: true },
    { url: "https://example.com/cotton-2.jpg", publicId: "cot-2" },
  ],
  price: 1899,
  compareAtPrice: 2499,
  stock: 20,
  sku: "SG-COT-01",
  ratingAvg: 4.5,
  reviewCount: 6,
  isActive: true,
  startingPrice: 1899,
  maxPrice: 1899,
  totalStock: 20,
  variantCount: 0,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

function renderWithStore(ui: React.ReactElement) {
  const store = makeStore();
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

describe("ProductDetailClient", () => {
  describe("Variant Products with Multiple Colors", () => {
    it("renders color swatches and initially displays images associated with the default selected color (Red)", () => {
      renderWithStore(<ProductDetailClient product={variantProduct} />);

      // Color swatches displayed
      expect(screen.getByRole("button", { name: "Red" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Blue" })).toBeInTheDocument();

      // Main image should be the first image of Red
      expect(screen.getByAltText("Kanjivaram Silk Saree — photo 1")).toHaveAttribute(
        "src",
        expect.stringContaining("red-1.jpg"),
      );

      // Bottom thumbnails should only show Red images (3 thumbnails)
      expect(screen.getByRole("button", { name: "View photo 1 of 3" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "View photo 2 of 3" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "View photo 3 of 3" })).toBeInTheDocument();

      // Blue images must NOT be present in the gallery
      expect(screen.queryByRole("button", { name: "View photo 1 of 2" })).not.toBeInTheDocument();

      // Price reflects Red variant
      expect(screen.getByText("₹7,999")).toBeInTheDocument();
    });

    it("updates gallery to show only Blue images and resets main image to first image when switching to Blue", async () => {
      renderWithStore(<ProductDetailClient product={variantProduct} />);

      // Switch to Blue variant
      const blueSwatch = screen.getByRole("button", { name: "Blue" });
      await userEvent.click(blueSwatch);

      // Main image should now be Blue photo 1
      expect(screen.getByAltText("Kanjivaram Silk Saree — photo 1")).toHaveAttribute(
        "src",
        expect.stringContaining("blue-1.jpg"),
      );

      // Bottom thumbnails should now show only Blue images (2 thumbnails)
      expect(screen.getByRole("button", { name: "View photo 1 of 2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "View photo 2 of 2" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "View photo 3 of 3" })).not.toBeInTheDocument();

      // Price updates to Blue variant price
      expect(screen.getByText("₹8,999")).toBeInTheDocument();
    });

    it("changes the main image when clicking a thumbnail within the selected color", async () => {
      renderWithStore(<ProductDetailClient product={variantProduct} />);

      // Currently Red (3 images). Click second thumbnail
      const secondThumbnail = screen.getByRole("button", { name: "View photo 2 of 3" });
      await userEvent.click(secondThumbnail);

      // Main image should update to photo 2 (red-2.jpg)
      expect(screen.getByAltText("Kanjivaram Silk Saree — photo 2")).toHaveAttribute(
        "src",
        expect.stringContaining("red-2.jpg"),
      );

      // Switching color to Blue resets the image index to photo 1
      const blueSwatch = screen.getByRole("button", { name: "Blue" });
      await userEvent.click(blueSwatch);

      expect(screen.getByAltText("Kanjivaram Silk Saree — photo 1")).toHaveAttribute(
        "src",
        expect.stringContaining("blue-1.jpg"),
      );
    });
  });

  describe("Simple Products", () => {
    it("renders all product images in gallery without displaying any color swatches", () => {
      renderWithStore(<ProductDetailClient product={simpleProduct} />);

      // No color swatches should appear
      expect(screen.queryByRole("button", { name: "Red" })).not.toBeInTheDocument();
      expect(screen.queryByText(/color:/i)).not.toBeInTheDocument();

      // Main image and thumbnails show product.images (2 images)
      expect(screen.getByAltText("Handloom Cotton Saree — photo 1")).toHaveAttribute(
        "src",
        expect.stringContaining("cotton-1.jpg"),
      );
      expect(screen.getByRole("button", { name: "View photo 1 of 2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "View photo 2 of 2" })).toBeInTheDocument();

      // Price reflects simple product price
      expect(screen.getByText("₹1,899")).toBeInTheDocument();
    });
  });
});
