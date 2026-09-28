import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { categoryHeading, getCategories, topLevelCategories } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Saree Categories — Silk, Cotton & Handloom Weaves",
  description:
    "Browse every Saree Grace category — bridal and soft silks, silk cottons, Kalyani and Kerala cottons, and couple saree & dhoti combos, all from Elampillai weavers.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = topLevelCategories(await getCategories());

  return (
    <main className="flex-1">
      <Breadcrumbs
        className="container-page"
        items={[
          { name: "Home", url: "/" },
          { name: "Categories", url: "/categories" },
        ]}
      />
      <header className="container-page pt-2 pb-10 lg:pb-14">
        <h1 className="text-heading-xl text-foreground">Shop by category</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-[15px] leading-relaxed">
          From everyday cottons to festive and bridal silks — find the weave that suits the
          occasion.
        </p>
      </header>

      {categories.length === 0 ? (
        <p className="container-page text-muted-foreground pb-24">
          Categories are unavailable right now.{" "}
          <Link href="/products" className="text-foreground underline underline-offset-2">
            Browse all sarees
          </Link>
          .
        </p>
      ) : (
        <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-10 pb-20 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:pb-28">
          {categories.map((category, index) => (
            <li key={category._id}>
              <Link href={`/categories/${category.slug}`} className="group block">
                <span className="bg-muted relative block aspect-[4/5] overflow-hidden rounded-md">
                  <Image
                    src={category.image?.url ?? "/placeholder.svg"}
                    alt=""
                    fill
                    preload={index < 2}
                    sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 48vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </span>
                <span className="font-display text-foreground group-hover:text-primary mt-4 block text-lg leading-snug transition-colors lg:text-xl">
                  {categoryHeading(category.name)}
                </span>
                {category.description ? (
                  <span className="text-muted-foreground mt-1.5 line-clamp-2 block text-sm leading-relaxed">
                    {category.description}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
