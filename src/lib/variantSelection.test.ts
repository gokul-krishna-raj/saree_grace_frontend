import type { ProductVariant } from "@/types";

import {
  applySelection,
  findMatchingVariant,
  getAvailableValues,
  getDefaultSelection,
} from "./variantSelection";

// Deliberately non-combinatorial: Red only comes in 2 inch, Green only in 4 inch — matches the
// real seeded Kanjivaram product, and is exactly the case naive "show every value always" UIs
// get wrong.
const variants: ProductVariant[] = [
  {
    _id: "v1",
    sku: "SG-VAR-RED-2IN",
    attributes: { color: "Red", borderWidth: "2 inch" },
    price: 7999,
    stock: 8,
    images: [],
    isActive: true,
  },
  {
    _id: "v2",
    sku: "SG-VAR-GREEN-4IN",
    attributes: { color: "Green", borderWidth: "4 inch" },
    price: 8999,
    stock: 5,
    images: [],
    isActive: true,
  },
  {
    _id: "v3",
    sku: "SG-VAR-RED-4IN-INACTIVE",
    attributes: { color: "Red", borderWidth: "4 inch" },
    price: 8499,
    stock: 3,
    images: [],
    isActive: false,
  },
];

const attributeNames = ["color", "borderWidth"];

describe("getAvailableValues", () => {
  it("returns every distinct active value for an attribute with no other selection", () => {
    expect(getAvailableValues(variants, "color", {})).toEqual(["Red", "Green"]);
  });

  it("narrows to only values reachable given another attribute's selection", () => {
    expect(getAvailableValues(variants, "borderWidth", { color: "Red" })).toEqual(["2 inch"]);
    expect(getAvailableValues(variants, "borderWidth", { color: "Green" })).toEqual(["4 inch"]);
  });

  it("excludes inactive variants from availability", () => {
    // Red + 4 inch only exists as an inactive variant — it must not appear as available.
    expect(getAvailableValues(variants, "color", { borderWidth: "4 inch" })).toEqual(["Green"]);
  });
});

describe("applySelection", () => {
  it("auto-corrects a now-unreachable attribute when another attribute changes", () => {
    // Start on Red/2 inch, then switch color to Green — 2 inch isn't available for Green,
    // so borderWidth must snap to the one value that is (4 inch), not stay stuck on 2 inch.
    const afterRed = applySelection(variants, attributeNames, {}, "color", "Red");
    expect(afterRed).toEqual({ color: "Red", borderWidth: "2 inch" });

    const afterGreen = applySelection(variants, attributeNames, afterRed, "color", "Green");
    expect(afterGreen).toEqual({ color: "Green", borderWidth: "4 inch" });
  });

  it("keeps a still-valid attribute selection unchanged", () => {
    const selection = applySelection(
      variants,
      attributeNames,
      { color: "Red", borderWidth: "2 inch" },
      "borderWidth",
      "2 inch",
    );
    expect(selection).toEqual({ color: "Red", borderWidth: "2 inch" });
  });
});

describe("findMatchingVariant", () => {
  it("returns undefined for an incomplete selection", () => {
    expect(findMatchingVariant(variants, attributeNames, { color: "Red" })).toBeUndefined();
  });

  it("finds the exact active variant for a complete, valid selection", () => {
    const match = findMatchingVariant(variants, attributeNames, {
      color: "Red",
      borderWidth: "2 inch",
    });
    expect(match?._id).toBe("v1");
  });

  it("does not match an inactive variant even if the attributes line up", () => {
    const match = findMatchingVariant(variants, attributeNames, {
      color: "Red",
      borderWidth: "4 inch",
    });
    expect(match).toBeUndefined();
  });
});

describe("getDefaultSelection", () => {
  it("defaults to the first active variant's attributes", () => {
    expect(getDefaultSelection(variants, attributeNames)).toEqual({
      color: "Red",
      borderWidth: "2 inch",
    });
  });
});
