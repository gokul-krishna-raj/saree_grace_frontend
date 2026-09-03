// Mirrors the backend's hex validation exactly (saree_grace_backend's
// product.validation.ts `HEX_COLOR_RE`) — keep in sync if that regex changes.
export const HEX_COLOR_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_RE.test(value.trim());
}

export function isColorAttribute(name: string): boolean {
  const lower = name.trim().toLowerCase();
  return lower === "color" || lower === "colour";
}

// A "colorCode" variant attribute (see BACKEND_CONTRACT.md) exists only so a
// shopper's picked "color" gets a real swatch — it isn't a pickable dimension
// of its own the way "color" or "size" is. It's excluded from the selectable
// attribute-dimension list everywhere variant selection/matching happens
// (see ProductDetailClient.tsx), so a product whose admin included it in
// `variantAttributeNames` still lets a shopper reach every variant without
// ever being asked to "pick a colorCode".
export function isColorCodeAttribute(name: string): boolean {
  const lower = name.trim().toLowerCase();
  return (
    lower === "colorcode" ||
    lower === "color_code" ||
    lower === "color-code" ||
    lower === "colourcode" ||
    lower === "colour_code" ||
    lower === "colour-code"
  );
}

export function selectableAttributeNames(attributeNames: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of attributeNames) {
    const trimmed = name.trim();
    if (!trimmed || isColorCodeAttribute(trimmed)) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }
  return result;
}

// Attribute keys are whatever an admin typed into `variantAttributeNames`
// (case preserved), so this looks the key up case-insensitively rather than
// assuming the exact string "colorCode".
export function getColorCodeValue(attributes: Record<string, string>): string | undefined {
  const key = Object.keys(attributes).find((k) => isColorCodeAttribute(k));
  if (key && attributes[key] && isValidHexColor(attributes[key])) {
    return attributes[key].trim();
  }
  // Fallback: check if any color attribute value itself is a valid hex
  const colorKey = Object.keys(attributes).find((k) => isColorAttribute(k));
  if (colorKey && attributes[colorKey] && isValidHexColor(attributes[colorKey])) {
    return attributes[colorKey].trim();
  }
  return undefined;
}
