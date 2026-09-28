"use client";

import { Search, X } from "lucide-react";
import { type FormEvent, useState } from "react";

import { useProductFilters } from "@/hooks/useProductFilters";

// In-page search on /products. Submits on Enter (one request per search) rather than on every
// keystroke; instant suggestions live in the header's search dialog.
export function SearchBar() {
  const { filters, updateFilters } = useProductFilters();
  const [value, setValue] = useState(filters.q ?? "");
  const [lastQ, setLastQ] = useState(filters.q);

  if (filters.q !== lastQ) {
    setLastQ(filters.q);
    setValue(filters.q ?? "");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    updateFilters({ q: value.trim() || undefined });
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <input
        type="search"
        enterKeyHint="search"
        aria-label="Search sarees"
        placeholder="Search sarees"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="border-input bg-card placeholder:text-muted-foreground focus-visible:ring-ring h-11 w-full rounded-md border pr-10 pl-10 text-base focus-visible:ring-2 focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            updateFilters({ q: undefined });
          }}
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </form>
  );
}
