"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "@/lib/toast";
import { downloadTextFile, useExportProductsCsvMutation } from "@/store/api/productImportApi";
import { useDeleteProductMutation, useGetProductsQuery } from "@/store/api/productsApi";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const { data, isLoading, isFetching } = useGetProductsQuery({
    cursor,
    limit: 20,
    sort: "newest",
  });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [exportProductsCsv, { isLoading: isExporting }] = useExportProductsCsvMutation();

  const seenIds = new Set(products.map((p) => p._id));
  const merged =
    data && cursor !== undefined
      ? [...products, ...data.products.filter((p) => !seenIds.has(p._id))]
      : (data?.products ?? products);

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct({ id: product._id }).unwrap();
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      toast.success("Product deleted");
    } catch {
      toast.error("Couldn't delete this product.");
    }
  }

  async function handleExport() {
    try {
      const file = await exportProductsCsv().unwrap();
      downloadTextFile(file.csv, file.filename);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error as FetchBaseQueryError | SerializedError,
          "Couldn't export products.",
        ),
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-maroon-900 text-2xl">Products</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            isLoading={isExporting}
            disabled={isExporting}
          >
            Export CSV
          </Button>
          <Link
            href="/admin/products/import"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Import CSV
          </Link>
          <Link
            href="/admin/products/new?type=simple"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            New simple product
          </Link>
          <Link
            href="/admin/products/new?type=variant"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            New variant product
          </Link>
        </div>
      </div>

      {/* Only products with isActive: true appear here — this list (and the editor's by-slug
          lookup) uses the public endpoints, which filter out inactive products. This page still
          has no "deactivate" action, but a CSV import can hide products (productActive = FALSE)
          and variants. They aren't stranded: Export CSV includes inactive products, so setting
          productActive back to TRUE and re-importing brings one back. */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : merged.length === 0 ? (
        <p className="text-maroon-600 text-sm">No products yet.</p>
      ) : (
        <div className="divide-maroon-50 border-maroon-50 flex flex-col divide-y rounded-lg border bg-white">
          {merged.map((product) => (
            <div key={product._id} className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="text-maroon-900 font-medium">{product.name}</p>
                <p className="text-maroon-600 text-sm">
                  {product.type === "simple"
                    ? `${formatPrice(product.price ?? 0)} · stock ${product.stock ?? 0}`
                    : `From ${formatPrice(product.startingPrice)} · ${(product.variants ?? []).length} variants`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {product.isHandloom ? <Badge variant="gold">Handloom</Badge> : null}
                <Link
                  href={`/admin/products/${product.slug}/edit`}
                  className="text-maroon-700 text-sm font-medium underline"
                >
                  Edit
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(product)}
                  isLoading={isDeleting}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.nextCursor ? (
        <Button
          variant="ghost"
          onClick={() => {
            setProducts(merged);
            setCursor(data.nextCursor ?? undefined);
          }}
          isLoading={isFetching}
          disabled={isFetching}
          className="w-fit"
        >
          Load more
        </Button>
      ) : null}
    </div>
  );
}
