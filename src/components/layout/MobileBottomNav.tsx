"use client";

import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCartCount } from "@/hooks/useCartCount";
import { useWishlistCount } from "@/hooks/useWishlistCount";
import { cn } from "@/lib/cn";
import { useAppSelector } from "@/store/hooks";

// Explicit checklist requirement (Section 13), distinct from the header's cart icon (Section
// 5/8) — a tab bar is a navigation destination model (tapping "Cart" goes to the cart page),
// while the header icon is a quick-glance action (opens the drawer) — different affordances
// for the same underlying data, not a duplicate.
export function MobileBottomNav() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const authStatus = useAppSelector((state) => state.auth.status);

  // The admin area is desktop-first by design (checklist Section 12) and has its own nav
  // (AdminNav) — this customer-facing tab bar would just be visual noise there.
  if (pathname.startsWith("/admin")) return null;

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop", icon: LayoutGrid },
    { href: "/wishlist", label: "Wishlist", icon: Heart, count: wishlistCount },
    { href: "/cart", label: "Cart", icon: ShoppingBag, count: cartCount },
    { href: authStatus === "authenticated" ? "/account" : "/login", label: "Account", icon: User },
  ];

  return (
    <nav
      aria-label="Primary"
      className="border-maroon-100 fixed inset-x-0 bottom-0 z-30 flex border-t bg-white lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ href, label, icon: Icon, count }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs",
              isActive ? "text-maroon-900" : "text-maroon-400",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
            {count && count > 0 ? (
              <span className="bg-gold-500 absolute top-1 right-1/4 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
