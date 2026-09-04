import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductListingClient } from "@/app/products/ProductListingClient";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Skeleton } from "@/components/ui/Skeleton";
import { serverFetch } from "@/lib/serverApi";
import type { Category, Product } from "@/types";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string): Promise<Category | null> {
  const data = await serverFetch<{ category: Category }>(`/categories/${slug}`);
  return data?.category ?? null;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Category not found",
      robots: { index: false, follow: false },
    };
  }

  const title =
    category.seoTitle?.trim() || `${category.name} Sarees — Silk, Cotton & Traditional Weaves`;
  const description =
    category.seoDescription?.trim() ||
    (category.description
      ? category.description.slice(0, 160).trim()
      : `Explore our collection of authentic ${category.name} sarees at Saree Grace. Handcrafted by master weavers in Elampillai.`);

  return {
    title,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      type: "website",
      url: `/categories/${category.slug}`,
      title: `${title} | Saree Grace`,
      description,
      images: category.image?.url ? [{ url: category.image.url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Saree Grace`,
      description,
      images: category.image?.url ? [{ url: category.image.url }] : undefined,
    },
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  // Pre-fetch category products on the server so crawlers receive genuine HTML links
  const productsData = await serverFetch<{ products: Product[] }>(
    `/products?category=${category._id}&limit=12`,
  );
  const initialProducts = productsData?.products ?? [];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
    { name: category.name, url: `/categories/${category.slug}` },
  ];

  return (
    <main className="flex-1 py-6">
      <BreadcrumbJsonLd items={breadcrumbs} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="px-4 pb-3">
        <ol className="text-maroon-600 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
          <li>
            <Link href="/" className="hover:text-maroon-900 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-maroon-300">
            /
          </li>
          <li>
            <Link href="/categories" className="hover:text-maroon-900 transition-colors">
              Categories
            </Link>
          </li>
          <li aria-hidden="true" className="text-maroon-300">
            /
          </li>
          <li aria-current="page" className="text-maroon-900 font-medium">
            {category.name}
          </li>
        </ol>
      </nav>

      {/* Category Header */}
      <header className="px-4 pb-6">
        <h1 className="font-heading text-maroon-900 text-2xl sm:text-3xl">
          {category.name} Sarees
        </h1>
        {category.description ? (
          <p className="text-maroon-700 mt-2 max-w-3xl text-sm leading-relaxed sm:text-base">
            {category.description}
          </p>
        ) : null}
      </header>

      {/* Pre-hydrated Product Listing */}
      <Suspense
        fallback={
          <div className="flex flex-col gap-4 px-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <ProductListingClient fixedCategory={category._id} initialProducts={initialProducts} />
      </Suspense>
    </main>
  );
}
