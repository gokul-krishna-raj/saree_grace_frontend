import {
  filtersToSearchParams,
  hasListingParams,
  parseProductFilters,
  splitFilterList,
  toApiFilters,
  toggleFilterListValue,
} from "./productFilters";

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
      occasion: undefined,
      fabric: undefined,
      color: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      handloomOnly: undefined,
      sort: "newest",
    });
  });

  it("parses a comma-separated occasion param into multiple occasion ids", () => {
    const params = new URLSearchParams("occasion=occ1,occ2");
    expect(parseProductFilters(params).occasions).toEqual(["occ1", "occ2"]);
  });

  it("serializes multiple selected occasions back into a single comma-separated param", () => {
    const params = filtersToSearchParams({ occasions: ["occ1", "occ2"], sort: "newest" });
    expect(params.get("occasion")).toBe("occ1,occ2");
  });

  it("round-trips a multi-occasion selection through parse -> serialize -> parse", () => {
    const original = parseProductFilters(new URLSearchParams("occasion=occ1,occ2&sort=newest"));
    const reparsed = parseProductFilters(filtersToSearchParams(original));
    expect(reparsed).toEqual(original);
  });

  it("joins selected occasions into a single comma-separated string for the products API", () => {
    const parsed = parseProductFilters(new URLSearchParams("occasion=occ1,occ2"));
    expect(toApiFilters(parsed).occasion).toBe("occ1,occ2");
  });
});

describe("colour/fabric filter lists and listing params", () => {
  it("toggles values in a comma-separated, case-insensitive list", () => {
    expect(toggleFilterListValue(undefined, "Rama Green")).toBe("rama green");
    expect(toggleFilterListValue("rama green", "Pink")).toBe("rama green,pink");
    expect(toggleFilterListValue("rama green,pink", "RAMA GREEN")).toBe("pink");
    expect(toggleFilterListValue("pink", "pink")).toBeUndefined();
    expect(splitFilterList(" Blue , ,pink ")).toEqual(["blue", "pink"]);
  });

  it("treats tracking params as noise but real filters as listing params", () => {
    expect(hasListingParams(["utm_source", "gclid", "fbclid"])).toBe(false);
    expect(hasListingParams(["utm_source", "sort"])).toBe(true);
    expect(hasListingParams(new URLSearchParams("search=silk").keys())).toBe(true);
  });
});
