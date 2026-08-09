"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

import { cn } from "@/lib/cn";

// Collapsible on mobile (tap the heading to expand), always expanded from `sm:` up — the
// `sm:flex` override always wins at that breakpoint regardless of local `open` state, so
// desktop never needs its own code path.
export function FooterAccordionSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-maroon-50 border-b py-4 sm:border-none sm:py-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="text-maroon-900 flex w-full items-center justify-between text-sm font-medium sm:pointer-events-none sm:mb-3"
      >
        {title}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform sm:hidden", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <nav
        aria-label={title}
        className={cn("mt-3 flex-col gap-2 sm:mt-0 sm:flex", open ? "flex" : "hidden")}
      >
        {children}
      </nav>
    </div>
  );
}
