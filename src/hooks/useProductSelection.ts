import { useMemo, useState } from "react";

import { getImagesForSelection, productAttributeNames } from "@/lib/productSelection";
import { applySelection, findMatchingVariant, getDefaultSelection } from "@/lib/variantSelection";
import type { Product } from "@/types";

export { getImagesForSelection };

// Variant selection state shared by the PDP and quick view: which attribute values are chosen,
// the variant they resolve to, and the price/images that follow from it.
export function useProductSelection(product: Product) {
  const attributeNames = productAttributeNames(product);
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const [selection, setSelection] = useState(() => getDefaultSelection(variants, attributeNames));

  const activeVariant =
    product.type === "variant"
      ? findMatchingVariant(variants, attributeNames, selection)
      : undefined;
  const requiresVariantSelection = product.type === "variant" && !activeVariant;

  const images = useMemo(
    () => getImagesForSelection(product, variants, activeVariant, selection),
    [product, variants, activeVariant, selection],
  );
  const price =
    product.type === "variant"
      ? (activeVariant?.price ?? product.startingPrice)
      : (product.price ?? 0);
  const compareAtPrice =
    product.type === "variant" ? activeVariant?.compareAtPrice : product.compareAtPrice;
  const discountPercent =
    compareAtPrice && compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  const stock = product.type === "variant" ? activeVariant?.stock : (product.stock ?? 0);

  function select(attributeName: string, value: string) {
    setSelection((current) =>
      applySelection(variants, attributeNames, current, attributeName, value),
    );
  }

  return {
    attributeNames,
    variants,
    selection,
    select,
    activeVariant,
    requiresVariantSelection,
    images,
    price,
    compareAtPrice,
    discountPercent,
    stock,
  };
}
