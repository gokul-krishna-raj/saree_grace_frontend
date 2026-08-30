import type { Product, ProductImage, WishlistProductSummary } from "@/types";

/**
 * Retrieves the most appropriate primary image for a product.
 * For Simple Products, retrieves the primary or first image in `product.images`.
 * For Variant Products (where images are often attached to variants), retrieves the primary
 * or first image across variants if `product.images` is empty.
 */
export function getProductPrimaryImage(
  product: Product | WishlistProductSummary,
): ProductImage | undefined {
  return (
    (product.images ?? []).find((img) => img.isPrimary) ??
    product.images?.[0] ??
    (product.variants ?? []).flatMap((v) => v.images ?? []).find((img) => img.isPrimary) ??
    (product.variants ?? []).flatMap((v) => v.images ?? [])[0]
  );
}

/**
 * Retrieves all available images for a product across top-level images and variant images.
 */
export function getProductAllImages(product: Product): ProductImage[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  return (product.variants ?? []).flatMap((v) => v.images ?? []);
}
