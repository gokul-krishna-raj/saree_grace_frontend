"use client";

import { ChevronRight, Heart, Package, User } from "lucide-react";
import Link from "next/link";

import { Drawer } from "@/components/ui/Drawer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileMenuOpen } from "@/store/slices/uiSlice";
import type { Category } from "@/types";

const INFO_LINKS = [
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/shipping-policy", label: "Shipping" },
  { href: "/refund-policy", label: "Returns & Refunds" },
];

export function MobileMenu({ categories = [] }: { categories?: Category[] }) {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const open = useAppSelector((state) => state.ui.mobileMenuOpen);
  const close = () => dispatch(setMobileMenuOpen(false));
  const isAuthenticated = authStatus === "authenticated";

  return (
    <Drawer open={open} onClose={close} title="Menu" side="left">
      <nav aria-label="Mobile" className="-mx-5 -mt-4">
        <Link
          href="/products"
          onClick={close}
          className="border-border font-display text-foreground flex items-center justify-between border-b px-5 py-4 text-xl"
        >
          Shop All Sarees
          <ChevronRight className="text-muted-foreground h-5 w-5" aria-hidden="true" />
        </Link>

        {categories.length > 0 ? (
          <div className="border-border border-b px-5 py-4">
            <p className="eyebrow mb-2">Categories</p>
            <ul>
              {categories.map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    onClick={close}
                    className="text-foreground flex min-h-11 items-center text-[15px]"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/categories"
              onClick={close}
              className="text-primary mt-1 inline-flex min-h-11 items-center text-sm font-medium"
            >
              View all categories
            </Link>
          </div>
        ) : null}

        <div className="border-border grid grid-cols-3 border-b">
          {[
            {
              href: isAuthenticated ? "/account" : "/login",
              label: isAuthenticated ? "Account" : "Sign in",
              Icon: User,
            },
            { href: "/wishlist", label: "Wishlist", Icon: Heart },
            {
              href: isAuthenticated ? "/account/orders" : "/login?redirect=/account/orders",
              label: "Orders",
              Icon: Package,
            },
          ].map(({ href, label, Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={close}
              className="text-foreground border-border hover:bg-muted flex flex-col items-center gap-1.5 border-r py-4 text-xs font-medium last:border-r-0"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>

        <ul className="px-5 py-3">
          {INFO_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={close}
                className="text-muted-foreground hover:text-foreground flex min-h-11 items-center text-sm"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
