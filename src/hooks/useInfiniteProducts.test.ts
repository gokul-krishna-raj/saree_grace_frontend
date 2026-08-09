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
    data: arg.cursor === "cursor-1" ? page2 : page1,
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
});
