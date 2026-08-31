import type { Metadata } from "next";
import Link from "next/link";

import { BestSellersCarousel } from "@/components/home/BestSellersCarousel";
import { BrandStory } from "@/components/home/BrandStory";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { ContactSignup } from "@/components/home/ContactSignup";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { Hero } from "@/components/home/Hero";
import { OccasionShowcase } from "@/components/home/OccasionShowcase";
import { ShopByPrice } from "@/components/home/ShopByPrice";
import { WhyShopWithUs } from "@/components/home/WhyShopWithUs";

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
  },
};

export default function HomePage() {
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
        <CategoryShowcase />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-maroon-900 px-4 text-2xl">New arrivals</h2>
        <FeaturedCarousel />
      </section>
      <ShopByPrice />
      <section className="flex flex-col gap-4">
        <div className="px-4">
          <h2 className="font-heading text-maroon-900 text-2xl">Shop by Occasion</h2>
          <p className="text-maroon-600 mt-1 text-sm">
            Find the right saree for wherever you&apos;re headed
          </p>
        </div>
        <OccasionShowcase />
      </section>
      <WhyShopWithUs />
      <BestSellersCarousel />
      <BrandStory />
      <ContactSignup />
    </main>
  );
}
