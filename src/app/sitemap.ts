import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import type { ApiSuccess, Product } from "@/types";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
];

// Only public, indexable pages — never /account, /checkout, /admin, or auth pages, which are
// either private or already `noindex`'d on their own pages.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${env.NEXT_PUBLIC_SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productEntries: MetadataRoute.Sitemap = [];
  let cursor: string | undefined;

  // Bounded to a fixed number of pages so a very large catalog can't hang the build indefinitely.
  for (let page = 0; page < 20; page++) {
    const query = cursor ? `?limit=50&cursor=${cursor}` : "?limit=50";
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/products${query}`);
    if (!res.ok) break;

    const body = (await res.json()) as ApiSuccess<{ products: Product[] }>;
    if (!body.success) break;

    for (const product of body.data.products) {
      productEntries.push({
        url: `${env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    if (!body.meta?.nextCursor) break;
    cursor = body.meta.nextCursor;
  }

  return [...staticEntries, ...productEntries];
}
