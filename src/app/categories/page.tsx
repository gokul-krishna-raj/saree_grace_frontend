import type { Metadata } from "next";

import { CategoryGrid } from "@/components/category/CategoryGrid";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { serverFetch } from "@/lib/serverApi";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: "All Categories — Silk, Handloom & Designer Weaves | Saree Grace",
  description:
    "Browse all saree categories at Saree Grace. From luxurious silks to comfortable cottons, find the perfect saree for every occasion.",
  alternates: { canonical: "/categories" },
  openGraph: {
    type: "website",
    title: "All Categories | Saree Grace",
    description:
      "Explore our complete range of saree categories — from bridal pure silks and soft silks to daily wear handloom cottons.",
    url: "/categories",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Categories | Saree Grace",
    description:
      "Explore our complete range of saree categories — from bridal pure silks and soft silks to daily wear handloom cottons.",
  },
};

export default async function CategoriesPage() {
  let categories: Category[] = [];
  try {
    const data = await serverFetch<{ categories: Category[] }>("/categories");
    categories = data?.categories ?? [];
  } catch {
    // Non-blocking fallback during build
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
  ];

  return (
    <main className="flex-1 py-8 lg:py-16">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <div className="mx-auto max-w-6xl px-4">
        {/* Page Header matching shastik_fashion */}
        <div className="mb-10 text-center lg:mb-12">
          <span className="text-accent text-xs font-semibold tracking-wider uppercase sm:text-sm">
            Browse by
          </span>
          <h1 className="font-display text-foreground mt-2 text-3xl font-bold sm:text-4xl lg:text-5xl">
            All Categories
          </h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
            From luxurious silks to comfortable cottons, find the perfect saree for every occasion.
          </p>
        </div>

        <CategoryGrid initialCategories={categories} />
      </div>
    </main>
  );
}
