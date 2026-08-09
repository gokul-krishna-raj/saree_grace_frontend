"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/occasions", label: "Occasions" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reviews", label: "Reviews" },
];

// Desktop-first per the checklist's explicit allowance for the admin area — a left sidebar on
// larger screens, a horizontal scrollable strip on smaller ones so core actions (approve a
// review, update an order status) still work on a tablet, per the same checklist item.
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-maroon-100 flex gap-1 overflow-x-auto border-b bg-white px-4 py-2 lg:w-56 lg:flex-col lg:border-r lg:border-b-0 lg:px-3 lg:py-6">
      {LINKS.map((link) => {
        const isActive =
          link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-11 shrink-0 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap",
              isActive ? "bg-maroon-700 text-white" : "text-maroon-700 hover:bg-maroon-50",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
