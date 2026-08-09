import type { ProductVariant } from "@/types";

export type AttributeSelection = Record<string, string>;

// Only variants matching every already-selected attribute (other than `attributeName` itself)
// can offer a value for `attributeName` — this is what stops a UI from letting someone select
// a color+borderWidth combination that doesn't actually exist as a variant.
export function getAvailableValues(
  variants: ProductVariant[],
  attributeName: string,
  selected: AttributeSelection,
): string[] {
  const otherSelections = Object.entries(selected).filter(([key]) => key !== attributeName);
  const candidates = variants.filter(
    (variant) =>
      variant.isActive &&
      otherSelections.every(([key, value]) => variant.attributes[key] === value),
  );
  const values = candidates.map((variant) => variant.attributes[attributeName]).filter(Boolean);
  return Array.from(new Set(values));
}

export function findMatchingVariant(
  variants: ProductVariant[],
  attributeNames: string[],
  selected: AttributeSelection,
): ProductVariant | undefined {
  if (attributeNames.some((name) => !selected[name])) return undefined;
  return variants.find(
    (variant) =>
      variant.isActive &&
      attributeNames.every((name) => variant.attributes[name] === selected[name]),
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

  for (const name of attributeNames) {
    if (name === changedAttribute) continue;
    const availableForName = getAvailableValues(variants, name, next);
    if (!next[name] || !availableForName.includes(next[name])) {
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
    if (firstActive.attributes[name]) selection[name] = firstActive.attributes[name];
  }
  return selection;
}
