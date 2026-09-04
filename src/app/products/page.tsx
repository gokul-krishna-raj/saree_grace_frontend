import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Skeleton } from "@/components/ui/Skeleton";
import { serverFetch } from "@/lib/serverApi";
import type { Category, Product } from "@/types";

import { ProductListingClient } from "./ProductListingClient";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    occasion?: string;
    q?: string;
    search?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug = params.category;
  const query = params.q || params.search;

  if (categorySlug) {
    const data = await serverFetch<{ category: Category }>(`/categories/${categorySlug}`);
    if (data?.category) {
      const cat = data.category;
      const title = cat.seoTitle || `${cat.name} Sarees`;
      const description =
        cat.seoDescription ||
        (cat.description
          ? `${cat.description.slice(0, 155).trim()}`
          : `Explore our collection of authentic ${cat.name} sarees at Saree Grace. Handcrafted by master weavers in Elampillai.`);

      return {
        title,
        description,
        alternates: { canonical: `/categories/${cat.slug}` },
        openGraph: {
          title: `${title} | Saree Grace`,
          description,
          url: `/categories/${cat.slug}`,
          images: cat.image?.url ? [{ url: cat.image.url }] : undefined,
        },
      };
    }
  }

  if (query) {
    return {
      title: `Search results for "${query}"`,
      description: `Browse matching sarees for "${query}" at Saree Grace. Handcrafted authentic Elampillai sarees.`,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: "Shop Sarees — Silk, Cotton & Festive Collections",
    description:
      "Browse our complete collection of authentic Elampillai sarees, soft silks, handloom cottons, and bridal sarees. Direct from weavers.",
    alternates: { canonical: "/products" },
    openGraph: {
      type: "website",
      title: "Shop Sarees — Saree Grace",
      description:
        "Browse our complete collection of authentic Elampillai sarees, soft silks, and handloom cottons.",
      url: "/products",
    },
    twitter: {
      card: "summary_large_image",
      title: "Shop Sarees — Saree Grace",
      description:
        "Browse our complete collection of authentic Elampillai sarees, soft silks, and handloom cottons.",
    },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  if (params.category) {
    redirect(`/categories/${params.category}`);
  }

  // Pre-fetch the first page of products on the server so crawlers receive genuine HTML links
  const initialData = await serverFetch<{ products: Product[] }>("/products?limit=12");
  const initialProducts = initialData?.products ?? [];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/products" },
  ];

  return (
    <main className="flex-1 py-6">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <h1 className="font-heading text-maroon-900 px-4 pb-4 text-2xl">Shop Sarees</h1>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4 px-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <ProductListingClient initialProducts={initialProducts} />
      </Suspense>
    </main>
  );
}
