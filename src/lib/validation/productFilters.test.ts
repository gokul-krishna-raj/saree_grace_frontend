import { filtersToSearchParams, parseProductFilters, toApiFilters } from "./productFilters";

describe("productFilters URL round-trip", () => {
  it("parses a full filter combination from the URL", () => {
    const params = new URLSearchParams(
      "category=cat1&fabric=Silk&color=Red&minPrice=1000&maxPrice=9000&handloomOnly=true&sort=price_asc&q=kanjivaram",
    );

    expect(parseProductFilters(params)).toEqual({
      category: "cat1",
      fabric: "Silk",
      color: "Red",
      minPrice: 1000,
      maxPrice: 9000,
      handloomOnly: true,
      sort: "price_asc",
      q: "kanjivaram",
    });
  });

  it("defaults sort to 'newest' and omits unset fields", () => {
    expect(parseProductFilters(new URLSearchParams())).toEqual({
      category: undefined,
      fabric: undefined,
      color: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      handloomOnly: undefined,
      sort: "newest",
      q: undefined,
    });
  });

  it("falls back to 'newest' for an invalid sort value rather than passing it through", () => {
    const params = new URLSearchParams("sort=not-a-real-sort");
    expect(parseProductFilters(params).sort).toBe("newest");
  });

  it("serializes filters back to a URL that round-trips to the same parsed shape", () => {
    const original = parseProductFilters(
      new URLSearchParams("category=cat1&handloomOnly=true&sort=top_rated"),
    );
    const serialized = filtersToSearchParams(original);
    const reparsed = parseProductFilters(serialized);

    expect(reparsed).toEqual(original);
  });

  it("omits sort=newest from the serialized URL since it's the default", () => {
    const params = filtersToSearchParams({ sort: "newest" });
    expect(params.has("sort")).toBe(false);
  });

  it("maps parsed filters onto the shape the products API expects, dropping q", () => {
    const parsed = parseProductFilters(new URLSearchParams("category=cat1&q=silk"));
    expect(toApiFilters(parsed)).toEqual({
      category: "cat1",
      fabric: undefined,
      color: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      handloomOnly: undefined,
      sort: "newest",
    });
  });
});
