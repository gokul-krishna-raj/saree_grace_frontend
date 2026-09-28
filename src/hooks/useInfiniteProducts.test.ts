import { act, renderHook } from "@testing-library/react";

const page1 = {
  products: [
    { _id: "p1", name: "Kanjivaram Silk Saree" },
    { _id: "p2", name: "Handloom Cotton Saree" },
  ],
  nextCursor: "cursor-1",
};

// Page 2 deliberately overlaps with page 1 on "p2" to exercise the dedupe logic — a cursor
// re-fetch or an off-by-one on the backend could plausibly return an overlapping boundary item.
const page2 = {
  products: [
    { _id: "p2", name: "Handloom Cotton Saree" },
    { _id: "p3", name: "Banarasi Silk Saree" },
  ],
  nextCursor: null,
};

const useGetProductsQueryMock = jest.fn(
  (arg: {
    cursor?: string;
  }): {
    data: typeof page1 | typeof page2 | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  } => ({
    // Like RTK Query: a skipped query (skipToken — not an object) has no data.
    data: typeof arg !== "object" ? undefined : arg.cursor === "cursor-1" ? page2 : page1,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: jest.fn(),
  }),
);

jest.mock("@/store/api/productsApi", () => ({
  useGetProductsQuery: (arg: { cursor?: string }) => useGetProductsQueryMock(arg),
  useSearchProductsQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
  }),
}));

import type { Product } from "@/types";

import { useInfiniteProducts } from "./useInfiniteProducts";

describe("useInfiniteProducts", () => {
  it("loads the next page on loadMore and dedupes overlapping items", () => {
    const { result } = renderHook(() => useInfiniteProducts({ sort: "newest" }));

    expect(result.current.items.map((p) => p._id)).toEqual(["p1", "p2"]);
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.items.map((p) => p._id)).toEqual(["p1", "p2", "p3"]);
    expect(result.current.hasMore).toBe(false);
  });

  it("does not call loadMore's fetch again once hasMore is false", () => {
    const { result } = renderHook(() => useInfiniteProducts({ sort: "newest" }));

    act(() => {
      result.current.loadMore();
    });
    const callsAfterFirstLoadMore = useGetProductsQueryMock.mock.calls.length;

    act(() => {
      result.current.loadMore();
    });

    expect(useGetProductsQueryMock.mock.calls.length).toBe(callsAfterFirstLoadMore);
  });

  it("surfaces a failed fetch as isError with a working refetch, rather than an empty result set", () => {
    const refetchMock = jest.fn();
    useGetProductsQueryMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: refetchMock,
    });

    const { result } = renderHook(() => useInfiniteProducts({ sort: "newest" }));

    expect(result.current.items).toHaveLength(0);
    expect(result.current.isError).toBe(true);

    result.current.refetch();
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("initializes immediately with initialItems to support SSR pre-rendering", () => {
    const initial = [
      { _id: "init1", name: "Soft Silk Saree" } as unknown as Product,
      { _id: "init2", name: "Pure Cotton Saree" } as unknown as Product,
    ];
    const { result } = renderHook(() => useInfiniteProducts({ sort: "newest" }, initial));

    expect(result.current.items.map((p) => p._id)).toContain("init1");
    expect(result.current.items.map((p) => p._id)).toContain("init2");
  });

  it("continues from a server-rendered first page without re-requesting it", () => {
    useGetProductsQueryMock.mockClear();
    const initial = [{ _id: "init1", name: "Soft Silk Saree" } as unknown as Product];
    const { result } = renderHook(() =>
      useInfiniteProducts({ sort: "newest" }, initial, "cursor-1"),
    );

    // First page came from the server: the list query is only ever skipped (skipToken).
    expect(useGetProductsQueryMock.mock.calls.every(([arg]) => typeof arg !== "object")).toBe(true);
    expect(result.current.items.map((p) => p._id)).toEqual(["init1"]);
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    expect(useGetProductsQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: "cursor-1" }),
    );
    expect(result.current.items.map((p) => p._id)).toEqual(["init1", "p2", "p3"]);
  });

  it("reports no more pages when the server page was the last one", () => {
    const initial = [{ _id: "init1", name: "Soft Silk Saree" } as unknown as Product];
    const { result } = renderHook(() => useInfiniteProducts({ sort: "newest" }, initial, null));
    expect(result.current.hasMore).toBe(false);
  });
});
