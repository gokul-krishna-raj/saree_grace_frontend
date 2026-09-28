import type { ProductListFilters } from "@/store/api/productsApi";
import type { ProductSort } from "@/types";

const SORT_VALUES: ProductSort[] = ["newest", "price_asc", "price_desc", "top_rated"];

export interface ParsedProductFilters {
  category?: string;
  occasions?: string[];
  fabric?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  handloomOnly?: boolean;
  inStockOnly?: boolean;
  sort: ProductSort;
  q?: string;
}

// The URL query string is the source of truth for active filters (checklist Section 6) —
// this is the one place that reads it into a typed shape and the one place that writes it
// back out, so every component agrees on the same param names/coercion.
export function parseProductFilters(searchParams: URLSearchParams): ParsedProductFilters {
  const sortParam = searchParams.get("sort");
  const sort = SORT_VALUES.includes(sortParam as ProductSort)
    ? (sortParam as ProductSort)
    : "newest";

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const occasionParam = searchParams.get("occasion");
  const toPrice = (value: string | null) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  };

  return {
    category: searchParams.get("category") ?? undefined,
    occasions: occasionParam ? occasionParam.split(",").filter(Boolean) : undefined,
    fabric: searchParams.get("fabric") ?? undefined,
    color: searchParams.get("color") ?? undefined,
    minPrice: toPrice(minPrice),
    maxPrice: toPrice(maxPrice),
    handloomOnly: searchParams.get("handloomOnly") === "true" ? true : undefined,
    inStockOnly: searchParams.get("inStock") === "true" ? true : undefined,
    sort,
    q: searchParams.get("q") ?? undefined,
  };
}

export function filtersToSearchParams(filters: ParsedProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.occasions?.length) params.set("occasion", filters.occasions.join(","));
  if (filters.fabric) params.set("fabric", filters.fabric);
  if (filters.color) params.set("color", filters.color);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.handloomOnly) params.set("handloomOnly", "true");
  if (filters.inStockOnly) params.set("inStock", "true");
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.q) params.set("q", filters.q);
  return params;
}

export function toApiFilters(filters: ParsedProductFilters): ProductListFilters {
  return {
    category: filters.category,
    occasion: filters.occasions?.length ? filters.occasions.join(",") : undefined,
    fabric: filters.fabric,
    color: filters.color,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    handloomOnly: filters.handloomOnly,
    inStockOnly: filters.inStockOnly,
    sort: filters.sort,
  };
}

// `color` / `fabric` hold a comma-separated, case-insensitive list in the URL ("blue,rama green").
export function splitFilterList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export function toggleFilterListValue(
  current: string | undefined,
  value: string,
): string | undefined {
  const list = splitFilterList(current);
  const key = value.trim().toLowerCase();
  const next = list.includes(key) ? list.filter((v) => v !== key) : [...list, key];
  return next.length ? next.join(",") : undefined;
}

// Query params that change which products a listing shows (or their order). Anything else —
// utm_*, gclid, fbclid — is tracking noise that must not trigger noindex or skip server data.
export const LISTING_PARAMS = [
  "q",
  "search",
  "category",
  "occasion",
  "fabric",
  "color",
  "minPrice",
  "maxPrice",
  "handloomOnly",
  "inStock",
  "sort",
  "cursor",
] as const;

export function hasListingParams(keys: Iterable<string>): boolean {
  const known = new Set<string>(LISTING_PARAMS);
  for (const key of keys) if (known.has(key)) return true;
  return false;
}
