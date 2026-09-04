import type { Metadata } from "next";

import { CategoryGrid } from "@/components/category/CategoryGrid";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { serverFetch } from "@/lib/serverApi";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: "Saree Categories — Silk, Handloom & Designer Weaves",
  description:
    "Explore our complete range of saree categories — from bridal pure silks and soft silks to daily wear handloom cottons.",
  alternates: { canonical: "/categories" },
  openGraph: {
    type: "website",
    title: "Saree Categories | Saree Grace",
    description:
      "Explore our complete range of saree categories — from bridal pure silks and soft silks to daily wear handloom cottons.",
    url: "/categories",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saree Categories | Saree Grace",
    description:
      "Explore our complete range of saree categories — from bridal pure silks and soft silks to daily wear handloom cottons.",
  },
};

export default async function CategoriesPage() {
  const data = await serverFetch<{ categories: Category[] }>("/categories");
  const categories = data?.categories ?? [];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
  ];

  return (
    <main className="flex-1 py-6">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <h1 className="font-heading text-maroon-900 px-4 pb-6 text-2xl">All Categories</h1>
      <CategoryGrid initialCategories={categories} />
    </main>
  );
}
