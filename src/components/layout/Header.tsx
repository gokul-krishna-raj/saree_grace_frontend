"use client";

import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useCartCount } from "@/hooks/useCartCount";
import { useWishlistCount } from "@/hooks/useWishlistCount";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCartDrawerOpen, setMobileMenuOpen } from "@/store/slices/uiSlice";
import type { Category } from "@/types";

import { CategoriesMenu } from "./CategoriesMenu";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

export const NAV_LINKS = [
  { href: "/products", label: "Shop All" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

const iconButtonClass =
  "text-foreground/80 hover:text-foreground hover:bg-muted relative flex h-11 w-11 items-center justify-center rounded-full transition-colors";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      key={count}
      className="bg-primary text-primary-foreground animate-pop absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums"
      aria-hidden="true"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header({ categories = [] }: { categories?: Category[] }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const authStatus = useAppSelector((state) => state.auth.status);
  const mobileMenuOpen = useAppSelector((state) => state.ui.mobileMenuOpen);
  const [searchOpen, setSearchOpen] = useState(false);
  const topLevelCategories = categories.filter((category) => category.parentCategory === null);
  const accountHref = authStatus === "authenticated" ? "/account" : "/login";

  return (
    <header className="border-border bg-background sticky top-0 z-40 border-b">
      <div className="container-page grid h-14 grid-cols-[1fr_auto_1fr] items-center lg:h-[72px]">
        {/* Left — mobile: menu + search · desktop: primary navigation */}
        <div className="flex items-center gap-1 lg:gap-0">
          <button
            type="button"
            onClick={() => dispatch(setMobileMenuOpen(true))}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            className={cn(iconButtonClass, "-ml-2.5 lg:hidden")}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-haspopup="dialog"
            className={cn(iconButtonClass, "lg:hidden")}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            <Link
              href="/products"
              aria-current={pathname === "/products" ? "page" : undefined}
              className="link-underline text-foreground py-1 text-[13px] font-medium tracking-wide"
            >
              Shop All
            </Link>
            <CategoriesMenu categories={topLevelCategories} />
            {NAV_LINKS.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className="link-underline text-foreground py-1 text-[13px] font-medium tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Centre — wordmark */}
        <Link
          href="/"
          className="font-display text-primary flex min-h-11 items-center px-2 text-[1.375rem] leading-none tracking-tight whitespace-nowrap lg:text-[1.75rem]"
        >
          Saree Grace
        </Link>

        {/* Right — search (desktop), account, wishlist, cart */}
        <div className="flex items-center justify-end gap-0.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-haspopup="dialog"
            className="border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground mr-2 hidden h-10 w-56 items-center gap-2.5 rounded-full border px-4 text-sm transition-colors lg:flex"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Search sarees</span>
          </button>
          <Link
            href={accountHref}
            aria-label="Account"
            className={cn(iconButtonClass, "hidden lg:flex")}
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? "" : "s"}`}
            className={iconButtonClass}
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            <CountBadge count={wishlistCount} />
          </Link>
          <button
            type="button"
            onClick={() => dispatch(setCartDrawerOpen(true))}
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className={cn(iconButtonClass, "-mr-2.5 lg:mr-0")}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <CountBadge count={cartCount} />
          </button>
        </div>
      </div>
      <MobileMenu categories={topLevelCategories} />
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        categories={topLevelCategories}
      />
    </header>
  );
}
