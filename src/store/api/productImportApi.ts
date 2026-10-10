import type { FetchBaseQueryMeta } from "@reduxjs/toolkit/query/react";

import { baseApi } from "@/store/api/baseApi";
import type { ApiSuccess } from "@/types";

// Must match the backend limits (product.validation.ts / product-io.service.ts).
export const MAX_IMPORT_FILE_BYTES = 1.5 * 1024 * 1024;
export const IMPORT_COMMIT_BATCH_SIZE = 10;

export type ProductImportAction = "create" | "update" | "unchanged" | "error";

export interface ProductImportPlan {
  key: string;
  handle: string;
  name: string;
  type: "simple" | "variant" | "";
  action: ProductImportAction;
  rows: number[];
  changes: string[];
  warnings: string[];
  errors: string[];
}

export interface ProductImportPreview {
  summary: { products: number; create: number; update: number; unchanged: number; error: number };
  products: ProductImportPlan[];
}

export type ProductImportStatus = "created" | "updated" | "unchanged" | "failed" | "skipped";

export interface ProductImportResult {
  key: string;
  status: ProductImportStatus;
  slug?: string;
  error?: string;
}

export interface CsvDownload {
  csv: string;
  filename: string;
}

// CSV endpoints answer with text on success but our usual JSON error body on failure — parse
// accordingly so getApiErrorMessage() still finds `error.message` on a failed download.
async function textOrJson(response: Response): Promise<unknown> {
  const body = await response.text();
  if (response.ok) return body;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}

function filenameFromMeta(meta: unknown, fallback: string): string {
  const header = (meta as FetchBaseQueryMeta | undefined)?.response?.headers.get(
    "Content-Disposition",
  );
  return header?.match(/filename="?([^";]+)"?/i)?.[1] ?? fallback;
}

/**
 * Saves text as a file via a temporary Blob link. Prepends a UTF-8 BOM by default (Excel needs
 * it to show ₹ and Tamil text correctly, and `response.text()` strips the one the server sent).
 */
export function downloadTextFile(
  content: string,
  filename: string,
  { type = "text/csv;charset=utf-8", bom = true }: { type?: string; bom?: boolean } = {},
) {
  const text = bom && !content.startsWith("﻿") ? `﻿${content}` : content;
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking synchronously can cancel the download before the browser has started it.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const productImportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Downloads are mutations, not queries, so a stale export is never served from the cache.
    exportProductsCsv: builder.mutation<CsvDownload, void>({
      query: () => ({ url: "/admin/products/export", responseHandler: textOrJson }),
      transformResponse: (csv: string, meta) => ({
        csv,
        filename: filenameFromMeta(meta, "sareegrace-products.csv"),
      }),
    }),
    getProductImportTemplate: builder.mutation<CsvDownload, void>({
      query: () => ({ url: "/admin/products/import/template", responseHandler: textOrJson }),
      transformResponse: (csv: string, meta) => ({
        csv,
        filename: filenameFromMeta(meta, "sareegrace-products-template.csv"),
      }),
    }),
    previewProductImport: builder.mutation<ProductImportPreview, { csv: string }>({
      query: (body) => ({ url: "/admin/products/import/preview", method: "POST", body }),
      transformResponse: (response: ApiSuccess<ProductImportPreview>) => response.data,
    }),
    commitProductImport: builder.mutation<
      { results: ProductImportResult[] },
      { csv: string; keys: string[] }
    >({
      query: (body) => ({ url: "/admin/products/import/commit", method: "POST", body }),
      transformResponse: (response: ApiSuccess<{ results: ProductImportResult[] }>) =>
        response.data,
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useExportProductsCsvMutation,
  useGetProductImportTemplateMutation,
  usePreviewProductImportMutation,
  useCommitProductImportMutation,
} = productImportApi;
