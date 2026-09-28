import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

const getCartQueryMock = jest.fn(() => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: jest.fn(),
}));

jest.mock("@/store/api/cartApi", () => ({
  useGetCartQuery: () => getCartQueryMock(),
  useUpdateCartItemMutation: () => [jest.fn(), { isLoading: false }],
  useRemoveCartItemMutation: () => [jest.fn(), { isLoading: false }],
}));

import { makeStore } from "@/store";
import { accessTokenSet } from "@/store/slices/authSlice";
import { guestItemAdded } from "@/store/slices/guestCartSlice";

import { useCart } from "./useCart";

const lineA = {
  productId: "p1",
  variantId: null,
  qty: 2,
  nameSnapshot: "Handloom Cotton Saree",
  priceSnapshot: 400,
};
const lineB = {
  productId: "p2",
  variantId: null,
  qty: 1,
  nameSnapshot: "Kanjivaram Silk Saree",
  priceSnapshot: 7999,
};

describe("useCart totals (guest path)", () => {
  it("computes itemsTotal as the exact sum of price * qty across all lines", () => {
    const store = makeStore();
    store.dispatch(guestItemAdded(lineA));
    store.dispatch(guestItemAdded(lineB));

    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    const expectedItemsTotal = 400 * 2 + 7999 * 1;
    expect(result.current.itemsTotal).toBe(expectedItemsTotal);
    expect(result.current.total).toBe(expectedItemsTotal);
  });

  it("defers shipping to checkout instead of guessing a fee (it depends on the delivery state)", () => {
    const store = makeStore();
    store.dispatch(guestItemAdded({ ...lineA, priceSnapshot: 400, qty: 1 }));
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    expect(result.current.shippingFee).toBeNull();
    expect(result.current.total).toBe(400);
  });

  it("recomputes totals correctly after updateQty and removeItem", () => {
    const store = makeStore();
    store.dispatch(guestItemAdded(lineA));
    store.dispatch(guestItemAdded(lineB));

    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      result.current.updateQty(result.current.lines[0], 5);
    });
    expect(result.current.lines[0].qty).toBe(5);
    expect(result.current.itemsTotal).toBe(400 * 5 + 7999 * 1);

    act(() => {
      result.current.removeItem(result.current.lines[1]);
    });
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.itemsTotal).toBe(400 * 5);
  });

  it("reflects a qty update made through one consumer (e.g. the drawer) in another consumer reading the same store (e.g. the full page)", () => {
    const store = makeStore();
    store.dispatch(guestItemAdded(lineA));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const drawer = renderHook(() => useCart(), { wrapper });
    const page = renderHook(() => useCart(), { wrapper });

    act(() => {
      drawer.result.current.updateQty(drawer.result.current.lines[0], 9);
    });

    expect(page.result.current.lines[0].qty).toBe(9);
    expect(page.result.current.itemsTotal).toBe(400 * 9);
  });
});

describe("useCart (authenticated, server cart load error)", () => {
  afterEach(() => {
    getCartQueryMock.mockClear();
  });

  it("reports isError, not isEmpty, when the server cart fails to load — a failed fetch must never look like a real empty cart", () => {
    getCartQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: jest.fn(),
    });

    const store = makeStore();
    store.dispatch(accessTokenSet({ accessToken: "token" }));

    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });
});
