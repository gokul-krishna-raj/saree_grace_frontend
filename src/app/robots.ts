import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Private, transactional and auth areas — nothing worth indexing, and most of it
        // redirects a logged-out crawler anyway (each page is also `noindex` on its own).
        "/account",
        "/admin",
        "/cart",
        "/checkout",
        "/wishlist",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-otp",
        "/style-guide",
        // Internal search results and faceted/sorted listing URLs: the same products
        // re-ordered or narrowed. Their canonical is the clean listing URL; blocking the
        // parameter combinations keeps crawl budget on real pages.
        "/*?*q=",
        "/*?*search=",
        "/*?*cursor=",
        "/*?*sort=",
        "/*?*minPrice=",
        "/*?*maxPrice=",
        "/*?*inStock=",
        "/*?*occasion=",
        "/*?*fabric=",
        "/*?*color=",
      ],
    },
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
