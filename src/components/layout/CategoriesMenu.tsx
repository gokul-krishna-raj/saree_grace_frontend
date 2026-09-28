"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import type { Category } from "@/types";

// Desktop "Categories" mega menu. Opens on hover (with a short close delay so moving the pointer
// from the trigger into the panel doesn't flicker it shut) and on click/Enter for keyboard and
// touch-laptop users. Escape and focus leaving the menu close it.
export function CategoriesMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close on navigation (render-time reset, not an effect — see React docs "adjusting state
  // when a prop changes").
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  if (categories.length === 0) {
    return (
      <Link
        href="/categories"
        className="link-underline text-foreground py-1 text-[13px] font-medium tracking-wide"
      >
        Categories
      </Link>
    );
  }

  return (
    <div
      ref={wrapperRef}
      onPointerEnter={(event) => event.pointerType === "mouse" && openNow()}
      onPointerLeave={(event) => event.pointerType === "mouse" && closeSoon()}
      onBlur={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="text-foreground flex items-center gap-1 py-1 text-[13px] font-medium tracking-wide"
      >
        Categories
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="border-border bg-background animate-fade-in absolute inset-x-0 top-full border-b shadow-[0_24px_40px_-24px_hsl(350_40%_10%/0.25)]"
      >
        <div className="container-page grid grid-cols-[1fr_20rem] gap-12 py-10">
          <div>
            <p className="eyebrow mb-5">Shop by category</p>
            <ul className="columns-3 gap-10">
              {categories.map((category) => (
                <li key={category._id} className="break-inside-avoid">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-foreground/85 hover:text-primary block py-2 text-[15px] transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/categories"
              className="text-primary mt-6 inline-flex items-center gap-1.5 text-sm font-medium"
            >
              View all categories
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <Link
            href="/products"
            className="group relative block aspect-[4/5] overflow-hidden rounded-md"
          >
            {open ? (
              <Image
                src="/hero-saree-model.webp"
                alt=""
                fill
                sizes="320px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : null}
            <span className="from-maroon-950/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="font-display block text-xl">The full collection</span>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/85">
                Shop all sarees <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
