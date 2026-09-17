"use client";

import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCartCount } from "@/hooks/useCartCount";
import { useWishlistCount } from "@/hooks/useWishlistCount";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCartDrawerOpen, setMobileMenuOpen } from "@/store/slices/uiSlice";

import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const dispatch = useAppDispatch();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const authStatus = useAppSelector((state) => state.auth.status);
  const mobileMenuOpen = useAppSelector((state) => state.ui.mobileMenuOpen);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="border-border bg-card/95 sticky top-0 z-40 border-b backdrop-blur-md">
      {/* <div className="bg-gradient-maroon text-primary-foreground px-4 py-2 text-center text-xs font-medium tracking-wide sm:text-sm">
        Authentic Elampillai Handloom Sarees Direct From Master Weavers · Free Shipping Across India
      </div> */}
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
        <div className="flex w-11 items-center justify-start lg:hidden">
          <button
            type="button"
            onClick={() => dispatch(setMobileMenuOpen(true))}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            className="text-foreground/80 hover:bg-muted hover:text-primary focus-visible:outline-ring flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <Link
          href="/"
          className="font-display text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold tracking-tight lg:static lg:top-auto lg:translate-x-0 lg:-translate-y-0 lg:text-2xl"
        >
          Saree Grace
        </Link>

        <nav className="hidden flex-1 justify-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-underline text-foreground/80 hover:text-primary py-1 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex w-11 items-center justify-end lg:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            aria-expanded={searchOpen}
            aria-controls="search-dialog"
            className="text-foreground/80 hover:bg-muted hover:text-primary focus-visible:outline-ring flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden items-center gap-1 lg:ml-auto lg:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            aria-expanded={searchOpen}
            aria-controls="search-dialog"
            className="text-foreground/80 hover:bg-muted hover:text-primary focus-visible:outline-ring flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? "" : "s"}`}
            className="text-foreground/80 hover:bg-muted hover:text-primary focus-visible:outline-ring relative flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            {wishlistCount > 0 ? (
              <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold shadow-xs">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => dispatch(setCartDrawerOpen(true))}
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="text-foreground/80 hover:bg-muted hover:text-primary focus-visible:outline-ring relative flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {cartCount > 0 ? (
              <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold shadow-xs">
                {cartCount}
              </span>
            ) : null}
          </button>
          <Link
            href={authStatus === "authenticated" ? "/account" : "/login"}
            aria-label="Account"
            className="text-foreground/80 hover:bg-muted hover:text-primary focus-visible:outline-ring flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <MobileMenu />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
