"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { FilterPanel } from "@/components/product/FilterPanel";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { useProductFilters } from "@/hooks/useProductFilters";
import { splitFilterList } from "@/lib/validation/productFilters";
import type { Category, Occasion, ProductFacets } from "@/types";

export function countActiveFilters(filters: ReturnType<typeof useProductFilters>["filters"]) {
  return (
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.occasions?.length ?? 0) +
    splitFilterList(filters.fabric).length +
    splitFilterList(filters.color).length +
    (filters.handloomOnly ? 1 : 0)
  );
}

// Phones/tablets: filters open in a bottom sheet (thumb-reachable, keeps the grid in context)
// instead of a squeezed sidebar. Changes apply as they're made; the footer just closes the sheet.
export function FilterDrawer({
  categories,
  occasions,
  activeCategorySlug,
  facets,
}: {
  categories?: Category[];
  occasions?: Occasion[];
  activeCategorySlug?: string;
  facets?: ProductFacets;
}) {
  const [open, setOpen] = useState(false);
  const { filters, setFilters } = useProductFilters();
  const activeCount = countActiveFilters(filters);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-border text-foreground flex h-11 w-full items-center justify-center gap-2 rounded-md border text-sm font-medium"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filter
        {activeCount > 0 ? (
          <span className="bg-foreground text-background flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums">
            {activeCount}
          </span>
        ) : null}
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filter"
        side="bottom"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setFilters({ sort: filters.sort, q: filters.q })}
              disabled={activeCount === 0}
            >
              Clear all
            </Button>
            <Button onClick={() => setOpen(false)}>Show results</Button>
          </div>
        }
      >
        <FilterPanel
          categories={categories}
          occasions={occasions}
          activeCategorySlug={activeCategorySlug}
          categoriesDefaultOpen={false}
          facets={facets}
        />
      </Drawer>
    </div>
  );
}
