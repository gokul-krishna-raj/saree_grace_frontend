"use client";

import { Select } from "@/components/ui/Select";
import { useProductFilters } from "@/hooks/useProductFilters";
import type { ProductSort } from "@/types";

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "top_rated", label: "Top rated" },
];

export function SortSelect() {
  const { filters, updateFilters } = useProductFilters();

  return (
    <Select
      aria-label="Sort by"
      value={filters.sort}
      onChange={(event) => updateFilters({ sort: event.target.value as ProductSort })}
      className="w-auto"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
