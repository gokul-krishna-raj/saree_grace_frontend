"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  filtersToSearchParams,
  type ParsedProductFilters,
  parseProductFilters,
} from "@/lib/validation/productFilters";

export function useProductFilters() {
  const searchParams = useSearchParams();
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
