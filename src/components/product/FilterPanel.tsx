"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetOccasionsQuery } from "@/store/api/occasionsApi";

export function FilterPanel({ onApplied }: { onApplied?: () => void }) {
  const { filters, updateFilters, setFilters } = useProductFilters();
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: occasions } = useGetOccasionsQuery();
  const activeOccasions = occasions?.filter((occasion) => occasion.isActive) ?? [];

  const [fabric, setFabric] = useState(filters.fabric ?? "");
  const [color, setColor] = useState(filters.color ?? "");
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? "");

  const debouncedFabric = useDebouncedValue(fabric);
  const debouncedColor = useDebouncedValue(color);
  const debouncedMinPrice = useDebouncedValue(minPrice);
  const debouncedMaxPrice = useDebouncedValue(maxPrice);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    updateFilters({
      fabric: debouncedFabric || undefined,
      color: debouncedColor || undefined,
      minPrice: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
      maxPrice: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFabric, debouncedColor, debouncedMinPrice, debouncedMaxPrice]);

  function clearAll() {
    setFabric("");
    setColor("");
    setMinPrice("");
    setMaxPrice("");
    setFilters({ sort: filters.sort });
    onApplied?.();
  }

  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Category"
        value={filters.category ?? ""}
        onChange={(event) => updateFilters({ category: event.target.value || undefined })}
      >
        <option value="">All categories</option>
        {categories?.map((category) => (
          // Must be the category's ObjectId, not its slug — the backend's list-filter
          // validator requires an ObjectId (BACKEND_CONTRACT.md).
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Input
        label="Fabric"
        placeholder="e.g. Cotton, Silk"
        value={fabric}
        onChange={(event) => setFabric(event.target.value)}
      />
      <Input
        label="Colour"
        placeholder="e.g. Blue, Red"
        value={color}
        onChange={(event) => setColor(event.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Min price"
          type="number"
          inputMode="numeric"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
        />
        <Input
          label="Max price"
          type="number"
          inputMode="numeric"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
        />
      </div>
      {/* <label className="text-maroon-800 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.handloomOnly ?? false}
          onChange={(event) => updateFilters({ handloomOnly: event.target.checked || undefined })}
          className="border-maroon-200 text-maroon-700 focus-visible:outline-maroon-600 h-5 w-5 rounded focus-visible:outline-2"
        />
        Handloom only
      </label> */}
      {activeOccasions.length > 0 ? (
        <CheckboxGroup
          label="Occasion"
          options={activeOccasions.map((occasion) => ({
            value: occasion._id,
            label: occasion.name,
          }))}
          value={filters.occasions ?? []}
          onChange={(next) => updateFilters({ occasions: next.length ? next : undefined })}
        />
      ) : null}
      <Button variant="ghost" onClick={clearAll}>
        Clear filters
      </Button>
      {onApplied ? (
        <Button variant="primary" onClick={onApplied}>
          Show results
        </Button>
      ) : null}
    </div>
  );
}
