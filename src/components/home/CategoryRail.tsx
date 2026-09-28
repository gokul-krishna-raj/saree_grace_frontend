import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Category } from "@/types";

const DESKTOP_LIMIT = 6;

// Server-rendered: category links are in the initial HTML (internal linking for crawlers) and no
// client JS runs for this section. Phones get a swipeable rail of every category; larger screens
// get a 6-up grid, with the rest one click away.
export function CategoryRail({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="home-categories" className="section-y">
      <div className="container-page">
        <SectionHeading
          id="home-categories"
          eyebrow="Shop by category"
          title="Find your weave"
          description="From featherlight Kalyani cottons to bridal soft silks — every category is woven by hand in and around Elampillai."
          action={{ href: "/categories", label: "All categories" }}
        />
      </div>
      <ul className="scrollbar-hide container-page flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto sm:scroll-px-6 lg:grid lg:snap-none lg:grid-cols-6 lg:gap-5 lg:overflow-visible">
        {categories.map((category, index) => (
          <li
            key={category._id}
            className={`w-[42%] shrink-0 snap-start sm:w-[28%] lg:w-auto ${index >= DESKTOP_LIMIT ? "lg:hidden" : ""}`}
          >
            <Link href={`/categories/${category.slug}`} className="group block">
              <span className="bg-muted relative block aspect-[3/4] overflow-hidden rounded-md">
                <Image
                  src={category.image?.url ?? "/placeholder.svg"}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 15vw, (min-width: 640px) 28vw, 42vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              </span>
              <span className="text-foreground group-hover:text-primary mt-3 block text-[15px] leading-snug transition-colors">
                {category.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
