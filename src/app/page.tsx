import { BrandStory } from "@/components/home/BrandStory";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { ContactSignup } from "@/components/home/ContactSignup";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { Hero } from "@/components/home/Hero";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-12 pb-12">
      <Hero />
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-maroon-900 px-4 text-2xl">New arrivals</h2>
        <FeaturedCarousel />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-maroon-900 px-4 text-2xl">Shop by category</h2>
        <CategoryShowcase />
      </section>
      <BrandStory />
      <ContactSignup />
    </main>
  );
}
