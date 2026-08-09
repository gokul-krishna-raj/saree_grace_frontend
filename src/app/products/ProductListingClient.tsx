"use client";

import { useSearchParams } from "next/navigation";

import { FilterDrawer } from "@/components/product/FilterDrawer";
import { FilterPanel } from "@/components/product/FilterPanel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchBar } from "@/components/product/SearchBar";
import { SortSelect } from "@/components/product/SortSelect";
import { parseProductFilters } from "@/lib/validation/productFilters";

export function ProductListingClient() {
  const searchParams = useSearchParams();
  const filters = parseProductFilters(searchParams);
  // Remount the grid+its infinite-scroll state whenever the filter set changes, instead of
  // reconciling it internally — see useInfiniteProducts.ts for why.
  const filtersKey = JSON.stringify(filters);

  return (
    <div className="flex flex-col gap-4">
      <SearchBar />
      <div className="flex items-center justify-between gap-3 px-4">
        <FilterDrawer />
        <div className="ml-auto">
          <SortSelect />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden pl-4 lg:block">
          <FilterPanel />
        </aside>
        <ProductGrid key={filtersKey} filters={filters} />
      </div>
    </div>
  );
}
