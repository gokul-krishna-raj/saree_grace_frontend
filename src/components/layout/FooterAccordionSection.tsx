"use client";

import { Plus } from "lucide-react";
import { type ReactNode, useId, useState } from "react";

import { cn } from "@/lib/cn";

// Collapsible on mobile (tap the heading to expand), always expanded from `md:` up. Links stay in
// the DOM while collapsed (only visually hidden with `hidden`), so crawlers still see them.
export function FooterAccordionSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="border-b border-white/10 md:border-none">
      <h2 className="text-sm">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex min-h-14 w-full items-center justify-between text-left font-medium tracking-wide text-white md:pointer-events-none md:mb-4 md:min-h-0"
        >
          {title}
          <Plus
            className={cn(
              "h-4 w-4 transition-transform duration-200 md:hidden",
              open && "rotate-45",
            )}
            aria-hidden="true"
          />
        </button>
      </h2>
      <nav
        id={contentId}
        aria-label={title}
        className={cn("flex-col gap-3 pb-5 md:flex md:pb-0", open ? "flex" : "hidden")}
      >
        {children}
      </nav>
    </div>
  );
}
