import type { Metadata } from "next";

import { env } from "@/lib/env";
import { toPlainText } from "@/lib/plainText";

export const SITE_NAME = "Saree Grace";

const BRAND_SUFFIX = /\s*[|—–-]\s*Saree Grace\s*$/i;

// Admin-entered SEO titles often already end in "| Saree Grace"; the root layout's title template
// appends it too, which produced "… | Saree Grace | Saree Grace". Strip it once here and let the
// template add it back.
export function stripBrand(title: string): string {
  return title.replace(BRAND_SUFFIX, "").trim();
}

export function brandedTitle(title: string): string {
  return `${stripBrand(title)} | ${SITE_NAME}`;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${env.NEXT_PUBLIC_SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function truncateDescription(text: string, max = 158): string {
  const clean = toPlainText(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "")}…`;
}

// Share image for pages without one of their own. A page-level `openGraph` object replaces the
// root layout's entirely (Next merges metadata shallowly), so the default must be set here.
const DEFAULT_SHARE_IMAGE = { url: "/saree_grace_logo.png", width: 1200, height: 630 };

// Canonical, OG and Twitter tags built from one input so they can never disagree.
export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
}): Metadata {
  const cleanTitle = stripBrand(title);
  const images = image
    ? [{ url: image, alt: imageAlt ?? cleanTitle }]
    : [{ ...DEFAULT_SHARE_IMAGE, alt: "Saree Grace — Authentic Elampillai Sarees" }];
  // Admin-entered SEO descriptions can run long; search engines cut them off mid-word anyway.
  const metaDescription = truncateDescription(description, 160);
  return {
    title: cleanTitle,
    description: metaDescription,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url: path,
      title: brandedTitle(cleanTitle),
      description: metaDescription,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle(cleanTitle),
      description: metaDescription,
      images: [images[0]!.url],
    },
  };
}
