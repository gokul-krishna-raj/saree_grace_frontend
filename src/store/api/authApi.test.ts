/**
 * @jest-environment node
 *
 * See baseApi.test.ts for why this runs under Node (real fetch/Request) with a manual
 * window.localStorage shim (used by src/lib/authStorage.ts).
 */
const memoryStorage = new Map<string, string>();
Object.assign(globalThis, {
  window: {
    localStorage: {
      getItem: (key: string) => memoryStorage.get(key) ?? null,
      setItem: (key: string, value: string) => memoryStorage.set(key, value),
      removeItem: (key: string) => memoryStorage.delete(key),
    },
  },
});

import { makeStore } from "@/store";
import { guestItemAdded } from "@/store/slices/guestCartSlice";

import { authApi } from "./authApi";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("authApi guest-cart merge on login", () => {
  afterEach(() => {
    memoryStorage.clear();
    jest.restoreAllMocks();
  });

  it("merges guest cart items into the server cart and clears the guest cart on login", async () => {
    const calls: Array<{ url: string; body: unknown }> = [];

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init);
      const url = request.url;
      const rawBody = await request.clone().text();
      const body = rawBody ? JSON.parse(rawBody) : undefined;
      calls.push({ url, body });

      if (url.includes("/auth/login")) {
        return jsonResponse(200, {
          success: true,
          data: {
            user: { _id: "u1", name: "Priya", email: "priya@example.com", role: "customer" },
            accessToken: "access-token",
            refreshToken: "refresh-token",
          },
        });
      }
      if (url.includes("/cart/merge")) {
        return jsonResponse(200, { success: true, data: { cart: { _id: "c1", items: [] } } });
      }
      throw new Error(`Unexpected fetch call: ${url}`);
    }) as unknown as typeof fetch;

    const store = makeStore();
    store.dispatch(
      guestItemAdded({
        productId: "p1",
        variantId: null,
        qty: 2,
        nameSnapshot: "Handloom Cotton Saree",
        priceSnapshot: 1899,
      }),
    );
    expect(store.getState().guestCart.items).toHaveLength(1);

    await store.dispatch(
      authApi.endpoints.login.initiate({ email: "priya@example.com", password: "secret123" }),
    );
    // `onQueryStarted`'s post-`queryFulfilled` continuation (the merge dispatch) runs as a
    // microtask the outer dispatch doesn't itself wait on — flush it before asserting.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const mergeCall = calls.find((call) => call.url.includes("/cart/merge"));
    expect(mergeCall?.body).toEqual({ items: [{ productId: "p1", variantId: null, qty: 2 }] });
    expect(store.getState().guestCart.items).toEqual([]);
  });

  it("does not call /cart/merge when the guest cart is empty", async () => {
    const calls: string[] = [];
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);
      calls.push(url);
      return jsonResponse(200, {
        success: true,
        data: {
          user: { _id: "u1", name: "Priya", email: "priya@example.com", role: "customer" },
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      });
    }) as unknown as typeof fetch;

    const store = makeStore();
    await store.dispatch(
      authApi.endpoints.login.initiate({ email: "priya@example.com", password: "secret123" }),
    );

    expect(calls.some((url) => url.includes("/cart/merge"))).toBe(false);
  });
});
