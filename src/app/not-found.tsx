import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { getCategories, topLevelCategories } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const categories = topLevelCategories(await getCategories()).slice(0, 6);

  return (
    <main className="container-page flex flex-1 flex-col items-center py-20 text-center lg:py-28">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="text-heading-xl text-foreground max-w-xl">
        This page has slipped off the loom
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md text-[15px] leading-relaxed">
        The saree or page you&apos;re looking for may have moved or sold out. Try a search, or
        browse one of our collections.
      </p>

      {/* Plain GET form — works before JavaScript loads. */}
      <form action="/products" method="get" role="search" className="relative mt-8 w-full max-w-md">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          aria-label="Search sarees"
          placeholder="Search sarees"
          className="border-input bg-card focus-visible:ring-ring h-12 w-full rounded-md border pr-28 pl-11 text-base focus-visible:ring-2 focus-visible:outline-none"
        />
        <button
          type="submit"
          className={cn(
            buttonVariants({ size: "sm" }),
            "absolute top-1/2 right-1.5 h-9 -translate-y-1/2",
          )}
        >
          Search
        </button>
      </form>

      {categories.length > 0 ? (
        <nav aria-label="Popular categories" className="mt-10">
          <ul className="flex max-w-2xl flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <li key={category._id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="border-border hover:border-foreground/50 inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to home
        </Link>
        <Link href="/products" className={cn(buttonVariants())}>
          Shop all sarees
        </Link>
      </div>
    </main>
  );
}
