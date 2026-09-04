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
  { path: "/categories", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.4 },
  { path: "/shipping-policy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/refund-policy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.2 },
];

// Only public, indexable pages — never /account, /checkout, /admin, or auth pages, which are
// either private or already `noindex`'d on their own pages.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${env.NEXT_PUBLIC_SITE_URL}${route.path}`,
    lastModified: now,
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
      const primaryImage =
        product.images?.find((img) => img.isPrimary)?.url ?? product.images?.[0]?.url;

      productEntries.push({
        url: `${env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.7,
        images: primaryImage ? [primaryImage] : undefined,
      });
    }

    if (!body.meta?.nextCursor) break;
    cursor = body.meta.nextCursor;
  }

  const categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const catRes = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/categories`);
    if (catRes.ok) {
      const catBody = (await catRes.json()) as ApiSuccess<{
        categories: Array<{ slug: string; updatedAt?: string }>;
      }>;
      if (catBody.success && Array.isArray(catBody.data?.categories)) {
        for (const cat of catBody.data.categories) {
          categoryEntries.push({
            url: `${env.NEXT_PUBLIC_SITE_URL}/categories/${cat.slug}`,
            lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      }
    }
  } catch {
    // Non-blocking fallback if backend is unavailable during build
  }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
