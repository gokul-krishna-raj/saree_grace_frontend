import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ProductImage } from "@/types";

import { ImageGallery } from "./ImageGallery";

const testImages: ProductImage[] = [
  { url: "https://example.com/red-saree-1.jpg", publicId: "red-1", isPrimary: true },
  { url: "https://example.com/red-saree-2.jpg", publicId: "red-2" },
  { url: "https://example.com/red-saree-3.jpg", publicId: "red-3" },
];

const blueImages: ProductImage[] = [
  { url: "https://example.com/blue-saree-1.jpg", publicId: "blue-1", isPrimary: true },
  { url: "https://example.com/blue-saree-2.jpg", publicId: "blue-2" },
];

describe("ImageGallery", () => {
  it("renders a large main image and responsive thumbnails at the bottom", () => {
    render(
      <ImageGallery
        images={testImages}
        alt="Kanjivaram Silk Saree"
        isHandloom
        discountPercent={20}
        featured
      />,
    );

    // Main image rendered with correct alt
    const mainImg = screen.getByAltText("Kanjivaram Silk Saree — photo 1");
    expect(mainImg).toBeInTheDocument();

    // Thumbnails rendered at bottom
    expect(screen.getByRole("button", { name: "View photo 1 of 3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View photo 2 of 3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View photo 3 of 3" })).toBeInTheDocument();

    // Badges rendered
    expect(screen.getByText("Handloom")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("20% OFF")).toBeInTheDocument();
  });

  it("changes the main image when a thumbnail is clicked and calls onSelectImage", async () => {
    const onSelectImage = jest.fn();
    render(
      <ImageGallery
        images={testImages}
        alt="Kanjivaram Silk Saree"
        selectedIndex={0}
        onSelectImage={onSelectImage}
      />,
    );

    const secondThumb = screen.getByRole("button", { name: "View photo 2 of 3" });
    await userEvent.click(secondThumb);

    expect(onSelectImage).toHaveBeenCalledWith(1);
  });

  it("automatically resets to the first image when the images prop changes (e.g. on color variant change)", () => {
    const { rerender } = render(
      <ImageGallery images={testImages} alt="Kanjivaram Silk Saree" selectedIndex={2} />,
    );

    expect(screen.getByAltText("Kanjivaram Silk Saree — photo 3")).toBeInTheDocument();

    // User selects Blue color variant
    rerender(<ImageGallery images={blueImages} alt="Kanjivaram Silk Saree" selectedIndex={0} />);

    expect(screen.getByAltText("Kanjivaram Silk Saree — photo 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View photo 1 of 2" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("renders a placeholder when images array is empty", () => {
    render(<ImageGallery images={[]} alt="No Image Saree" />);

    expect(screen.getByText("No image available")).toBeInTheDocument();
  });

  it("supports wishlist toggling and sharing", async () => {
    const onWishlistToggle = jest.fn();
    render(
      <ImageGallery
        images={testImages}
        alt="Kanjivaram Silk Saree"
        isWishlisted={false}
        onWishlistToggle={onWishlistToggle}
      />,
    );

    const wishlistBtn = screen.getByRole("button", { name: "Add to wishlist" });
    await userEvent.click(wishlistBtn);
    expect(onWishlistToggle).toHaveBeenCalledTimes(1);

    const shareBtn = screen.getByRole("button", { name: "Share product" });
    expect(shareBtn).toBeInTheDocument();
  });

  it("opens the zoom modal when clicking on the main image", async () => {
    render(<ImageGallery images={testImages} alt="Kanjivaram Silk Saree" />);

    const zoomButton = screen.getByRole("button", {
      name: "View larger image of Kanjivaram Silk Saree",
    });
    await userEvent.click(zoomButton);

    expect(screen.getByRole("dialog", { name: "Kanjivaram Silk Saree" })).toBeInTheDocument();
    expect(screen.getByAltText("Kanjivaram Silk Saree — enlarged")).toBeInTheDocument();
  });
});
