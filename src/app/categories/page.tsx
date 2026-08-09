import type { Metadata } from "next";

import { CategoryGrid } from "@/components/category/CategoryGrid";

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse all saree categories from Saree Grace.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <main className="flex-1 py-6">
      <h1 className="font-heading text-maroon-900 px-4 pb-6 text-2xl">All Categories</h1>
      <CategoryGrid />
    </main>
  );
}
