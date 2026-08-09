import type { Order, Product } from "@/types";

jest.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST123" },
}));

import { trackAddToCart, trackPurchase, trackViewItem } from "./analytics";

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
    sessionStorage.clear();
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

  it("sends a purchase event once, then skips a duplicate call for the same order (e.g. a page refresh)", () => {
    trackPurchase(order);
    trackPurchase(order);

    const purchaseCalls = (window.gtag as jest.Mock).mock.calls.filter(
      (call) => call[1] === "purchase",
    );
    expect(purchaseCalls).toHaveLength(1);
    expect(purchaseCalls[0][2]).toEqual(
      expect.objectContaining({ transaction_id: "SG-1001", value: 1998 }),
    );
  });
});
