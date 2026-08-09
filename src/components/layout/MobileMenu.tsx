"use client";

import Link from "next/link";

import { Drawer } from "@/components/ui/Drawer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileMenuOpen } from "@/store/slices/uiSlice";

const NAV_LINKS = [
  { href: "/products", label: "Shop all" },
  { href: "/products?handloomOnly=true", label: "Handloom sarees" },
  { href: "/about", label: "Our story" },
  { href: "/wishlist", label: "Wishlist" },
];

export function MobileMenu() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.mobileMenuOpen);
  const close = () => dispatch(setMobileMenuOpen(false));

  return (
    <Drawer open={open} onClose={close} title="Menu" side="left">
      <nav className="flex flex-col gap-1">
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
    </Drawer>
  );
}
