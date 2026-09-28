import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { Suspense } from "react";

import { GridSkeleton } from "@/components/product/ProductGrid";
import { ItemListJsonLd } from "@/components/seo/ItemListJsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getCategories, getOccasions, getProductFacets, topLevelCategories } from "@/lib/catalog";
import { LISTING_CARD_SIZES } from "@/lib/imageSizes";
import { preloadImage } from "@/lib/preloadImage";
import { getProductPrimaryImage } from "@/lib/productImage";
import { pageMetadata } from "@/lib/seo";
import { serverFetch, serverFetchPage } from "@/lib/serverApi";
import { hasListingParams } from "@/lib/validation/productFilters";
import type { Category, Product } from "@/types";

import { ProductListingClient } from "./ProductListingClient";

type SearchParams = Record<string, string | string[] | undefined>;

interface ProductsPageProps {
  searchParams: Promise<SearchParams>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = first(params.q) || first(params.search);
  const base = {
    title: "Shop Sarees — Silk, Cotton & Handloom",
    description:
      "Browse the full Saree Grace collection: soft silks, silk cottons, Kalyani and Kerala cottons and bridal sarees, sourced directly from weavers in Elampillai.",
    path: "/products",
  };

  if (query) {
    return {
      ...pageMetadata({ ...base, title: `Search results for “${query}”` }),
      // Internal search result pages shouldn't be indexed, but their links should be followed.
      robots: { index: false, follow: true },
    };
  }

  // Filtered/sorted variants of the listing are the same content re-ordered or narrowed — keep
  // them out of the index and point the canonical at the clean URL.
  const hasFacets = hasListingParams(Object.keys(params));
  return pageMetadata({ ...base, noindex: hasFacets });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categoryParam = first(params.category);
  if (categoryParam) {
    // Legacy `/products?category=<id|slug>` links → the category's canonical URL.
    let slug = categoryParam;
    try {
      const data = await serverFetch<{ category: Category }>(`/categories/${categoryParam}`);
      if (data?.category?.slug) slug = data.category.slug;
    } catch {
      // fall through with the raw param
    }
    permanentRedirect(`/categories/${encodeURIComponent(slug)}`);
  }

  const query = first(params.q) || first(params.search);
  const isDefaultView = !hasListingParams(Object.keys(params));
  const [categories, occasions, facets, initialData] = await Promise.all([
    getCategories(),
    getOccasions(),
    getProductFacets(),
    // The server-rendered first page is only used for the unfiltered view.
    isDefaultView
      ? serverFetchPage<{ products: Product[] }>("/products?limit=12").catch(() => null)
      : Promise.resolve(null),
  ]);
  const initialProducts = initialData?.data.products ?? [];
  // The first card image is the LCP on phones — hint it in <head> (see lib/preloadImage.ts).
  if (initialProducts[0]) {
    preloadImage(getProductPrimaryImage(initialProducts[0])?.url, LISTING_CARD_SIZES);
  }

  return (
    <main className="flex-1">
      <Breadcrumbs
        className="container-page"
        items={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/products" },
        ]}
      />
      <ItemListJsonLd name="All sarees" products={initialProducts} />
      <header className="container-page pt-2 pb-8 lg:pb-10">
        <h1 className="text-heading-xl text-foreground">
          {query ? <>Results for &ldquo;{query}&rdquo;</> : "All sarees"}
        </h1>
        {!query ? (
          <p className="text-muted-foreground mt-3 max-w-2xl text-[15px] leading-relaxed">
            Soft silks, silk cottons and handloom cottons — every saree sourced directly from weaver
            families in Elampillai, Tamil Nadu.
          </p>
        ) : null}
      </header>
      {/* /products is rendered per request, so the live listing (which reads the URL) is already
          in the server HTML — a skeleton fallback is enough here. Category pages are ISR and use
          the static listing as their fallback instead. */}
      <Suspense
        fallback={
          <div className="container-page">
            <GridSkeleton />
          </div>
        }
      >
        <ProductListingClient
          initialProducts={initialProducts}
          initialNextCursor={initialData ? initialData.nextCursor : undefined}
          categories={topLevelCategories(categories)}
          occasions={occasions}
          initialFacets={facets}
          showSearch
        />
      </Suspense>
    </main>
  );
}
