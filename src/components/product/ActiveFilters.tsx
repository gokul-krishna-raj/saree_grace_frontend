"use client";

import { X } from "lucide-react";

import { useProductFilters } from "@/hooks/useProductFilters";
import { formatPrice } from "@/lib/formatPrice";
import {
  type ParsedProductFilters,
  splitFilterList,
  toggleFilterListValue,
} from "@/lib/validation/productFilters";
import type { Occasion, ProductFacets } from "@/types";

interface Chip {
  key: string;
  label: string;
  clear: Partial<ParsedProductFilters>;
}

function priceLabel(min?: number, max?: number) {
  if (min !== undefined && max !== undefined) return `${formatPrice(min)} – ${formatPrice(max)}`;
  if (min !== undefined) return `From ${formatPrice(min)}`;
  return `Up to ${formatPrice(max ?? 0)}`;
}

// Removable chips for every active filter — shoppers can see (and undo) what's narrowing the
// grid without reopening the filter panel.
export function ActiveFilters({
  occasions = [],
  facets,
}: {
  occasions?: Occasion[];
  facets?: ProductFacets;
}) {
  const { filters, updateFilters, setFilters } = useProductFilters();

  const chips: Chip[] = [];
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”`, clear: { q: undefined } });
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    chips.push({
      key: "price",
      label: priceLabel(filters.minPrice, filters.maxPrice),
      clear: { minPrice: undefined, maxPrice: undefined },
    });
  }
  if (filters.inStockOnly)
    chips.push({ key: "stock", label: "In stock", clear: { inStockOnly: undefined } });
  for (const id of filters.occasions ?? []) {
    const name = occasions.find((occasion) => occasion._id === id)?.name ?? "Occasion";
    chips.push({
      key: `occ-${id}`,
      label: name,
      clear: {
        occasions: filters.occasions?.filter((v) => v !== id).length
          ? filters.occasions?.filter((v) => v !== id)
          : undefined,
      },
    });
  }
  for (const value of splitFilterList(filters.color)) {
    chips.push({
      key: `color-${value}`,
      label: facets?.colors.find((option) => option.value === value)?.label ?? value,
      clear: { color: toggleFilterListValue(filters.color, value) },
    });
  }
  for (const value of splitFilterList(filters.fabric)) {
    chips.push({
      key: `fabric-${value}`,
      label: facets?.fabrics.find((option) => option.value === value)?.label ?? value,
      clear: { fabric: toggleFilterListValue(filters.fabric, value) },
    });
  }
  if (filters.handloomOnly)
    chips.push({ key: "handloom", label: "Handloom", clear: { handloomOnly: undefined } });

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => updateFilters(chip.clear)}
          className="bg-muted text-foreground hover:bg-cream-dark inline-flex h-9 items-center gap-1.5 rounded-full pr-2.5 pl-3.5 text-[13px] transition-colors"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      {chips.length > 1 ? (
        <button
          type="button"
          onClick={() => setFilters({ sort: filters.sort })}
          className="text-muted-foreground hover:text-foreground ml-1 text-[13px] underline underline-offset-2"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
