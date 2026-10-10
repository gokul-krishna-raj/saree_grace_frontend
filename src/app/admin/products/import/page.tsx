"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Link from "next/link";
import { type ChangeEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { toCsv } from "@/lib/csv";
import { toast } from "@/lib/toast";
import {
  downloadTextFile,
  IMPORT_COMMIT_BATCH_SIZE,
  MAX_IMPORT_FILE_BYTES,
  type ProductImportAction,
  type ProductImportPlan,
  type ProductImportPreview,
  type ProductImportResult,
  type ProductImportStatus,
  useCommitProductImportMutation,
  useGetProductImportTemplateMutation,
  usePreviewProductImportMutation,
} from "@/store/api/productImportApi";

type ApiError = FetchBaseQueryError | SerializedError;
type FilterTab = "changes" | "errors" | "all";

const TABS: Array<{ id: FilterTab; label: string }> = [
  { id: "changes", label: "Changes" },
  { id: "errors", label: "Errors" },
  { id: "all", label: "All" },
];

const ACTION_BADGE: Record<ProductImportAction, { label: string; variant: BadgeProps["variant"] }> =
  {
    create: { label: "New", variant: "royal" },
    update: { label: "Update", variant: "gold" },
    unchanged: { label: "No change", variant: "outline" },
    error: { label: "Error", variant: "danger" },
  };

const RESULT_BADGE: Record<ProductImportStatus, { label: string; variant: BadgeProps["variant"] }> =
  {
    created: { label: "Created", variant: "maroon" },
    updated: { label: "Updated", variant: "maroon" },
    unchanged: { label: "No change", variant: "outline" },
    failed: { label: "Failed", variant: "danger" },
    skipped: { label: "Skipped", variant: "secondary" },
  };

function isImportable(product: ProductImportPlan) {
  return product.action === "create" || product.action === "update";
}

function matchesTab(product: ProductImportPlan, tab: FilterTab) {
  if (tab === "errors") return product.action === "error";
  if (tab === "changes") return isImportable(product);
  return true;
}

// [2, 3, 4] → "Rows 2–4", [5] → "Row 5", [2, 7] → "Rows 2, 7".
function formatRows(rows: number[]) {
  if (rows.length === 1) return `Row ${rows[0]}`;
  const first = rows[0] ?? 0;
  const contiguous = rows.every((row, index) => row === first + index);
  return contiguous ? `Rows ${first}–${rows[rows.length - 1]}` : `Rows ${rows.join(", ")}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}

function ImportProductCard({
  product,
  result,
}: {
  product: ProductImportPlan;
  result?: ProductImportResult;
}) {
  const action = ACTION_BADGE[product.action];
  const resultBadge = result ? RESULT_BADGE[result.status] : null;
  const editorSlug = result?.slug;

  return (
    <li className="border-maroon-50 flex flex-col gap-2 rounded-lg border bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-maroon-900 font-medium break-words">{product.name || "(no name)"}</p>
          <p className="text-maroon-600 text-xs break-all">
            {product.handle || "new handle"} · {product.type || "unknown type"} ·{" "}
            {formatRows(product.rows)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant={action.variant}>{action.label}</Badge>
          {resultBadge ? <Badge variant={resultBadge.variant}>{resultBadge.label}</Badge> : null}
        </div>
      </div>

      {product.errors.length > 0 ? (
        <ul className="text-sale list-disc space-y-0.5 pl-5 text-sm">
          {product.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      {product.changes.length > 0 ? (
        <ul className="text-maroon-800 list-disc space-y-0.5 pl-5 text-sm">
          {product.changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      ) : null}
      {product.warnings.length > 0 ? (
        <ul className="text-gold-700 list-disc space-y-0.5 pl-5 text-sm">
          {product.warnings.map((warning) => (
            <li key={warning}>Warning: {warning}</li>
          ))}
        </ul>
      ) : null}

      {result?.error ? <p className="text-sale text-sm">{result.error}</p> : null}
      {editorSlug && result?.status !== "failed" && result?.status !== "skipped" ? (
        <Link
          href={`/admin/products/${editorSlug}/edit`}
          className="text-maroon-700 w-fit text-sm font-medium underline"
        >
          Open in editor
        </Link>
      ) : null}
    </li>
  );
}

export default function ImportProductsPage() {
  const fileInputId = useId();
  const tabPanelId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [fileName, setFileName] = useState<string | null>(null);
  const [csv, setCsv] = useState<string | null>(null);
  const [preview, setPreview] = useState<ProductImportPreview | null>(null);
  const [tab, setTab] = useState<FilterTab>("changes");
  const [results, setResults] = useState<Map<string, ProductImportResult>>(new Map());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [downloadTemplate, { isLoading: isDownloadingTemplate }] =
    useGetProductImportTemplateMutation();
  const [previewImport, { isLoading: isPreviewing }] = usePreviewProductImportMutation();
  const [commitImport] = useCommitProductImportMutation();

  const isBusy = isPreviewing || isImporting;
  const hasResults = results.size > 0;

  // Leaving mid-import would abandon the remaining batches — ask first.
  useEffect(() => {
    if (!isImporting) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isImporting]);

  async function handleDownloadTemplate() {
    try {
      const file = await downloadTemplate().unwrap();
      downloadTextFile(file.csv, file.filename);
    } catch (error) {
      toast.error(getApiErrorMessage(error as ApiError, "Couldn't download the template."));
    }
  }

  async function runPreview(text: string) {
    try {
      const data = await previewImport({ csv: text }).unwrap();
      setPreview(data);
      setResults(new Map());
      setProgress(null);
      setTab(data.summary.error > 0 ? "errors" : "changes");
    } catch (error) {
      setPreview(null);
      toast.error(getApiErrorMessage(error as ApiError, "Couldn't check this file."));
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so choosing the same (edited) file again still fires a change event.
    event.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Choose a .csv file — in Excel or Google Sheets, save or download as CSV.");
      return;
    }
    if (file.size > MAX_IMPORT_FILE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`This file is ${sizeMb}MB — the limit is 1.5MB. Split it into smaller files.`);
      return;
    }

    const text = await file.text();
    setFileName(file.name);
    setCsv(text);
    setPreview(null);
    await runPreview(text);
  }

  async function handleImport() {
    if (!csv || !preview) return;
    const keys = preview.products.filter(isImportable).map((p) => p.key);
    if (keys.length === 0) return;

    const collected = new Map<string, ProductImportResult>();
    setIsImporting(true);
    setProgress({ done: 0, total: keys.length });

    let done = 0;
    // Sequential batches keep each request well inside the API's time limit; a batch that fails
    // outright (network, timeout) only marks its own products as failed.
    for (const batch of chunk(keys, IMPORT_COMMIT_BATCH_SIZE)) {
      try {
        const { results: batchResults } = await commitImport({ csv, keys: batch }).unwrap();
        for (const result of batchResults) collected.set(result.key, result);
      } catch (error) {
        const message = getApiErrorMessage(
          error as ApiError,
          "This batch didn't go through. Preview the file again and retry.",
        );
        for (const key of batch) collected.set(key, { key, status: "failed", error: message });
      }
      done += batch.length;
      setResults(new Map(collected));
      setProgress({ done, total: keys.length });
    }
    setIsImporting(false);

    const failed = [...collected.values()].filter(
      (r) => r.status === "failed" || r.status === "skipped",
    ).length;
    if (failed > 0) {
      toast.error(`${failed} product${failed === 1 ? "" : "s"} couldn't be imported.`);
    } else {
      toast.success("Import complete.");
    }
  }

  function handleDownloadProblems() {
    if (!preview) return;
    const rows: Array<Array<string | number>> = [["handle", "name", "rows", "problem"]];
    for (const product of preview.products) {
      const base = [product.handle, product.name, product.rows.join(" ")];
      for (const error of product.errors) rows.push([...base, error]);
      for (const warning of product.warnings) rows.push([...base, `Warning: ${warning}`]);
      const result = results.get(product.key);
      if (result?.error) rows.push([...base, `Import ${result.status}: ${result.error}`]);
    }
    downloadTextFile(toCsv(rows), "sareegrace-import-problems.csv");
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = TABS.findIndex((t) => t.id === tab);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    const nextTab = TABS[next];
    if (!nextTab) return;
    setTab(nextTab.id);
    tabRefs.current[next]?.focus();
  }

  const importable = preview?.products.filter(isImportable) ?? [];
  const visible = preview?.products.filter((p) => matchesTab(p, tab)) ?? [];
  const tabCounts: Record<FilterTab, number> = {
    changes: importable.length,
    errors: preview?.summary.error ?? 0,
    all: preview?.summary.products ?? 0,
  };
  const hasProblems =
    !!preview &&
    (preview.products.some((p) => p.errors.length > 0 || p.warnings.length > 0) ||
      [...results.values()].some((r) => r.error));

  const resultCounts = [...results.values()].reduce<Record<ProductImportStatus, number>>(
    (acc, r) => ({ ...acc, [r.status]: acc[r.status] + 1 }),
    { created: 0, updated: 0, unchanged: 0, failed: 0, skipped: 0 },
  );

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/admin/products" className="text-maroon-700 w-fit text-sm underline">
          ← Products
        </Link>
        <h1 className="font-heading text-maroon-900 text-2xl">Import products</h1>
      </div>

      <section
        aria-labelledby="import-how-heading"
        className="border-maroon-50 flex flex-col gap-3 rounded-lg border bg-white p-4"
      >
        <h2 id="import-how-heading" className="text-maroon-900 font-medium">
          How it works
        </h2>
        <ol className="text-maroon-700 list-decimal space-y-1 pl-5 text-sm">
          <li>
            Export your catalogue from the Products page (or download the template) and edit it in
            Excel or Google Sheets.
          </li>
          <li>
            One row per SKU. A variant product has one row per variant, all with the same{" "}
            <code>handle</code>; product details only need to be on its first row.
          </li>
          <li>
            A blank cell keeps the current value. Nothing is ever deleted — set{" "}
            <code>productActive</code> or <code>variantActive</code> to FALSE to hide something.
          </li>
          <li>
            Save as <strong>CSV UTF-8</strong>, choose the file below, check the preview, then
            import.
          </li>
        </ol>
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={handleDownloadTemplate}
          isLoading={isDownloadingTemplate}
          disabled={isDownloadingTemplate || isBusy}
        >
          Download template
        </Button>
      </section>

      <section className="border-maroon-50 flex flex-col gap-2 rounded-lg border bg-white p-4">
        <label htmlFor={fileInputId} className="text-maroon-900 font-medium">
          CSV file
        </label>
        <input
          id={fileInputId}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={isBusy}
          aria-describedby={`${fileInputId}-hint`}
          className="text-maroon-800 file:border-maroon-200 file:text-maroon-900 hover:file:bg-maroon-50 text-sm file:mr-3 file:rounded-md file:border file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium disabled:opacity-50"
        />
        <p id={`${fileInputId}-hint`} className="text-maroon-600 text-xs">
          Up to 1.5MB and 2000 rows. {fileName ? `Selected: ${fileName}` : null}
        </p>
        {isPreviewing ? (
          <p role="status" className="text-maroon-700 text-sm">
            Checking your file…
          </p>
        ) : null}
      </section>

      {preview ? (
        <section aria-labelledby="import-preview-heading" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="import-preview-heading" className="text-maroon-900 font-medium">
              Preview
            </h2>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline">{preview.summary.products} total</Badge>
              <Badge variant="royal">{preview.summary.create} new</Badge>
              <Badge variant="gold">{preview.summary.update} update</Badge>
              <Badge variant="outline">{preview.summary.unchanged} unchanged</Badge>
              <Badge variant={preview.summary.error > 0 ? "danger" : "outline"}>
                {preview.summary.error} errors
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!hasResults ? (
              <Button
                onClick={handleImport}
                isLoading={isImporting}
                disabled={isBusy || importable.length === 0}
              >
                Import {importable.length} product{importable.length === 1 ? "" : "s"}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => csv && runPreview(csv)}
                disabled={isBusy || !csv}
              >
                Preview again
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleDownloadProblems}
              disabled={!hasProblems || isImporting}
            >
              Download problems as CSV
            </Button>
          </div>
          {preview.summary.error > 0 && !hasResults ? (
            <p className="text-maroon-600 text-sm">
              Products with errors are skipped. Fix them in your spreadsheet and upload the file
              again to import them too.
            </p>
          ) : null}

          {progress ? (
            <div className="flex flex-col gap-1">
              <div
                role="progressbar"
                aria-label="Import progress"
                aria-valuemin={0}
                aria-valuemax={progress.total}
                aria-valuenow={progress.done}
                className="bg-maroon-50 h-2 w-full overflow-hidden rounded-full"
              >
                <div
                  className="bg-primary h-full transition-[width] duration-300"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-maroon-700 text-sm" aria-live="polite">
                {isImporting
                  ? `Importing… ${progress.done} of ${progress.total}`
                  : `Done: ${resultCounts.created} created, ${resultCounts.updated} updated, ${
                      resultCounts.failed + resultCounts.skipped
                    } failed${
                      resultCounts.unchanged > 0 ? `, ${resultCounts.unchanged} unchanged` : ""
                    }.`}
              </p>
            </div>
          ) : null}

          <div
            role="tablist"
            aria-label="Filter products"
            onKeyDown={handleTabKeyDown}
            className="border-maroon-100 flex gap-1 border-b"
          >
            {TABS.map((t, index) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`${tabPanelId}-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={tabPanelId}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={cn(
                  "focus-visible:ring-ring -mb-px border-b-2 px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none",
                  tab === t.id
                    ? "border-maroon-900 text-maroon-900"
                    : "text-maroon-600 hover:text-maroon-900 border-transparent",
                )}
              >
                {t.label} ({tabCounts[t.id]})
              </button>
            ))}
          </div>

          <div id={tabPanelId} role="tabpanel" aria-labelledby={`${tabPanelId}-${tab}`}>
            {visible.length === 0 ? (
              <p className="text-maroon-600 text-sm">
                {tab === "errors"
                  ? "No errors in this file."
                  : tab === "changes"
                    ? "Nothing to import — every product in this file already matches the store."
                    : "This file has no products."}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {visible.map((product) => (
                  <ImportProductCard
                    key={product.key}
                    product={product}
                    result={results.get(product.key)}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
