import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { env } from "@/lib/env";
import { getProductAllImages, getProductPrimaryImage } from "@/lib/productImage";
import { serverFetch } from "@/lib/serverApi";
import type { Product } from "@/types";

import { ProductDetailClient } from "./ProductDetailClient";
import { RelatedProducts } from "./RelatedProducts";
import { ReviewsSection } from "./ReviewsSection";

async function getProduct(slug: string): Promise<Product | null> {
  const data = await serverFetch<{ product: Product }>(`/products/${slug}`);
  return data?.product ?? null;
}

function cleanSeoText(text: string) {
  return text.replace(/\s{2,}/g, " ").trim();
}

function getPriceValidUntil(updatedAt?: string): string {
  const baseYear = updatedAt ? new Date(updatedAt).getFullYear() : 2026;
  return `${baseYear + 1}-12-31`;
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    // Explicit, not relying on Next's automatic noindex injection — see NOTES.md, this route
    // can't return a real 404 HTTP status (rendering has already started streaming by the time
    // `notFound()` runs), so this is the actual SEO safety net, not a nice-to-have.
    return { title: "Product not found", robots: { index: false, follow: false } };
  }

  const categoryName =
    typeof product.category === "object" && product.category?.name ? product.category.name : "";

  const title =
    product.seoTitle?.trim() || (categoryName ? `${product.name} — ${categoryName}` : product.name);

  const fallbackDescription =
    product.description.length >= 40
      ? cleanSeoText(product.description.slice(0, 160))
      : `Shop ${product.name} ${categoryName ? `in ${categoryName}` : ""} at Saree Grace. Handcrafted with premium quality materials by traditional weavers.`;

  const description = product.seoDescription?.trim() || fallbackDescription;
  const primaryImage = getProductPrimaryImage(product);
  const image = primaryImage?.url;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      url: `/products/${product.slug}`,
      title: `${title} | Saree Grace`,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Saree Grace`,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const categoryId = typeof product.category === "string" ? product.category : product.category._id;
  const categoryName =
    typeof product.category === "object" && product.category?.name ? product.category.name : "";
  const categorySlug =
    typeof product.category === "object" && product.category?.slug ? product.category.slug : "";

  const allImages = getProductAllImages(product);
  const priceValidUntil = getPriceValidUntil(product.updatedAt);
  const productUrl = `${env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`;

  // Structured Data (Product + Offer / AggregateOffer)
  let offersData;
  if (product.type === "variant" && product.variants && product.variants.length > 0) {
    const activeVariants = product.variants.filter((v) => v.isActive);
    const variantPrices = activeVariants.map((v) => v.price).filter((p) => p > 0);
    const lowPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : product.startingPrice;
    const highPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : product.startingPrice;

    if (lowPrice !== highPrice) {
      offersData = {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        lowPrice,
        highPrice,
        offerCount: activeVariants.length,
        url: productUrl,
        offers: activeVariants.map((v) => ({
          "@type": "Offer",
          sku: v.sku || String(v._id),
          price: v.price,
          priceCurrency: "INR",
          availability:
            v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: productUrl,
          priceValidUntil,
          itemCondition: "https://schema.org/NewCondition",
        })),
      };
    } else {
      offersData = {
        "@type": "Offer",
        price: lowPrice,
        priceCurrency: "INR",
        availability: activeVariants.some((v) => v.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: productUrl,
        priceValidUntil,
        itemCondition: "https://schema.org/NewCondition",
      };
    }
  } else {
    offersData = {
      "@type": "Offer",
      price: product.price ?? 0,
      priceCurrency: "INR",
      availability:
        (product.stock ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl,
      priceValidUntil,
      itemCondition: "https://schema.org/NewCondition",
    };
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cleanSeoText(product.name),
    description: cleanSeoText(product.description),
    image: allImages.map((img) => img.url),
    brand: {
      "@type": "Brand",
      name: "Saree Grace",
    },
    sku: product.sku || product._id,
    mpn: product.sku || product._id,
    offers: offersData,
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/products" },
    ...(categoryName && categorySlug
      ? [{ name: categoryName, url: `/categories/${categorySlug}` }]
      : []),
    { name: product.name, url: `/products/${product.slug}` },
  ];

  // Pre-fetch related products for SSR crawlability
  const relatedData = categoryId
    ? await serverFetch<{ products: Product[] }>(`/products?category=${categoryId}&limit=8`)
    : null;
  const initialRelated = relatedData?.products ?? [];

  return (
    <main className="flex-1 pb-16">
      {/* Static, server-generated structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />

      {/* Visible Breadcrumb Trail matching shastik_fashion */}
      <nav className="mx-auto max-w-6xl px-4 py-4" aria-label="Breadcrumb">
        <ol className="text-muted-foreground flex items-center gap-2 overflow-hidden text-sm">
          <li className="shrink-0">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li className="shrink-0" aria-hidden="true">
            /
          </li>
          <li className="shrink-0">
            <Link href="/products" className="hover:text-primary transition-colors">
              Shop
            </Link>
          </li>
          {categoryName && categorySlug ? (
            <>
              <li className="shrink-0" aria-hidden="true">
                /
              </li>
              <li className="shrink-0">
                <Link
                  href={`/categories/${categorySlug}`}
                  className="hover:text-primary transition-colors"
                >
                  {categoryName}
                </Link>
              </li>
            </>
          ) : null}
          <li className="shrink-0" aria-hidden="true">
            /
          </li>
          <li className="text-foreground truncate font-medium" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetailClient product={product} />
      <ReviewsSection productId={product._id} />
      <RelatedProducts
        categoryId={categoryId}
        excludeProductId={product._id}
        initialProducts={initialRelated}
      />
    </main>
  );
}
