"use client";

import { ArrowRight, Clock, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFocusTrap, useScrollLock } from "@/hooks/useFocusTrap";
import { formatPrice } from "@/lib/formatPrice";
import { getProductPrimaryImage } from "@/lib/productImage";
import { useSearchProductsQuery } from "@/store/api/productsApi";
import type { Category } from "@/types";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  categories?: Category[];
}

const MIN_QUERY_LENGTH = 2;
const RECENT_KEY = "sg_recent_searches";
const MAX_RECENT = 5;

// Recent searches are a per-device convenience only — every read/write is guarded because
// storage can be unavailable (private mode, blocked site data).
function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function saveRecent(term: string) {
  try {
    const next = [term, ...readRecent().filter((v) => v.toLowerCase() !== term.toLowerCase())];
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

export function SearchOverlay({ open, onClose, categories = [] }: SearchOverlayProps) {
  if (!open) return null;
  return createPortal(<SearchPanel onClose={onClose} categories={categories} />, document.body);
}

function SearchPanel({ onClose, categories }: { onClose: () => void; categories: Category[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(() => readRecent());
  const trimmed = query.trim();
  const debouncedQuery = useDebouncedValue(trimmed, 250);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useFocusTrap(panelRef, true, onClose);
  useScrollLock(true);

  const shouldSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const { currentData, isFetching, isError } = useSearchProductsQuery(
    { q: debouncedQuery, limit: 8 },
    { skip: !shouldSearch },
  );
  const results = currentData?.products ?? [];
  const isSettling = trimmed !== debouncedQuery || (shouldSearch && isFetching && !currentData);

  function submit(term: string) {
    const value = term.trim();
    if (!value) return;
    saveRecent(value);
    router.push(`/products?q=${encodeURIComponent(value)}`);
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(query);
  }

  function clearRecent() {
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      // ignore
    }
    setRecent([]);
  }

  const categoryChips = categories.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="animate-overlay-in bg-maroon-950/45 absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        tabIndex={-1}
        className="bg-background animate-fade-in relative flex max-h-dvh flex-col outline-none sm:max-h-[85dvh] sm:shadow-[0_24px_48px_-24px_hsl(350_40%_10%/0.35)]"
      >
        <form onSubmit={handleSubmit} role="search" className="border-border border-b">
          <div className="container-page flex h-16 items-center gap-3 lg:h-[72px]">
            <Search className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              autoFocus
              type="search"
              enterKeyHint="search"
              aria-label="Search sarees"
              placeholder="Search by name, fabric or colour"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent text-base outline-none lg:text-lg [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="text-muted-foreground hover:text-foreground text-xs font-medium tracking-wide uppercase"
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="hover:bg-muted -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="container-page flex-1 overflow-y-auto overscroll-contain py-6">
          <div aria-live="polite" className="sr-only">
            {shouldSearch && !isSettling && !isError
              ? `${results.length} ${results.length === 1 ? "result" : "results"}`
              : ""}
          </div>

          {trimmed.length < MIN_QUERY_LENGTH ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {recent.length > 0 ? (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="eyebrow">Recent searches</h2>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
                    >
                      Clear
                    </button>
                  </div>
                  <ul>
                    {recent.map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          onClick={() => submit(term)}
                          className="text-foreground hover:text-primary flex min-h-11 w-full items-center gap-3 text-left text-sm"
                        >
                          <Clock className="text-muted-foreground h-4 w-4" aria-hidden="true" />
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {categoryChips.length > 0 ? (
                <section>
                  <h2 className="eyebrow mb-3">Browse categories</h2>
                  <ul className="flex flex-wrap gap-2">
                    {categoryChips.map((category) => (
                      <li key={category._id}>
                        <Link
                          href={`/categories/${category.slug}`}
                          onClick={onClose}
                          className="border-border hover:border-foreground/50 inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : isSettling ? (
            <ul
              className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-8"
              aria-hidden="true"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <li key={index} className="flex flex-col gap-2">
                  <div className="shimmer aspect-[4/5] rounded-md" />
                  <div className="shimmer h-3 w-3/4 rounded" />
                  <div className="shimmer h-3 w-1/3 rounded" />
                </li>
              ))}
            </ul>
          ) : isError ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Search isn&apos;t responding right now. Press Enter to try the full results page.
            </p>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-display text-foreground text-xl">
                No sarees found for &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Try a fabric like &ldquo;silk&rdquo; or &ldquo;cotton&rdquo;, or a colour.
              </p>
              {categoryChips.length > 0 ? (
                <ul className="mt-6 flex flex-wrap justify-center gap-2">
                  {categoryChips.map((category) => (
                    <li key={category._id}>
                      <Link
                        href={`/categories/${category.slug}`}
                        onClick={onClose}
                        className="border-border hover:border-foreground/50 inline-flex min-h-10 items-center rounded-full border px-4 text-sm"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
                {results.map((product) => {
                  const image = getProductPrimaryImage(product);
                  const displayPrice =
                    product.type === "variant" ? product.startingPrice : (product.price ?? 0);
                  return (
                    <li key={product._id}>
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          saveRecent(debouncedQuery);
                          onClose();
                        }}
                        className="group flex flex-col gap-2"
                      >
                        <span className="bg-muted relative block aspect-[4/5] overflow-hidden rounded-md">
                          {image?.url ? (
                            <Image
                              src={image.url}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 12vw, (min-width: 640px) 25vw, 50vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          ) : null}
                        </span>
                        <span className="text-foreground line-clamp-2 text-sm leading-snug">
                          {product.name}
                        </span>
                        <span className="text-foreground text-sm font-medium tabular-nums">
                          {product.type === "variant" ? "From " : ""}
                          {formatPrice(displayPrice)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => submit(debouncedQuery)}
                  className="border-foreground/25 hover:bg-foreground hover:text-background inline-flex h-11 items-center gap-2 rounded-md border px-6 text-sm font-medium transition-colors"
                >
                  View all results for &ldquo;{debouncedQuery}&rdquo;
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
