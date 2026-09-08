import type { ProductVariant } from "@/types";

import {
  applySelection,
  findMatchingVariant,
  getAllAttributeValues,
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

describe("case-insensitive attribute handling", () => {
  const mixedCaseVariants: ProductVariant[] = [
    {
      _id: "m1",
      sku: "SG-MIXED-1",
      attributes: { color: "Maroon", border: "Zari" },
      price: 5000,
      stock: 3,
      images: [],
      isActive: true,
    },
    {
      _id: "m2",
      sku: "SG-MIXED-2",
      attributes: { color: "Gold", border: "Thread" },
      price: 6000,
      stock: 4,
      images: [],
      isActive: true,
    },
  ];

  it("retrieves available values when attributeName casing differs from variant attributes", () => {
    expect(getAvailableValues(mixedCaseVariants, "Color", {})).toEqual(["Maroon", "Gold"]);
    expect(getAvailableValues(mixedCaseVariants, "Border", { Color: "Maroon" })).toEqual(["Zari"]);
  });

  it("finds matching variant when selection and attributeNames casing differ", () => {
    const match = findMatchingVariant(mixedCaseVariants, ["Color", "Border"], {
      Color: "Maroon",
      Border: "Zari",
    });
    expect(match?._id).toBe("m1");
  });

  it("produces default selection when attributeNames use uppercase", () => {
    expect(getDefaultSelection(mixedCaseVariants, ["Color", "Border"])).toEqual({
      Color: "Maroon",
      Border: "Zari",
    });
  });

  it("applies selection smoothly with differing casing", () => {
    const next = applySelection(
      mixedCaseVariants,
      ["Color", "Border"],
      { Color: "Maroon", Border: "Zari" },
      "Color",
      "Gold",
    );
    expect(next).toEqual({ Color: "Gold", Border: "Thread" });
  });
});

describe("getAllAttributeValues & 6 color variants handling", () => {
  // Simulates real Kubera Silk Sarees product with 6 distinct colorways and differing borders
  const sixColorVariants: ProductVariant[] = [
    {
      _id: "v1",
      sku: "SG-KP-SK-1011",
      attributes: { color: "Cream", colorCode: "#bba995", border: "Blue" },
      price: 1500,
      stock: 10,
      images: [],
      isActive: true,
    },
    {
      _id: "v2",
      sku: "SS-KP-PK-1012",
      attributes: { color: "pink", colorCode: "#e67382", border: "Blue" },
      price: 1500,
      stock: 10,
      images: [],
      isActive: true,
    },
    {
      _id: "v3",
      sku: "SS-KP-SL-1013",
      attributes: { color: "Mustard yellow", colorCode: "#ad622b", border: "Maroon" },
      price: 1500,
      stock: 10,
      images: [],
      isActive: true,
    },
    {
      _id: "v4",
      sku: "SS-KP-RE-1014",
      attributes: { color: "Ruby pink", colorCode: "#b0214d", border: "Green" },
      price: 1500,
      stock: 10,
      images: [],
      isActive: true,
    },
    {
      _id: "v5",
      sku: "SS-KP-BLE-1015",
      attributes: { color: "Blue", colorCode: "#6e9897", border: "Ink blue" },
      price: 1500,
      stock: 10,
      images: [],
      isActive: true,
    },
    {
      _id: "v6",
      sku: "SS-KP-YLL-1016",
      attributes: { color: "Yellow", colorCode: "#e6cf5d", border: "Blue" },
      price: 1500,
      stock: 10,
      images: [],
      isActive: true,
    },
  ];

  it("returns all 6 color variants without filtering out colors from differing secondary attributes", () => {
    const colors = getAllAttributeValues(sixColorVariants, "color");
    expect(colors).toHaveLength(6);
    expect(colors).toEqual(["Cream", "pink", "Mustard yellow", "Ruby pink", "Blue", "Yellow"]);
  });

  it("returns all 4 border values without filtering", () => {
    const borders = getAllAttributeValues(sixColorVariants, "border");
    expect(borders).toHaveLength(4);
    expect(borders).toEqual(["Blue", "Maroon", "Green", "Ink blue"]);
  });

  it("switches to Ruby pink and automatically resolves its corresponding Green border", () => {
    const initialSelection = { color: "Cream", border: "Blue" };
    const nextSelection = applySelection(
      sixColorVariants,
      ["color", "border"],
      initialSelection,
      "color",
      "Ruby pink",
    );
    expect(nextSelection).toEqual({ color: "Ruby pink", border: "Green" });

    const matched = findMatchingVariant(sixColorVariants, ["color", "border"], nextSelection);
    expect(matched?._id).toBe("v4");
    expect(matched?.sku).toBe("SS-KP-RE-1014");
  });

  it("switches to Mustard yellow and automatically resolves its corresponding Maroon border", () => {
    const initialSelection = { color: "Cream", border: "Blue" };
    const nextSelection = applySelection(
      sixColorVariants,
      ["color", "border"],
      initialSelection,
      "color",
      "Mustard yellow",
    );
    expect(nextSelection).toEqual({ color: "Mustard yellow", border: "Maroon" });

    const matched = findMatchingVariant(sixColorVariants, ["color", "border"], nextSelection);
    expect(matched?._id).toBe("v3");
    expect(matched?.sku).toBe("SS-KP-SL-1013");
  });

  it("switches to Blue border and automatically resolves to Cream or Yellow", () => {
    const initialSelection = { color: "Mustard yellow", border: "Maroon" };
    const nextSelection = applySelection(
      sixColorVariants,
      ["color", "border"],
      initialSelection,
      "border",
      "Green",
    );
    expect(nextSelection).toEqual({ color: "Ruby pink", border: "Green" });
  });
});
