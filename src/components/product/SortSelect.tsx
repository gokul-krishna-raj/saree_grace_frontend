"use client";

import { ChevronDown } from "lucide-react";

import { useProductFilters } from "@/hooks/useProductFilters";
import type { ProductSort } from "@/types";

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "top_rated", label: "Top rated" },
];

// Native <select>: the platform picker is the fastest, most accessible control on phones.
export function SortSelect() {
  const { filters, updateFilters } = useProductFilters();

  return (
    <label className="border-border text-foreground relative flex h-11 items-center rounded-md border text-sm lg:border-transparent">
      <span className="sr-only">Sort by</span>
      <span className="text-muted-foreground hidden pl-3 lg:inline" aria-hidden="true">
        Sort:
      </span>
      <select
        value={filters.sort}
        onChange={(event) => updateFilters({ sort: event.target.value as ProductSort })}
        className="h-full w-full cursor-pointer appearance-none bg-transparent pr-9 pl-3 font-medium outline-none lg:w-auto lg:pl-1.5"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="text-muted-foreground pointer-events-none absolute right-3 h-4 w-4"
        aria-hidden="true"
      />
    </label>
  );
}
