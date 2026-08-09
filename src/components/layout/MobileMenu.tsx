"use client";

import Link from "next/link";

import { Drawer } from "@/components/ui/Drawer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileMenuOpen } from "@/store/slices/uiSlice";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu() {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const open = useAppSelector((state) => state.ui.mobileMenuOpen);
  const close = () => dispatch(setMobileMenuOpen(false));

  return (
    <Drawer open={open} onClose={close} title="Menu" side="left">
      <nav className="flex flex-col gap-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={close}
            className="text-maroon-800 hover:bg-maroon-50 rounded-lg px-3 py-3 text-base font-medium"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-maroon-100 mt-6 border-t pt-4">
        <p className="text-maroon-900 mb-2 text-sm font-medium">Quick actions</p>
        <div className="flex flex-col gap-2">
          <Link
            href="/wishlist"
            onClick={close}
            className="text-maroon-800 hover:bg-maroon-50 rounded-lg px-3 py-3 text-base font-medium"
          >
            Wishlist
          </Link>
          <Link
            href="/cart"
            onClick={close}
            className="text-maroon-800 hover:bg-maroon-50 rounded-lg px-3 py-3 text-base font-medium"
          >
            Cart
          </Link>
          <Link
            href={authStatus === "authenticated" ? "/account" : "/login"}
            onClick={close}
            className="text-maroon-800 hover:bg-maroon-50 rounded-lg px-3 py-3 text-base font-medium"
          >
            {authStatus === "authenticated" ? "Account" : "Sign in"}
          </Link>
        </div>
      </div>
    </Drawer>
  );
}
