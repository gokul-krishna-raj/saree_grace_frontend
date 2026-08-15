// Mirrors the backend's hex validation exactly (saree_grace_backend's
// product.validation.ts `HEX_COLOR_RE`) — keep in sync if that regex changes.
export const HEX_COLOR_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_RE.test(value);
}

// A "colorCode" variant attribute (see BACKEND_CONTRACT.md) exists only so a
// shopper's picked "color" gets a real swatch — it isn't a pickable dimension
// of its own the way "color" or "size" is. It's excluded from the selectable
// attribute-dimension list everywhere variant selection/matching happens
// (see ProductDetailClient.tsx), so a product whose admin included it in
// `variantAttributeNames` still lets a shopper reach every variant without
// ever being asked to "pick a colorCode".
const COLOR_CODE_ATTRIBUTE = "colorcode";

export function isColorCodeAttribute(name: string): boolean {
  return name.trim().toLowerCase() === COLOR_CODE_ATTRIBUTE;
}

export function selectableAttributeNames(attributeNames: string[]): string[] {
  return attributeNames.filter((name) => !isColorCodeAttribute(name));
}

// Attribute keys are whatever an admin typed into `variantAttributeNames`
// (case preserved), so this looks the key up case-insensitively rather than
// assuming the exact string "colorCode".
export function getColorCodeValue(attributes: Record<string, string>): string | undefined {
  const key = Object.keys(attributes).find((k) => isColorCodeAttribute(k));
  return key ? attributes[key] : undefined;
}
