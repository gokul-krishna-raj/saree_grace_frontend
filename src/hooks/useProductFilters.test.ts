import { renderHook } from "@testing-library/react";

const replaceMock = jest.fn();
let currentSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/products",
  useSearchParams: () => currentSearchParams,
}));

import { ListingParamsFromUrl, useProductFilters } from "./useProductFilters";

// The hook reads the URL through the listing's params provider (fed by useSearchParams).
const wrapper = ListingParamsFromUrl;

describe("useProductFilters", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    currentSearchParams = new URLSearchParams();
  });

  it("writes a single filter change to the URL, preserving other active filters", () => {
    currentSearchParams = new URLSearchParams("sort=price_asc&handloomOnly=true");
    const { result } = renderHook(() => useProductFilters(), { wrapper });

    result.current.updateFilters({ fabric: "Silk" });

    expect(replaceMock).toHaveBeenCalledWith(
      "/products?fabric=Silk&handloomOnly=true&sort=price_asc",
      { scroll: false },
    );
  });

  it("writes a filter combination (category + price range + handloom) to the URL at once", () => {
    const { result } = renderHook(() => useProductFilters(), { wrapper });

    result.current.updateFilters({
      category: "cat1",
      minPrice: 1000,
      maxPrice: 5000,
      handloomOnly: true,
    });

    const [url] = replaceMock.mock.calls[0];
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("category")).toBe("cat1");
    expect(params.get("minPrice")).toBe("1000");
    expect(params.get("maxPrice")).toBe("5000");
    expect(params.get("handloomOnly")).toBe("true");
  });

  it("writes a multi-occasion selection to the URL as a single comma-separated param", () => {
    const { result } = renderHook(() => useProductFilters(), { wrapper });

    result.current.updateFilters({ occasions: ["occ1", "occ2"] });

    const [url] = replaceMock.mock.calls[0];
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("occasion")).toBe("occ1,occ2");
  });

  it("navigates to the bare path when all filters are cleared", () => {
    currentSearchParams = new URLSearchParams("fabric=Silk");
    const { result } = renderHook(() => useProductFilters(), { wrapper });

    result.current.setFilters({ sort: "newest" });

    expect(replaceMock).toHaveBeenCalledWith("/products", { scroll: false });
  });
});
