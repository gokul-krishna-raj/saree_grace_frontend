import { skipToken } from "@reduxjs/toolkit/query/react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ParsedProductFilters } from "@/lib/validation/productFilters";
import { toApiFilters } from "@/lib/validation/productFilters";
import { useGetProductsQuery, useSearchProductsQuery } from "@/store/api/productsApi";
import type { Product } from "@/types";

const PAGE_SIZE = 12;

// RTK Query caches each distinct (filters, cursor) pair as its own entry — it doesn't merge
// pages into one growing list on its own. This hook does that merging, deduping by _id so a
// page that overlaps (or a re-fetch of the same cursor) never produces a duplicate card.
//
// Callers should render this behind `key={filtersKey}` (see ProductGrid) rather than resetting
// state internally on filter change — remounting via `key` is the idiomatic React way to reset
// all of a component's state when its identity changes, instead of an effect that watches for
// prop changes and calls setState.
export function useInfiniteProducts(filters: ParsedProductFilters, initialItems?: Product[]) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<Product[]>(initialItems ?? []);
  const seenIds = useRef<Set<string>>(new Set(initialItems ? initialItems.map((p) => p._id) : []));

  const isSearch = Boolean(filters.q);

  const listResult = useGetProductsQuery(
    isSearch ? skipToken : { ...toApiFilters(filters), cursor, limit: PAGE_SIZE },
  );
  const searchResult = useSearchProductsQuery(
    isSearch ? { q: filters.q!, cursor, limit: PAGE_SIZE } : skipToken,
  );

  const { data, isLoading, isFetching, isError, refetch } = isSearch ? searchResult : listResult;

  useEffect(() => {
    if (!data) return;
    const fresh = data.products.filter((product) => !seenIds.current.has(product._id));
    if (fresh.length === 0) return;
    fresh.forEach((product) => seenIds.current.add(product._id));
    setItems((prev) => [...prev, ...fresh]);
  }, [data]);

  const hasMore = data ? data.nextCursor !== null : true;

  const loadMore = useCallback(() => {
    if (!isFetching && data?.nextCursor) setCursor(data.nextCursor);
  }, [isFetching, data]);

  return {
    items,
    isLoading: isLoading && items.length === 0,
    isFetchingMore: isFetching && items.length > 0,
    isError,
    isFetching,
    hasMore,
    loadMore,
    refetch,
  };
}
