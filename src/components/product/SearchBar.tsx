"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/Input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useProductFilters } from "@/hooks/useProductFilters";

export function SearchBar() {
  const { filters, updateFilters } = useProductFilters();
  const [value, setValue] = useState(filters.q ?? "");
  const debounced = useDebouncedValue(value, 400);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    updateFilters({ q: debounced || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative px-4">
      <Search
        className="text-maroon-400 pointer-events-none absolute top-1/2 left-7 h-4 w-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        aria-label="Search sarees"
        placeholder="Search sarees, fabric, colour..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="pl-10"
      />
    </div>
  );
}
