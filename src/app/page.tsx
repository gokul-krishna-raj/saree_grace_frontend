import type { Metadata } from "next";

import { CategoryRail } from "@/components/home/CategoryRail";
import { ContactSignup } from "@/components/home/ContactSignup";
import { CraftStory } from "@/components/home/CraftStory";
import { Hero } from "@/components/home/Hero";
import { ProductRail } from "@/components/home/ProductRail";
import { ShopByPrice } from "@/components/home/ShopByPrice";
import { TrustStrip } from "@/components/home/TrustStrip";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { WebSiteJsonLd } from "@/components/seo/WebSiteJsonLd";
import { getCategories, topLevelCategories } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { serverFetch } from "@/lib/serverApi";
import type { Product } from "@/types";

export const metadata: Metadata = pageMetadata({
  title: "Authentic Elampillai Sarees & Handloom Weaves",
  description:
    "Shop soft silk, silk cotton and handloom cotton sarees sourced directly from weaver families in Elampillai, Tamil Nadu. Secure checkout and delivery across India.",
  path: "/",
  image: "/saree_grace_logo.png",
  imageAlt: "Saree Grace — Authentic Elampillai Sarees",
});

async function safeProducts(path: string): Promise<Product[]> {
  try {
    const data = await serverFetch<{ products: Product[] }>(path);
    return data?.products ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [categories, newArrivals, bestSellers] = await Promise.all([
    getCategories(),
    safeProducts("/products?sort=newest&limit=8"),
    safeProducts("/products/best-sellers?limit=4"),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Hero />
      <TrustStrip />
      <CategoryRail categories={topLevelCategories(categories)} />
      <ProductRail
        id="new-arrivals"
        eyebrow="Just arrived"
        title="New arrivals"
        description="The latest weaves from our looms, added to the collection this season."
        products={newArrivals.slice(0, 8)}
        action={{ href: "/products", label: "Shop all" }}
        className="pb-14 lg:pb-24"
      />
      <CraftStory />
      {/* Only real sales data — the section is omitted entirely until orders exist, rather than
          relabelling an arbitrary list as "bestsellers". */}
      <ProductRail
        id="best-sellers"
        eyebrow="Most loved"
        title="Bestsellers"
        description="The sarees our customers keep coming back for."
        products={bestSellers}
        action={{ href: "/products", label: "Shop all" }}
        className="pt-14 lg:pt-24"
      />
      <ShopByPrice />
      <ContactSignup />
    </main>
  );
}
