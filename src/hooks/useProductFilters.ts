"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, createElement, type ReactNode, useContext, useMemo } from "react";

import {
  filtersToSearchParams,
  type ParsedProductFilters,
  parseProductFilters,
} from "@/lib/validation/productFilters";

// The listing's URL query, provided once at the top of the listing tree. It exists so the same
// listing can render in two modes:
// - live: params from `useSearchParams()` (`ListingParamsFromUrl`);
// - static: empty params, as the server-rendered Suspense fallback of an ISR page.
// Calling `useSearchParams()` directly in every filter component forced Next to client-render
// the whole listing on ISR category pages — their HTML contained no product cards at all.
export const ListingParamsContext = createContext<URLSearchParams | null>(null);

export function ListingParamsFromUrl({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  return createElement(ListingParamsContext.Provider, { value: searchParams }, children);
}

export function useListingParams(): URLSearchParams {
  const params = useContext(ListingParamsContext);
  if (!params) {
    throw new Error("Listing filters must be rendered inside a ListingParamsContext provider");
  }
  return params;
}

export function useProductFilters() {
  const searchParams = useListingParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => parseProductFilters(searchParams), [searchParams]);

  function setFilters(next: ParsedProductFilters) {
    const query = filtersToSearchParams(next).toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function updateFilters(patch: Partial<ParsedProductFilters>) {
    setFilters({ ...filters, ...patch });
  }

  return { filters, setFilters, updateFilters };
}
