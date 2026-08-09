"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Input } from "@/components/ui/Input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchProductsQuery } from "@/store/api/productsApi";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading, isError } = useSearchProductsQuery(
    { q: debouncedQuery, limit: 10 },
    { skip: debouncedQuery.length === 0 },
  );

  const products = useMemo(() => data?.products ?? [], [data]);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!hasQuery) return [];
    return products;
  }, [hasQuery, products]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="bg-maroon-900/40 fixed inset-0 z-50 flex items-start justify-center px-4 py-6 sm:items-center">
      <div
        ref={panelRef}
        id="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-dialog-title"
        className="border-maroon-100 w-full max-w-3xl overflow-hidden rounded-3xl border bg-white shadow-2xl"
      >
        <div className="border-maroon-100 flex items-center justify-between gap-4 border-b p-4">
          <div>
            <p id="search-dialog-title" className="text-maroon-900 font-heading text-lg">
              Search products
            </p>
            <p className="text-maroon-600 text-sm">
              Search by name, category, fabric, colour, or code.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-maroon-700 hover:bg-maroon-50 focus-visible:outline-maroon-600 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <Input
            ref={inputRef}
            aria-label="Search products"
            placeholder="Search sarees, fabric, colour, or product code"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full"
          />
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              className="bg-maroon-900 hover:bg-maroon-800 focus-visible:outline-maroon-600 inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="border-maroon-100 text-maroon-700 hover:bg-maroon-50 focus-visible:outline-maroon-600 inline-flex h-11 items-center justify-center rounded-lg border bg-white px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="border-maroon-100 border-t p-4">
          {hasQuery ? (
            isLoading ? (
              <p className="text-maroon-600">Loading products…</p>
            ) : isError ? (
              <p className="text-red-600">Unable to load product suggestions. Try again.</p>
            ) : results.length === 0 ? (
              <div className="border-maroon-200 bg-maroon-50 rounded-3xl border border-dashed p-8 text-center">
                <p className="font-heading text-maroon-900 text-lg">No products found</p>
                <p className="text-maroon-600 mt-1 text-sm">
                  Try a different keyword, fabric, or colour.
                </p>
              </div>
            ) : (
              <ul className="grid gap-3">
                {results.map((product) => (
                  <li key={product._id}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className="group border-maroon-100 hover:border-maroon-300 hover:bg-maroon-50 flex items-center gap-4 rounded-3xl border p-3 text-left"
                    >
                      <div className="bg-maroon-50 relative h-16 w-16 overflow-hidden rounded-2xl">
                        {product.images[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-maroon-900 truncate font-medium">{product.name}</p>
                        <p className="text-maroon-600 truncate text-sm">{product.fabric ?? ""}</p>
                      </div>
                      <span className="text-maroon-900 text-sm font-semibold">
                        ₹{product.price?.toLocaleString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="border-maroon-200 bg-maroon-50 rounded-3xl border border-dashed p-8 text-center">
              <p className="font-heading text-maroon-900 text-lg">Start typing to search</p>
              <p className="text-maroon-600 mt-1 text-sm">
                Search product names, fabrics, colours, and codes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
