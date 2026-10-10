import {
  claimPurchaseTracking,
  getOrderItemTrackingId,
  getTrackingItemColour,
  getTrackingItemId,
} from "./trackingItem";

describe("trackingItem", () => {
  beforeEach(() => localStorage.clear());

  it("prefers the variant id, falling back to the product id", () => {
    expect(getTrackingItemId("p1", "v1")).toBe("v1");
    expect(getTrackingItemId("p1", null)).toBe("p1");
    expect(getTrackingItemId({ _id: "p1" }, { _id: "v1" })).toBe("v1");
    expect(getTrackingItemId({ _id: "p1" })).toBe("p1");
  });

  it("reads an order item's id whether or not its product is populated", () => {
    const base = { nameSnapshot: "x", priceSnapshot: 1, qty: 1 };
    expect(getOrderItemTrackingId({ ...base, product: "p1", variantId: "v1" })).toBe("v1");
    expect(
      getOrderItemTrackingId({
        ...base,
        product: { _id: "p1", name: "x", type: "simple", category: null },
        variantId: null,
      }),
    ).toBe("p1");
  });

  it("takes the colour from the variant's colour attribute, else the product", () => {
    expect(getTrackingItemColour({ color: "Red" }, { attributes: { color: "Green" } })).toBe(
      "Green",
    );
    expect(getTrackingItemColour({ color: "Red" }, { attributes: { Size: "Free" } })).toBe("Red");
    expect(getTrackingItemColour({})).toBeUndefined();
  });

  it("claims a purchase once per order", () => {
    expect(claimPurchaseTracking("o1")).toBe(true);
    expect(claimPurchaseTracking("o1")).toBe(false);
    expect(claimPurchaseTracking("o2")).toBe(true);
  });
});
