import { selectableAttributeNames } from "@/lib/colorCode";
import { findMatchingVariant, getAttrValue, getDefaultSelection } from "@/lib/variantSelection";
import type { Product, ProductImage, ProductVariant } from "@/types";

// Pure (no React) so Server Components can use it too — e.g. to preload the photo the PDP
// gallery will show first.
export function getImagesForSelection(
  product: Product,
  variants: ProductVariant[],
  activeVariant: ProductVariant | undefined,
  selection: Record<string, string>,
): ProductImage[] {
  if (product.type !== "variant") {
    return product.images ?? [];
  }

  // Find the selected color attribute value, if any
  const selectedColor = getAttrValue(selection, "color");

  // Collect images strictly for the selected color / active variant
  if (selectedColor) {
    const matchingVariants = variants.filter(
      (v) =>
        v.isActive &&
        getAttrValue(v.attributes, "color")?.trim().toLowerCase() ===
          selectedColor.trim().toLowerCase(),
    );

    const colorImages: ProductImage[] = [];
    const seenUrls = new Set<string>();

    // Prioritize activeVariant's images first if activeVariant matches
    const priorityVariants = activeVariant
      ? [activeVariant, ...matchingVariants.filter((v) => v._id !== activeVariant._id)]
      : matchingVariants;

    for (const v of priorityVariants) {
      for (const img of v.images ?? []) {
        if (img?.url && !seenUrls.has(img.url)) {
          seenUrls.add(img.url);
          colorImages.push(img);
        }
      }
    }

    if (colorImages.length > 0) {
      return colorImages;
    }
  } else if (activeVariant?.images && activeVariant.images.length > 0) {
    return activeVariant.images;
  }

  // Fall back to top-level product images if no variant-specific images exist for this color,
  // but NEVER mix images from other colors!
  return product.images ?? [];
}

export function productAttributeNames(product: Product): string[] {
  const raw =
    product.variantAttributeNames && product.variantAttributeNames.length > 0
      ? product.variantAttributeNames
      : Array.from(
          new Set((product.variants ?? []).flatMap((v) => Object.keys(v.attributes ?? {}))),
        );
  return selectableAttributeNames(raw);
}

// The images the PDP gallery shows before the shopper touches anything (default selection).
export function getInitialGalleryImages(product: Product): ProductImage[] {
  const variants = product.variants ?? [];
  const attributeNames = productAttributeNames(product);
  const selection = getDefaultSelection(variants, attributeNames);
  const activeVariant =
    product.type === "variant"
      ? findMatchingVariant(variants, attributeNames, selection)
      : undefined;
  return getImagesForSelection(product, variants, activeVariant, selection);
}
