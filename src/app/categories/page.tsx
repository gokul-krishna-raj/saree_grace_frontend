import type { Metadata } from "next";

import { CategoryGrid } from "@/components/category/CategoryGrid";

export const metadata: Metadata = {
  title: "Saree Categories — Silk, Handloom & Designer Weaves",
  description:
    "Explore our complete range of saree categories — from bridal pure silks and soft silks to daily wear handloom cottons.",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Saree Categories | Saree Grace",
    description:
      "Explore our complete range of saree categories — from bridal pure silks and soft silks to daily wear handloom cottons.",
    url: "/categories",
  },
};

export default function CategoriesPage() {
  return (
    <main className="flex-1 py-6">
      <h1 className="font-heading text-maroon-900 px-4 pb-6 text-2xl">All Categories</h1>
      <CategoryGrid />
    </main>
  );
}
