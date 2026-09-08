import type { ProductVariant } from "@/types";

export type AttributeSelection = Record<string, string>;

/**
 * Case-insensitive lookup of an attribute value in a key/value map.
 * Checks for an exact key match first, then falls back to case-insensitive match.
 */
export function getAttrValue(
  attributes: Record<string, string> | undefined,
  name: string,
): string | undefined {
  if (!attributes) return undefined;
  if (attributes[name] !== undefined) return attributes[name];
  const target = name.trim().toLowerCase();
  const matchedKey = Object.keys(attributes).find((k) => k.trim().toLowerCase() === target);
  return matchedKey ? attributes[matchedKey] : undefined;
}

// Only variants matching every already-selected attribute (other than `attributeName` itself)
// can offer a value for `attributeName` — this is what stops a UI from letting someone select
// a color+borderWidth combination that doesn't actually exist as a variant.
export function getAvailableValues(
  variants: ProductVariant[],
  attributeName: string,
  selected: AttributeSelection,
): string[] {
  const targetAttrLower = attributeName.trim().toLowerCase();
  const otherSelections = Object.entries(selected).filter(
    ([key]) => key.trim().toLowerCase() !== targetAttrLower,
  );
  const candidates = variants.filter(
    (variant) =>
      variant.isActive &&
      otherSelections.every(([key, value]) => {
        const variantVal = getAttrValue(variant.attributes, key);
        return (
          variantVal !== undefined &&
          (variantVal === value || variantVal.trim().toLowerCase() === value.trim().toLowerCase())
        );
      }),
  );
  const values = candidates
    .map((variant) => getAttrValue(variant.attributes, attributeName))
    .filter((v): v is string => Boolean(v));
  return Array.from(new Set(values));
}

export function findMatchingVariant(
  variants: ProductVariant[],
  attributeNames: string[],
  selected: AttributeSelection,
): ProductVariant | undefined {
  if (attributeNames.some((name) => !getAttrValue(selected, name))) return undefined;
  return variants.find(
    (variant) =>
      variant.isActive &&
      attributeNames.every((name) => {
        const selectedVal = getAttrValue(selected, name);
        const variantVal = getAttrValue(variant.attributes, name);
        return (
          selectedVal !== undefined &&
          variantVal !== undefined &&
          (selectedVal === variantVal ||
            selectedVal.trim().toLowerCase() === variantVal.trim().toLowerCase())
        );
      }),
  );
}

/**
 * Returns all distinct active values for an attribute across all active variants of a product.
 * Ensures all variants (e.g. all 6 color variants) are always displayed to the shopper,
 * regardless of what other attributes are currently selected.
 */
export function getAllAttributeValues(variants: ProductVariant[], attributeName: string): string[] {
  const target = attributeName.trim().toLowerCase();
  const values: string[] = [];
  const seen = new Set<string>();

  for (const variant of variants) {
    if (!variant.isActive) continue;
    const val = getAttrValue(variant.attributes, target);
    if (val) {
      const lower = val.trim().toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        values.push(val);
      }
    }
  }

  return values;
}

// Selecting a value for one attribute resolves the best matching active variant
// (e.g. picking a color that has a specific border snaps the border to that variant's border)
// — this guarantees every attribute selection always points at a reachable, valid variant.
export function applySelection(
  variants: ProductVariant[],
  attributeNames: string[],
  current: AttributeSelection,
  changedAttribute: string,
  changedValue: string,
): AttributeSelection {
  const changedAttrLower = changedAttribute.trim().toLowerCase();
  const changedValLower = changedValue.trim().toLowerCase();

  // Find all active variants that have the requested value for the changed attribute
  const matchingVariants = variants.filter((variant) => {
    if (!variant.isActive) return false;
    const val = getAttrValue(variant.attributes, changedAttrLower);
    return val !== undefined && val.trim().toLowerCase() === changedValLower;
  });

  if (matchingVariants.length > 0) {
    // Score each candidate by how many other attributes it shares with the current selection
    let bestVariant = matchingVariants[0];
    let maxScore = -1;

    for (const variant of matchingVariants) {
      let score = 0;
      for (const [key, value] of Object.entries(current)) {
        if (key.trim().toLowerCase() === changedAttrLower) continue;
        const variantVal = getAttrValue(variant.attributes, key);
        if (
          variantVal !== undefined &&
          variantVal.trim().toLowerCase() === value.trim().toLowerCase()
        ) {
          score += 1;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestVariant = variant;
      }
    }

    // Build complete attribute selection from best matching variant for all attributeNames
    const result: AttributeSelection = {};
    for (const name of attributeNames) {
      const val = getAttrValue(bestVariant.attributes, name);
      if (val) {
        result[name] = val;
      }
    }
    return result;
  }

  // Fallback: if no active variant matched, keep current selection with changed attribute
  const next: AttributeSelection = { ...current, [changedAttribute]: changedValue };
  for (const key of Object.keys(next)) {
    if (key !== changedAttribute && key.trim().toLowerCase() === changedAttrLower) {
      delete next[key];
    }
  }
  return next;
}

export function getDefaultSelection(
  variants: ProductVariant[],
  attributeNames: string[],
): AttributeSelection {
  const firstActive = variants.find((variant) => variant.isActive) ?? variants[0];
  if (!firstActive) return {};
  const selection: AttributeSelection = {};
  for (const name of attributeNames) {
    const val = getAttrValue(firstActive.attributes, name);
    if (val) selection[name] = val;
  }
  return selection;
}
