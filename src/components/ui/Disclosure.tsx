import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

// Native <details>/<summary> accordion: keyboard and screen-reader support for free, content is
// in the HTML for crawlers, and it works before (or without) hydration.
export function Disclosure({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={cn("group border-border border-b", className)}>
      <summary className="text-foreground flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
        {/* A real heading keeps the page outline intact (h1 → h2 section → h3 inside it). */}
        <h2 className="font-body text-[15px] font-medium">{title}</h2>
        <Plus
          className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
          aria-hidden="true"
        />
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}
