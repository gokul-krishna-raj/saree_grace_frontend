"use client";

import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { useProductFilters } from "@/hooks/useProductFilters";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/formatPrice";
import { splitFilterList, toggleFilterListValue } from "@/lib/validation/productFilters";
import type { Category, FacetOption, Occasion, ProductFacets } from "@/types";

const COLLAPSED_OPTION_COUNT = 10;

// Checkbox list for a catalogue-derived facet (colour/fabric). Only values the backend reports
// for the current filters are listed, each with its real product count — no option can lead to
// an empty grid. Long lists collapse to the most common values.
function FacetList({
  options,
  selected,
  onToggle,
  withSwatch = false,
}: {
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
  withSwatch?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  // Selected values always stay visible, even when they're outside the collapsed top-N.
  const visible = expanded
    ? options
    : options.filter(
        (option, index) => index < COLLAPSED_OPTION_COUNT || selected.includes(option.value),
      );

  return (
    <div>
      <ul className="flex flex-col">
        {visible.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <li key={option.value}>
              <label className="text-foreground flex min-h-10 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(option.value)}
                  className="accent-primary h-4 w-4 shrink-0"
                />
                {withSwatch ? (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 rounded-full border border-black/15"
                    style={{ backgroundColor: option.hex ?? "transparent" }}
                  />
                ) : null}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                <span className="text-muted-foreground text-xs tabular-nums">{option.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {options.length > COLLAPSED_OPTION_COUNT ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="text-foreground mt-1 min-h-10 text-sm underline underline-offset-2"
        >
          {expanded ? "Show fewer" : `Show all ${options.length}`}
        </button>
      ) : null}
    </div>
  );
}

export const PRICE_PRESETS: Array<{ label: string; min?: number; max?: number }> = [
  { label: `Under ${formatPrice(999)}`, max: 999 },
  { label: `${formatPrice(999)} – ${formatPrice(1999)}`, min: 999, max: 1999 },
  { label: `${formatPrice(1999)} – ${formatPrice(2999)}`, min: 1999, max: 2999 },
  { label: `${formatPrice(2999)} – ${formatPrice(4999)}`, min: 2999, max: 4999 },
  { label: `Above ${formatPrice(4999)}`, min: 4999 },
];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <fieldset className="border-border border-b py-4 first:pt-0">
      <legend className="contents">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="text-foreground flex min-h-10 w-full items-center justify-between text-left text-sm font-medium tracking-wide"
        >
          {title}
          <ChevronDown
            className={cn(
              "text-muted-foreground h-4 w-4 transition-transform",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </legend>
      <div className={cn("pt-2", !open && "hidden")}>{children}</div>
    </fieldset>
  );
}

// Filters map 1:1 onto what `GET /products` actually supports (BACKEND_CONTRACT.md): category
// (as navigation to the category page), price range, colour/fabric (options from
// `GET /products/facets`, i.e. values that really exist on active variants), in-stock, and
// occasion when any exist.
export function FilterPanel({
  categories = [],
  occasions = [],
  activeCategorySlug,
  categoriesDefaultOpen = true,
  facets,
}: {
  categories?: Category[];
  occasions?: Occasion[];
  activeCategorySlug?: string;
  categoriesDefaultOpen?: boolean;
  facets?: ProductFacets;
}) {
  const { filters, updateFilters } = useProductFilters();
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? "");
  const [lastApplied, setLastApplied] = useState(`${filters.minPrice}-${filters.maxPrice}`);

  // Keep the inputs in sync when price changes from elsewhere (chip removed, preset chosen).
  const appliedKey = `${filters.minPrice}-${filters.maxPrice}`;
  if (appliedKey !== lastApplied) {
    setLastApplied(appliedKey);
    setMinPrice(filters.minPrice?.toString() ?? "");
    setMaxPrice(filters.maxPrice?.toString() ?? "");
  }

  const activeOccasions = occasions.filter((occasion) => occasion.isActive);

  function applyPrice(event: FormEvent) {
    event.preventDefault();
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    updateFilters({
      minPrice: min !== undefined && Number.isFinite(min) ? min : undefined,
      maxPrice: max !== undefined && Number.isFinite(max) ? max : undefined,
    });
  }

  function toggleOccasion(id: string) {
    const current = filters.occasions ?? [];
    const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
    updateFilters({ occasions: next.length ? next : undefined });
  }

  return (
    <div className="flex flex-col">
      {categories.length > 0 ? (
        <FilterSection title="Category" defaultOpen={categoriesDefaultOpen}>
          <ul className="flex flex-col">
            <li>
              <Link
                href="/products"
                aria-current={!activeCategorySlug ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center justify-between text-sm transition-colors",
                  !activeCategorySlug
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                All sarees
                {!activeCategorySlug ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
              </Link>
            </li>
            {categories.map((category) => {
              const isActive = category.slug === activeCategorySlug;
              return (
                <li key={category._id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center justify-between gap-3 text-sm transition-colors",
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {category.name}
                    {isActive ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </FilterSection>
      ) : null}

      <FilterSection title="Price">
        <ul className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => {
            const isActive = filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <li key={preset.label}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() =>
                    updateFilters(
                      isActive
                        ? { minPrice: undefined, maxPrice: undefined }
                        : { minPrice: preset.min, maxPrice: preset.max },
                    )
                  }
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-full border px-3.5 text-[13px] tabular-nums transition-colors",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground/50",
                  )}
                >
                  {preset.label}
                </button>
              </li>
            );
          })}
        </ul>
        <form onSubmit={applyPrice} className="mt-4 flex items-end gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-muted-foreground text-xs">Min (₹)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="border-input bg-card focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm tabular-nums focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-muted-foreground text-xs">Max (₹)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="border-input bg-card focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm tabular-nums focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>
          <button
            type="submit"
            className="border-foreground/25 hover:bg-foreground hover:text-background h-10 shrink-0 rounded-md border px-3.5 text-sm font-medium transition-colors"
          >
            Apply
          </button>
        </form>
      </FilterSection>

      {facets && facets.colors.length > 1 ? (
        <FilterSection title="Colour">
          <FacetList
            options={facets.colors}
            selected={splitFilterList(filters.color)}
            onToggle={(value) =>
              updateFilters({ color: toggleFilterListValue(filters.color, value) })
            }
            withSwatch
          />
        </FilterSection>
      ) : null}

      {/* A single fabric value isn't a choice — the section appears once the catalogue has at
          least two real fabric values to pick between. */}
      {facets && facets.fabrics.length > 1 ? (
        <FilterSection title="Fabric">
          <FacetList
            options={facets.fabrics}
            selected={splitFilterList(filters.fabric)}
            onToggle={(value) =>
              updateFilters({ fabric: toggleFilterListValue(filters.fabric, value) })
            }
          />
        </FilterSection>
      ) : null}

      <FilterSection title="Availability">
        <label className="text-foreground flex min-h-10 cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={filters.inStockOnly ?? false}
            onChange={(event) => updateFilters({ inStockOnly: event.target.checked || undefined })}
            className="accent-primary h-4 w-4"
          />
          In stock only
        </label>
      </FilterSection>

      {activeOccasions.length > 0 ? (
        <FilterSection title="Occasion">
          <ul className="flex flex-col">
            {activeOccasions.map((occasion) => (
              <li key={occasion._id}>
                <label className="text-foreground flex min-h-10 cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.occasions?.includes(occasion._id) ?? false}
                    onChange={() => toggleOccasion(occasion._id)}
                    className="accent-primary h-4 w-4"
                  />
                  {occasion.name}
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>
      ) : null}
    </div>
  );
}
