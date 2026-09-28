import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { type BreadcrumbItem, BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { cn } from "@/lib/cn";

// Visible breadcrumb trail + matching BreadcrumbList JSON-LD from one list, so the structured
// data always describes exactly what the page shows.
export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <>
      <BreadcrumbJsonLd items={items} />
      <nav aria-label="Breadcrumb" className={cn("py-4", className)}>
        <ol className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs sm:text-[13px]">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li
                key={item.url}
                className={cn("flex items-center gap-1.5", isLast ? "min-w-0" : "shrink-0")}
              >
                {isLast ? (
                  <span aria-current="page" className="text-foreground truncate">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.url} className="hover:text-foreground transition-colors">
                      {item.name}
                    </Link>
                    <ChevronRight className="h-3 w-3 opacity-60" aria-hidden="true" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
