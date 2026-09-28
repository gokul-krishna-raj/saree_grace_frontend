import { cache } from "react";

import { serverFetch } from "@/lib/serverApi";
import type { Category, Occasion, ProductFacets } from "@/types";

// Server-only catalog reads shared by the root layout (header/footer navigation), the homepage
// and category pages. `fetch` results are already cached by `serverFetch`'s `revalidate`; React
// `cache` additionally dedupes the call within one render pass.
//
// Navigation data is non-critical: if the backend is unreachable the page still renders (without
// category links) instead of failing the whole layout.
export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const data = await serverFetch<{ categories: Category[] }>("/categories", 300);
    return data?.categories ?? [];
  } catch {
    return [];
  }
});

export function topLevelCategories(categories: Category[]): Category[] {
  return categories.filter((category) => category.parentCategory === null);
}

export const getOccasions = cache(async (): Promise<Occasion[]> => {
  try {
    const data = await serverFetch<{ occasions: Occasion[] }>("/occasions", 300);
    return (data?.occasions ?? []).filter((occasion) => occasion.isActive);
  } catch {
    return [];
  }
});

// "Cotton Sarees" → "Cotton Sarees"; "Bridal" → "Bridal Sarees". Category names in the catalog
// usually already end in "Sarees"; blindly appending produced "Cotton Sarees Sarees".
export function categoryHeading(name: string): string {
  return /\bsarees?\b/i.test(name) ? name : `${name} Sarees`;
}

// Filter options (colours/fabrics) that exist in the live catalogue for a listing's base scope.
// Non-critical: on failure the listing simply renders without those filter sections.
export const getProductFacets = cache(
  async (categoryId?: string): Promise<ProductFacets | undefined> => {
    try {
      const query = categoryId ? `?category=${encodeURIComponent(categoryId)}` : "";
      return (await serverFetch<ProductFacets>(`/products/facets${query}`, 300)) ?? undefined;
    } catch {
      return undefined;
    }
  },
);
