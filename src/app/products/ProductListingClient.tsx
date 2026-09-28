"use client";

import { ActiveFilters } from "@/components/product/ActiveFilters";
import { FilterDrawer } from "@/components/product/FilterDrawer";
import { FilterPanel } from "@/components/product/FilterPanel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchBar } from "@/components/product/SearchBar";
import { SortSelect } from "@/components/product/SortSelect";
import {
  ListingParamsContext,
  ListingParamsFromUrl,
  useListingParams,
} from "@/hooks/useProductFilters";
import {
  hasListingParams,
  parseProductFilters,
  toApiFilters,
} from "@/lib/validation/productFilters";
import { useGetProductFacetsQuery } from "@/store/api/productsApi";
import type { Category, Occasion, Product, ProductFacets } from "@/types";

interface ProductListingClientProps {
  initialProducts?: Product[];
  /** Cursor for the page after `initialProducts` (null = that was the last page). */
  initialNextCursor?: string | null;
  fixedCategory?: string;
  activeCategorySlug?: string;
  categories?: Category[];
  occasions?: Occasion[];
  showSearch?: boolean;
  /** Facets for the unfiltered page, fetched on the server. */
  initialFacets?: ProductFacets;
}

const EMPTY_PARAMS = new URLSearchParams();

// Live listing: filters/sort/search come from the URL.
export function ProductListingClient(props: ProductListingClientProps) {
  return (
    <ListingParamsFromUrl>
      <ProductListing {...props} />
    </ListingParamsFromUrl>
  );
}

// The same listing for the page's default URL, used as the Suspense fallback so the server HTML
// (and ISR cache) contains the real product grid instead of a skeleton. It swaps to the live
// listing on hydration — identical markup for an unfiltered URL.
export function ProductListingStatic(props: ProductListingClientProps) {
  return (
    <ListingParamsContext.Provider value={EMPTY_PARAMS}>
      <ProductListing {...props} />
    </ListingParamsContext.Provider>
  );
}

function ProductListing({
  initialProducts,
  initialNextCursor,
  fixedCategory,
  activeCategorySlug,
  categories = [],
  occasions = [],
  showSearch = false,
  initialFacets,
}: ProductListingClientProps = {}) {
  const searchParams = useListingParams();
  const filters = parseProductFilters(searchParams);
  if (fixedCategory) {
    filters.category = fixedCategory;
  }
  // Remount the grid+its infinite-scroll state whenever the filter set changes, instead of
  // reconciling it internally — see useInfiniteProducts.ts for why.
  const filtersKey = JSON.stringify(filters);

  // Server-fetched first page is only valid for the unfiltered view of this page.
  const isDefaultView = !hasListingParams(searchParams.keys());
  const initialItems = isDefaultView ? initialProducts : undefined;

  // Facet counts only need a client request once a filter is active — the unfiltered page's
  // facets come from the server. (The backend ignores a facet's own selection, so ticking
  // colours never empties the colour list.)
  const facetFilters = { ...toApiFilters(filters), sort: undefined };
  const needsLiveFacets =
    facetFilters.minPrice !== undefined ||
    facetFilters.maxPrice !== undefined ||
    Boolean(facetFilters.inStockOnly) ||
    Boolean(facetFilters.occasion) ||
    Boolean(facetFilters.color) ||
    Boolean(facetFilters.fabric);
  const { currentData: liveFacets } = useGetProductFacetsQuery(facetFilters, {
    skip: !needsLiveFacets,
  });
  const facets = needsLiveFacets ? (liveFacets ?? initialFacets) : initialFacets;

  return (
    <div className="container-page pb-16 lg:pb-24">
      <div className="lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        <aside
          aria-label="Filters"
          className="hidden lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:block lg:max-h-[calc(100dvh-var(--header-height)-3rem)] lg:self-start lg:overflow-y-auto lg:pr-2"
        >
          <FilterPanel
            categories={categories}
            occasions={occasions}
            activeCategorySlug={activeCategorySlug}
            facets={facets}
          />
        </aside>

        <div>
          <div className="bg-background border-border sticky top-[var(--header-height)] z-20 -mx-4 mb-5 border-b px-4 py-2.5 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-6 lg:flex lg:items-center lg:justify-between lg:gap-6 lg:border-b-0 lg:px-0 lg:py-0">
            {showSearch ? (
              <div className="hidden lg:block lg:flex-1">
                <SearchBar />
              </div>
            ) : (
              <div className="hidden lg:block" />
            )}
            <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-0">
              <FilterDrawer
                categories={categories}
                occasions={occasions}
                activeCategorySlug={activeCategorySlug}
                facets={facets}
              />
              <SortSelect />
            </div>
          </div>
          {showSearch ? (
            <div className="mb-5 lg:hidden">
              <SearchBar />
            </div>
          ) : null}
          <ActiveFilters occasions={occasions} facets={facets} />
          <ProductGrid
            key={filtersKey}
            filters={filters}
            initialItems={initialItems}
            initialNextCursor={isDefaultView ? initialNextCursor : undefined}
          />
        </div>
      </div>
    </div>
  );
}
