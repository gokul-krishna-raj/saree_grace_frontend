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

  return {
    category: searchParams.get("category") ?? undefined,
    occasions: occasionParam ? occasionParam.split(",").filter(Boolean) : undefined,
    fabric: searchParams.get("fabric") ?? undefined,
    color: searchParams.get("color") ?? undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    handloomOnly: searchParams.get("handloomOnly") === "true" ? true : undefined,
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
    sort: filters.sort,
  };
}
