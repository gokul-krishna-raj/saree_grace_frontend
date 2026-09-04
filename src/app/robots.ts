import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private/account-scoped, auth, and admin areas — none of this is content worth indexing, and
      // most of it 404s or redirects for a logged-out crawler anyway.
      disallow: ["/account", "/checkout", "/admin", "/cart", "/login", "/register"],
    },
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
