import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { serverFetch } from "@/lib/serverApi";
import type { Product } from "@/types";

import { ProductDetailClient } from "./ProductDetailClient";
import { RelatedProducts } from "./RelatedProducts";
import { ReviewsSection } from "./ReviewsSection";

async function getProduct(slug: string): Promise<Product | null> {
  const data = await serverFetch<{ product: Product }>(`/products/${slug}`);
  return data?.product ?? null;
}

function sanitizeSeoText(text: string) {
  return text
    .replace(/\bhandloom\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
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

  const title = sanitizeSeoText(product.name);
  const description = sanitizeSeoText(product.description.slice(0, 160));
  const image = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
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
  const price = product.type === "simple" ? (product.price ?? 0) : product.startingPrice;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: sanitizeSeoText(product.name),
    description: sanitizeSeoText(product.description),
    image: product.images.map((image) => image.url),
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
      availability: (
        product.type === "simple"
          ? (product.stock ?? 0) > 0
          : (product.variants ?? []).some((v) => v.isActive && v.stock > 0)
      )
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
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

  return (
    <main className="flex-1 pb-16">
      {/* Static, server-generated structured data — no user input reaches this HTML. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductDetailClient product={product} />
      <ReviewsSection productId={product._id} />
      <RelatedProducts categoryId={categoryId} excludeProductId={product._id} />
    </main>
  );
}
