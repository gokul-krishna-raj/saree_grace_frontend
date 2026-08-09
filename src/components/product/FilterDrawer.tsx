"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { FilterPanel } from "@/components/product/FilterPanel";
import { Drawer } from "@/components/ui/Drawer";

// Mobile-only bottom-sheet trigger — the same filters are rendered inline as a sidebar on
// desktop (see ProductListingClient) instead of this drawer, per the checklist's explicit
// "drawer/bottom-sheet on mobile, not a squeezed sidebar" guidance.
export function FilterDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-maroon-100 text-maroon-800 flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filters
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Filters" side="bottom">
        <FilterPanel onApplied={() => setOpen(false)} />
      </Drawer>
    </div>
  );
}
