import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ProductRail } from "@/components/home/ProductRail";
import { DescriptionBody } from "@/components/product/ProductDescription";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PDP_MAIN_IMAGE_SIZES } from "@/lib/imageSizes";
import { toPlainText } from "@/lib/plainText";
import { preloadImage } from "@/lib/preloadImage";
import { getProductAllImages, getProductPrimaryImage } from "@/lib/productImage";
import { getInitialGalleryImages } from "@/lib/productSelection";
import { absoluteUrl, pageMetadata, stripBrand, truncateDescription } from "@/lib/seo";
import { serverFetch } from "@/lib/serverApi";
import type { Product } from "@/types";

import { ProductDetailClient } from "./ProductDetailClient";
import { RecentlyViewed } from "./RecentlyViewed";
import { ReviewsSection } from "./ReviewsSection";

// Incremental static regeneration: product pages are rendered on first request, cached, and
// refreshed in the background at most every 5 minutes — fast TTFB for shoppers and crawlers
// instead of a backend round trip on every view. Stock/price shown here are re-validated by the
// cart API at add-to-cart time, so a few minutes of staleness can't oversell.
export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const data = await serverFetch<{ product: Product }>(`/products/${slug}`, revalidate);
  return data?.product ?? null;
});

const cleanSeoText = toPlainText;

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return { title: "Product not found", robots: { index: false, follow: false } };
  }

  const categoryName =
    typeof product.category === "object" && product.category?.name ? product.category.name : "";

  const title =
    stripBrand(product.seoTitle?.trim() ?? "") ||
    (categoryName ? `${product.name} — ${categoryName}` : product.name);

  const description =
    product.seoDescription?.trim() ||
    (product.description.length >= 40
      ? truncateDescription(product.description)
      : `Shop ${product.name}${categoryName ? ` in ${categoryName}` : ""} at Saree Grace — handwoven by traditional weavers in Elampillai.`);

  const image = getProductPrimaryImage(product)?.url;

  return pageMetadata({
    title,
    description,
    path: `/products/${product.slug}`,
    image,
    imageAlt: product.name,
  });
}

function buildProductJsonLd(product: Product, categoryName: string) {
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const images = getProductAllImages(product).map((img) => img.url);
  const availability = (inStock: boolean) =>
    inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  let offers: Record<string, unknown>;
  if (product.type === "variant" && product.variants && product.variants.length > 0) {
    const activeVariants = product.variants.filter((v) => v.isActive);
    const variantPrices = activeVariants.map((v) => v.price).filter((p) => p > 0);
    const lowPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : product.startingPrice;
    const highPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : product.startingPrice;

    offers =
      lowPrice !== highPrice
        ? {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice,
            highPrice,
            offerCount: activeVariants.length,
            availability: availability(activeVariants.some((v) => v.stock > 0)),
            url: productUrl,
          }
        : {
            "@type": "Offer",
            price: lowPrice,
            priceCurrency: "INR",
            availability: availability(activeVariants.some((v) => v.stock > 0)),
            url: productUrl,
            itemCondition: "https://schema.org/NewCondition",
          };
  } else {
    offers = {
      "@type": "Offer",
      price: product.price ?? 0,
      priceCurrency: "INR",
      availability: availability((product.stock ?? 0) > 0),
      url: productUrl,
      itemCondition: "https://schema.org/NewCondition",
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cleanSeoText(product.name),
    description: cleanSeoText(product.description),
    // Omitted (not an empty array) when the product has no photos — `image: []` is invalid.
    ...(images.length > 0 ? { image: images } : {}),
    url: productUrl,
    brand: { "@type": "Brand", name: "Saree Grace" },
    ...(product.sku ? { sku: product.sku } : {}),
    ...(categoryName ? { category: categoryName } : {}),
    ...(product.fabric ? { material: product.fabric } : {}),
    ...(product.color ? { color: product.color } : {}),
    offers,
    // Only ever from real, approved reviews.
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.ratingAvg.toFixed(1)),
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  // The gallery's first photo is the LCP; the gallery is a client component, so hint it here.
  preloadImage(getInitialGalleryImages(product)[0]?.url, PDP_MAIN_IMAGE_SIZES);

  const categoryId = typeof product.category === "string" ? product.category : product.category._id;
  const categoryName =
    typeof product.category === "object" && product.category?.name ? product.category.name : "";
  const categorySlug =
    typeof product.category === "object" && product.category?.slug ? product.category.slug : "";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    ...(categoryName && categorySlug
      ? [{ name: categoryName, url: `/categories/${categorySlug}` }]
      : [{ name: "Shop", url: "/products" }]),
    { name: product.name, url: `/products/${product.slug}` },
  ];

  // Related products are server-rendered (crawlable links, no client refetch).
  let related: Product[] = [];
  if (categoryId) {
    try {
      const relatedData = await serverFetch<{ products: Product[] }>(
        `/products?category=${categoryId}&limit=9`,
        revalidate,
      );
      related = (relatedData?.products ?? [])
        .filter((item) => item._id !== product._id)
        .slice(0, 8);
    } catch {
      related = [];
    }
  }

  return (
    <main className="flex-1">
      <JsonLd data={buildProductJsonLd(product, categoryName)} />
      <Breadcrumbs items={breadcrumbs} className="container-page" />

      <ProductDetailClient
        product={product}
        description={<DescriptionBody description={product.description} />}
      />
      <ReviewsSection productId={product._id} />
      <ProductRail
        id="related-products"
        eyebrow={categoryName ? `More ${categoryName}` : "You may also like"}
        title="You may also like"
        products={related}
        action={
          categorySlug ? { href: `/categories/${categorySlug}`, label: "View all" } : undefined
        }
        className="pt-14 pb-16 lg:pt-20 lg:pb-24"
      />
      <RecentlyViewed currentSlug={product.slug} />
    </main>
  );
}
