"use client";

import { Heart, Menu, ShoppingBag, User } from "lucide-react";
import Link from "next/link";

import { useCartCount } from "@/hooks/useCartCount";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCartDrawerOpen, setMobileMenuOpen } from "@/store/slices/uiSlice";

import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/products?handloomOnly=true", label: "Handloom" },
  { href: "/about", label: "Our Story" },
];

export function Header() {
  const dispatch = useAppDispatch();
  const cartCount = useCartCount();
  const authStatus = useAppSelector((state) => state.auth.status);

  return (
    <header className="border-maroon-50 bg-cream/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <button
          type="button"
          onClick={() => dispatch(setMobileMenuOpen(true))}
          aria-label="Open menu"
          className="text-maroon-700 hover:bg-maroon-50 flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        <Link href="/" className="font-heading text-maroon-900 text-xl">
          Saree Grace
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-maroon-700 hover:text-maroon-900 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="text-maroon-700 hover:bg-maroon-50 flex h-11 w-11 items-center justify-center rounded-full"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href={authStatus === "authenticated" ? "/account" : "/login"}
            aria-label="Account"
            className="text-maroon-700 hover:bg-maroon-50 flex h-11 w-11 items-center justify-center rounded-full"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => dispatch(setCartDrawerOpen(true))}
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="text-maroon-700 hover:bg-maroon-50 relative flex h-11 w-11 items-center justify-center rounded-full"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {cartCount > 0 ? (
              <span className="bg-gold-500 absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
      <MobileMenu />
    </header>
  );
}
