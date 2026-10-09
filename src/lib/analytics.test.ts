import type { Order, Product } from "@/types";

jest.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST123" },
}));

import { trackAddToCart, trackBeginCheckout, trackPurchase, trackViewItem } from "./analytics";

const product: Product = {
  _id: "p1",
  name: "Handloom Cotton Saree",
  slug: "handloom-cotton-saree",
  description: "d",
  type: "simple",
  category: "cat1",
  isHandloom: true,
  images: [],
  ratingAvg: 0,
  reviewCount: 0,
  isActive: true,
  startingPrice: 1899,
  maxPrice: 1899,
  totalStock: 3,
  variantCount: 0,
  createdAt: "",
  updatedAt: "",
  price: 1899,
  stock: 3,
};

const order: Order = {
  _id: "o1",
  orderNumber: "SG-1001",
  user: "u1",
  items: [
    {
      product: "p1",
      variantId: null,
      nameSnapshot: "Handloom Cotton Saree",
      priceSnapshot: 1899,
      qty: 1,
    },
  ],
  shippingAddress: {} as Order["shippingAddress"],
  itemsTotal: 1899,
  shippingFee: 99,
  total: 1998,
  status: "paid",
  statusHistory: [],
  payment: { provider: "razorpay" },
  tracking: {},
  stockRestored: false,
  createdAt: "",
  updatedAt: "",
};

describe("analytics", () => {
  beforeEach(() => {
    window.gtag = jest.fn();
  });

  it("sends a view_item event with the product's price and id", () => {
    trackViewItem(product);
    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "view_item",
      expect.objectContaining({ items: [expect.objectContaining({ item_id: "p1" })] }),
    );
  });

  it("sends an add_to_cart event scaled to the selected quantity", () => {
    trackAddToCart(product, undefined, 3);
    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "add_to_cart",
      expect.objectContaining({ value: 1899 * 3 }),
    );
  });

  it("uses the variant id as item_id and its colour as item_variant for a variant", () => {
    const variant = {
      _id: "v1",
      sku: "SKU-1",
      attributes: { Colour: "Maroon" },
      price: 2499,
      stock: 1,
      images: [],
      isActive: true,
    };
    trackAddToCart({ ...product, type: "variant" }, variant, 2);
    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "add_to_cart",
      expect.objectContaining({
        value: 2499 * 2,
        items: [expect.objectContaining({ item_id: "v1", item_variant: "Maroon", quantity: 2 })],
      }),
    );
  });

  it("sends begin_checkout with every cart line, using the variant id when there is one", () => {
    trackBeginCheckout(
      [
        { productId: "p1", variantId: null, name: "A", price: 1000, qty: 1 },
        { productId: "p2", variantId: "v2", name: "B", price: 500, qty: 2 },
      ],
      2000,
    );
    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "begin_checkout",
      expect.objectContaining({
        value: 2000,
        currency: "INR",
        items: [
          expect.objectContaining({ item_id: "p1", quantity: 1 }),
          expect.objectContaining({ item_id: "v2", quantity: 2 }),
        ],
      }),
    );
  });

  it("sends a purchase keyed by the order's _id", () => {
    trackPurchase(order);
    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "purchase",
      expect.objectContaining({
        transaction_id: "o1",
        value: 1998,
        currency: "INR",
        items: [expect.objectContaining({ item_id: "p1", price: 1899, quantity: 1 })],
      }),
    );
  });

  it("is a no-op when gtag never loaded (ad blocker)", () => {
    delete window.gtag;
    expect(() => trackViewItem(product)).not.toThrow();
  });
});
