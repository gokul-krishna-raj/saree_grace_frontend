"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
];

// A simple horizontal tab strip, not a desktop sidebar squeezed onto mobile — the account area
// only has two destinations right now, so this is proportionate; revisit as a bottom sheet if
// the account area grows more sections (checklist Section 13 mobile pass).
export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="border-maroon-50 mb-6 flex gap-2 border-b">
      {LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-11 items-center border-b-2 px-3 text-sm font-medium",
              isActive
                ? "border-maroon-700 text-maroon-900"
                : "text-maroon-500 hover:text-maroon-800 border-transparent",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
