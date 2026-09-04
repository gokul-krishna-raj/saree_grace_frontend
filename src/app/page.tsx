import type { Metadata } from "next";
import Link from "next/link";

import { BestSellersCarousel } from "@/components/home/BestSellersCarousel";
import { BrandStory } from "@/components/home/BrandStory";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { ContactSignup } from "@/components/home/ContactSignup";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { Hero } from "@/components/home/Hero";
import { ShopByPrice } from "@/components/home/ShopByPrice";
import { WhyShopWithUs } from "@/components/home/WhyShopWithUs";
import { serverFetch } from "@/lib/serverApi";
import type { Category, Product } from "@/types";

export const metadata: Metadata = {
  title: "Authentic Elampillai Sarees & Handloom Weaves",
  description:
    "Explore pure silk, soft silk, and handloom cotton sarees direct from traditional weaver families in Elampillai, Tamil Nadu. Fast shipping across India.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Saree Grace — Authentic Elampillai Sarees",
    description:
      "Explore pure silk, soft silk, and handloom cotton sarees direct from traditional weaver families in Elampillai, Tamil Nadu.",
    url: "/",
    siteName: "Saree Grace",
    type: "website",
    images: [
      {
        url: "/saree_grace_logo.png",
        width: 1200,
        height: 630,
        alt: "Saree Grace — Authentic Elampillai Sarees",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saree Grace — Authentic Elampillai Sarees",
    description:
      "Explore pure silk, soft silk, and handloom cotton sarees direct from traditional weaver families in Elampillai, Tamil Nadu.",
    images: ["/saree_grace_logo.png"],
  },
};

export default async function HomePage() {
  const [categoriesData, featuredData] = await Promise.all([
    serverFetch<{ categories: Category[] }>("/categories"),
    serverFetch<{ products: Product[] }>("/products?sort=newest&limit=8"),
  ]);
  const initialCategories = categoriesData?.categories ?? [];
  const initialProducts = featuredData?.products ?? [];

  return (
    <main className="flex flex-1 flex-col gap-12 pb-12">
      <Hero />
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-heading text-maroon-900 text-2xl">Shop by category</h2>
          <Link
            href="/categories"
            className="text-maroon-700 hover:text-maroon-900 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <CategoryShowcase initialCategories={initialCategories} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-maroon-900 px-4 text-2xl">New arrivals</h2>
        <FeaturedCarousel initialProducts={initialProducts} />
      </section>
      <ShopByPrice />
      <WhyShopWithUs />
      <BestSellersCarousel />
      <BrandStory />
      <ContactSignup />
    </main>
  );
}
