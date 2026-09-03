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

// Selecting a value for one attribute can invalidate a previously-chosen value for another
// (e.g. picking a color that isn't offered in the currently-selected border width) — this
// recomputes the whole selection so every attribute always points at a reachable value.
export function applySelection(
  variants: ProductVariant[],
  attributeNames: string[],
  current: AttributeSelection,
  changedAttribute: string,
  changedValue: string,
): AttributeSelection {
  const next: AttributeSelection = { ...current, [changedAttribute]: changedValue };

  const changedAttrLower = changedAttribute.trim().toLowerCase();
  for (const key of Object.keys(next)) {
    if (key !== changedAttribute && key.trim().toLowerCase() === changedAttrLower) {
      delete next[key];
    }
  }

  for (const name of attributeNames) {
    if (name.trim().toLowerCase() === changedAttrLower) continue;
    const availableForName = getAvailableValues(variants, name, next);
    const currentValue = getAttrValue(next, name);
    const isCurrentValueAvailable =
      currentValue !== undefined &&
      availableForName.some(
        (v) => v === currentValue || v.trim().toLowerCase() === currentValue.trim().toLowerCase(),
      );

    if (!isCurrentValueAvailable) {
      if (availableForName.length > 0) {
        next[name] = availableForName[0];
      } else {
        delete next[name];
      }
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
