import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache, Suspense } from "react";

import { ProductListingClient, ProductListingStatic } from "@/app/products/ProductListingClient";
import { ItemListJsonLd } from "@/components/seo/ItemListJsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  categoryHeading,
  getCategories,
  getOccasions,
  getProductFacets,
  topLevelCategories,
} from "@/lib/catalog";
import { LISTING_CARD_SIZES } from "@/lib/imageSizes";
import { preloadImage } from "@/lib/preloadImage";
import { getProductPrimaryImage } from "@/lib/productImage";
import { pageMetadata, stripBrand, truncateDescription } from "@/lib/seo";
import { serverFetch, serverFetchPage } from "@/lib/serverApi";
import type { Category, Product } from "@/types";

// ISR: rendered on first request, then served from cache and refreshed in the background.
// Filters/sort live in the query string and are applied client-side, so they don't make this
// route dynamic; filtered URLs canonicalise to the clean category URL.
export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

const getCategory = cache(async (slug: string): Promise<Category | null> => {
  const data = await serverFetch<{ category: Category }>(`/categories/${slug}`, revalidate);
  return data?.category ?? null;
});

async function getCategoryProducts(
  categoryId: string,
): Promise<{ products: Product[]; nextCursor: string | null }> {
  const page = await serverFetchPage<{ products: Product[] }>(
    `/products?category=${categoryId}&limit=12`,
    revalidate,
  );
  return { products: page?.data.products ?? [], nextCursor: page?.nextCursor ?? null };
}

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category not found", robots: { index: false, follow: false } };
  }

  const heading = categoryHeading(category.name);
  const title =
    stripBrand(category.seoTitle?.trim() ?? "") || `${heading} — Handwoven in Elampillai`;
  const description =
    category.seoDescription?.trim() ||
    (category.description
      ? truncateDescription(category.description)
      : `Shop ${heading.toLowerCase()} at Saree Grace — sourced directly from weaver families in Elampillai, Tamil Nadu.`);

  // Same request (and data-cache entry) as the page body. An empty category is thin content:
  // keep it out of the index until it has products, but let crawlers follow its links.
  const firstPage = await getCategoryProducts(category._id).catch(() => null);
  const isEmpty = firstPage !== null && firstPage.products.length === 0;

  return pageMetadata({
    title,
    description,
    path: `/categories/${category.slug}`,
    image: category.image?.url,
    imageAlt: heading,
    noindex: isEmpty,
  });
}

export default async function CategoryDetailPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  // The backend also resolves categories by id — send any id/legacy URL to the one canonical
  // slug URL instead of serving duplicate content. (Letter case is normalised earlier, in
  // src/proxy.ts, so this never caches a redirect under a case-variant of the real path.)
  if (decodeURIComponent(slug) !== category.slug) {
    permanentRedirect(`/categories/${category.slug}`);
  }

  const [firstPage, categories, occasions, facets] = await Promise.all([
    getCategoryProducts(category._id),
    getCategories(),
    getOccasions(),
    getProductFacets(category._id),
  ]);
  const initialProducts = firstPage.products;
  // The first card image is the LCP on phones — hint it in <head> (see lib/preloadImage.ts).
  if (initialProducts[0]) {
    preloadImage(getProductPrimaryImage(initialProducts[0])?.url, LISTING_CARD_SIZES);
  }
  const heading = categoryHeading(category.name);

  return (
    <main className="flex-1">
      <Breadcrumbs
        className="container-page"
        items={[
          { name: "Home", url: "/" },
          { name: "Categories", url: "/categories" },
          { name: category.name, url: `/categories/${category.slug}` },
        ]}
      />
      <ItemListJsonLd name={heading} products={initialProducts} />

      <header className="container-page pt-2 pb-8 lg:pb-10">
        <h1 className="text-heading-xl text-foreground">{heading}</h1>
        {category.description ? (
          <p className="text-muted-foreground mt-3 max-w-2xl text-[15px] leading-relaxed">
            {category.description}
          </p>
        ) : null}
      </header>

      {/* The fallback is the real, server-rendered default listing (not a skeleton): on ISR pages
          the live listing reads the URL and renders on the client, so without this the HTML
          would contain no products. */}
      <Suspense
        fallback={
          <ProductListingStatic
            fixedCategory={category._id}
            activeCategorySlug={category.slug}
            initialProducts={initialProducts}
            initialNextCursor={firstPage.nextCursor}
            categories={topLevelCategories(categories)}
            occasions={occasions}
            initialFacets={facets}
          />
        }
      >
        <ProductListingClient
          fixedCategory={category._id}
          activeCategorySlug={category.slug}
          initialProducts={initialProducts}
          initialNextCursor={firstPage.nextCursor}
          categories={topLevelCategories(categories)}
          occasions={occasions}
          initialFacets={facets}
        />
      </Suspense>
    </main>
  );
}
