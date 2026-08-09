import { buildFormData } from "@/lib/formData";
import { baseApi } from "@/store/api/baseApi";
import type { ApiSuccess, Product, ProductSort, ProductType } from "@/types";

export interface ProductListFilters {
  cursor?: string;
  limit?: number;
  category?: string;
  // Comma-separated occasion ObjectIds (e.g. "<id1>,<id2>") — mirrors `category`'s requirement
  // of an ObjectId, not a slug, since there's no documented backend contract for this filter
  // yet (see productFilters.ts); confirm the actual param name/format against the backend.
  occasion?: string;
  fabric?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  handloomOnly?: boolean;
  inStockOnly?: boolean;
  sort?: ProductSort;
}

const DEFAULT_BEST_SELLERS_LIMIT = 10;

export interface ProductListResult {
  products: Product[];
  nextCursor: string | null;
}

function toQueryString(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

interface SimpleProductFields {
  name: string;
  description: string;
  category: string;
  occasions?: string[];
  fabric?: string;
  color?: string;
  isHandloom?: boolean;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
}

interface VariantShellFields {
  name: string;
  description: string;
  category: string;
  occasions?: string[];
  fabric?: string;
  color?: string;
  isHandloom?: boolean;
  variantAttributeNames: string[];
}

interface ProductVariantFields {
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stock: number;
}

interface UpdateProductFields {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  occasions?: string[];
  fabric?: string;
  color?: string;
  isHandloom?: boolean;
  isActive?: boolean;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  sku?: string;
  removeImagePublicIds?: string[];
  images?: File[];
}

interface UpdateProductVariantFields {
  productId: string;
  variantId: string;
  sku?: string;
  attributes?: Record<string, string>;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  isActive?: boolean;
  removeImagePublicIds?: string[];
  images?: File[];
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResult, ProductListFilters | undefined>({
      query: (filters) => `/products${toQueryString({ ...filters })}`,
      transformResponse: (response: ApiSuccess<{ products: Product[] }>) => ({
        products: response.data.products,
        nextCursor: response.meta?.nextCursor ?? null,
      }),
      providesTags: (result) => [
        { type: "Product", id: "LIST" },
        ...(result?.products.map((p) => ({ type: "Product" as const, id: p._id })) ?? []),
      ],
    }),
    searchProducts: builder.query<
      ProductListResult,
      { q: string; cursor?: string; limit?: number }
    >({
      query: ({ q, cursor, limit }) => `/products/search${toQueryString({ q, cursor, limit })}`,
      transformResponse: (response: ApiSuccess<{ products: Product[] }>) => ({
        products: response.data.products,
        nextCursor: response.meta?.nextCursor ?? null,
      }),
      providesTags: (result) =>
        result?.products.map((p) => ({ type: "Product" as const, id: p._id })) ?? [],
    }),
    getProductBySlug: builder.query<Product, string>({
      query: (slug) => `/products/${slug}`,
      transformResponse: (response: ApiSuccess<{ product: Product }>) => response.data.product,
      providesTags: (result) => (result ? [{ type: "Product", id: result._id }] : []),
    }),
    // Ranked list, not a cursor page — the backend already orders by sales, so this is returned
    // and rendered as-is, with no client-side re-sort and no "load more".
    getBestSellingProducts: builder.query<Product[], { limit?: number } | void>({
      query: (arg) =>
        `/products/best-sellers${toQueryString({ limit: arg?.limit ?? DEFAULT_BEST_SELLERS_LIMIT })}`,
      transformResponse: (response: ApiSuccess<{ products: Product[] }>) => response.data.products,
      providesTags: (result) =>
        result?.map((product) => ({ type: "Product" as const, id: product._id })) ?? [],
    }),
    createSimpleProduct: builder.mutation<Product, SimpleProductFields & { images?: File[] }>({
      query: ({ images, ...fields }) => ({
        url: "/admin/products",
        method: "POST",
        body: buildFormData({ ...fields, type: "simple" satisfies ProductType }, images),
      }),
      transformResponse: (response: ApiSuccess<{ product: Product }>) => response.data.product,
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    createVariantShellProduct: builder.mutation<Product, VariantShellFields>({
      query: ({ variantAttributeNames, ...fields }) => ({
        url: "/admin/products",
        method: "POST",
        body: buildFormData({
          ...fields,
          type: "variant" satisfies ProductType,
          variantAttributeNames: variantAttributeNames.join(","),
        }),
      }),
      transformResponse: (response: ApiSuccess<{ product: Product }>) => response.data.product,
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    addProductVariant: builder.mutation<
      Product,
      { productId: string; variant: ProductVariantFields; images?: File[] }
    >({
      query: ({ productId, variant, images }) => ({
        url: `/admin/products/${productId}/variants`,
        method: "POST",
        body: buildFormData({ ...variant }, images),
      }),
      transformResponse: (response: ApiSuccess<{ product: Product }>) => response.data.product,
      invalidatesTags: (_result, _error, { productId }) => [{ type: "Product", id: productId }],
    }),
    updateProduct: builder.mutation<Product, UpdateProductFields>({
      query: ({ id, images, ...fields }) => ({
        url: `/admin/products/${id}`,
        method: "PUT",
        body: buildFormData({ ...fields }, images),
      }),
      transformResponse: (response: ApiSuccess<{ product: Product }>) => response.data.product,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),
    updateProductVariant: builder.mutation<Product, UpdateProductVariantFields>({
      query: ({ productId, variantId, images, ...fields }) => ({
        url: `/admin/products/${productId}/variants/${variantId}`,
        method: "PATCH",
        body: buildFormData({ ...fields }, images),
      }),
      transformResponse: (response: ApiSuccess<{ product: Product }>) => response.data.product,
      invalidatesTags: (_result, _error, { productId }) => [{ type: "Product", id: productId }],
    }),
    deleteProduct: builder.mutation<{ message: string }, { id: string }>({
      query: ({ id }) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      transformResponse: (response: ApiSuccess<{ message: string }>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),
    deleteProductVariant: builder.mutation<Product, { productId: string; variantId: string }>({
      query: ({ productId, variantId }) => ({
        url: `/admin/products/${productId}/variants/${variantId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiSuccess<{ product: Product }>) => response.data.product,
      invalidatesTags: (_result, _error, { productId }) => [{ type: "Product", id: productId }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetProductBySlugQuery,
  useGetBestSellingProductsQuery,
  useCreateSimpleProductMutation,
  useCreateVariantShellProductMutation,
  useAddProductVariantMutation,
  useUpdateProductMutation,
  useUpdateProductVariantMutation,
  useDeleteProductMutation,
  useDeleteProductVariantMutation,
} = productsApi;
