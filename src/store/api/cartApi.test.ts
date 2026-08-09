/**
 * @jest-environment node
 *
 * Runs under Node (not jsdom) for the same reason as baseApi.test.ts: RTK Query's
 * `fetchBaseQuery` needs a real global `fetch`/`Request`, which jsdom doesn't implement.
 */
import { makeStore } from "@/store";

import { cartApi } from "./cartApi";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const cartWithOneItem = {
  success: true,
  data: {
    cart: {
      _id: "cart1",
      user: "user1",
      items: [
        {
          _id: "item1",
          product: "p1",
          variantId: null,
          qty: 1,
          priceSnapshot: 1499,
          nameSnapshot: "Elampillai Cotton Saree",
        },
      ],
    },
  },
};

const cartWithTwoItems = {
  ...cartWithOneItem,
  data: {
    cart: {
      ...cartWithOneItem.data.cart,
      items: [
        ...cartWithOneItem.data.cart.items,
        {
          _id: "item2",
          product: "p2",
          variantId: null,
          qty: 1,
          priceSnapshot: 999,
          nameSnapshot: "Silk Border Saree",
        },
      ],
    },
  },
};

describe("cartApi cache invalidation", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("auto-refetches an actively-subscribed getCart query when addCartItem invalidates the Cart tag", async () => {
    let getCartCalls = 0;
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input instanceof Request ? input.url : String(input);
      const method = input instanceof Request ? input.method : (init?.method ?? "GET");

      if (url.includes("/cart") && method === "GET") {
        getCartCalls += 1;
        return jsonResponse(getCartCalls === 1 ? cartWithOneItem : cartWithTwoItems);
      }
      if (url.includes("/cart") && method === "POST") {
        return jsonResponse(cartWithTwoItems);
      }
      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    }) as unknown as typeof fetch;

    const store = makeStore();

    // Subscribe to getCart and keep the subscription alive — RTK Query only auto-refetches
    // queries that have at least one active subscriber when their tags are invalidated.
    const subscription = store.dispatch(cartApi.endpoints.getCart.initiate());
    const firstResult = await subscription;
    expect(firstResult.data?.items).toHaveLength(1);
    expect(getCartCalls).toBe(1);

    await store.dispatch(cartApi.endpoints.addCartItem.initiate({ productId: "p2", qty: 1 }));

    // Invalidation-triggered refetches are dispatched as a followup microtask.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getCartCalls).toBe(2);
    const cachedState = cartApi.endpoints.getCart.select(undefined)(store.getState());
    expect(cachedState.data?.items).toHaveLength(2);

    subscription.unsubscribe();
  });
});
