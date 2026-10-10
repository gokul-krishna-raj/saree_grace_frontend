import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type {
  ProductImportPlan,
  ProductImportPreview,
  ProductImportResult,
} from "@/store/api/productImportApi";

import ImportProductsPage from "./page";

// jsdom doesn't implement Blob.text() (every supported browser does).
if (!Blob.prototype.text) {
  Blob.prototype.text = function text(this: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}

const toastError = jest.fn();
const toastSuccess = jest.fn();
jest.mock("@/lib/toast", () => ({
  toast: {
    error: (message: string) => toastError(message),
    success: (message: string) => toastSuccess(message),
    info: jest.fn(),
  },
}));

const previewMock = jest.fn();
const commitMock = jest.fn();
jest.mock("@/store/api/productImportApi", () => {
  const actual = jest.requireActual("@/store/api/productImportApi");
  const unwrapping =
    (mock: jest.Mock) =>
    (...args: unknown[]) => ({ unwrap: () => mock(...args) });
  return {
    ...actual,
    downloadTextFile: jest.fn(),
    useGetProductImportTemplateMutation: () => [jest.fn(), { isLoading: false }],
    usePreviewProductImportMutation: () => [unwrapping(previewMock), { isLoading: false }],
    useCommitProductImportMutation: () => [unwrapping(commitMock), { isLoading: false }],
  };
});

function plan(overrides: Partial<ProductImportPlan>): ProductImportPlan {
  return {
    key: "handle:silk",
    handle: "silk",
    name: "Silk Saree",
    type: "simple",
    action: "update",
    rows: [2],
    changes: [],
    warnings: [],
    errors: [],
    ...overrides,
  };
}

function previewOf(products: ProductImportPlan[]): ProductImportPreview {
  const count = (action: ProductImportPlan["action"]) =>
    products.filter((p) => p.action === action).length;
  return {
    summary: {
      products: products.length,
      create: count("create"),
      update: count("update"),
      unchanged: count("unchanged"),
      error: count("error"),
    },
    products,
  };
}

function csvFile(content = "handle,name,type,sku,price,stock\n", name = "products.csv") {
  return new File([content], name, { type: "text/csv" });
}

describe("ImportProductsPage", () => {
  beforeEach(() => {
    previewMock.mockReset();
    commitMock.mockReset();
    toastError.mockReset();
    toastSuccess.mockReset();
  });

  it("rejects a file over 1.5MB without sending it", async () => {
    const user = userEvent.setup();
    render(<ImportProductsPage />);

    await user.upload(
      screen.getByLabelText("CSV file"),
      csvFile("x".repeat(1.5 * 1024 * 1024 + 1)),
    );

    expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/limit is 1\.5MB/));
    expect(previewMock).not.toHaveBeenCalled();
  });

  it("previews automatically and opens the Errors tab when the file has errors", async () => {
    previewMock.mockResolvedValue(
      previewOf([
        plan({ key: "handle:ok", handle: "ok", name: "Fine Saree", changes: ["price: ₹1 → ₹2"] }),
        plan({
          key: "handle:bad",
          handle: "bad",
          name: "Broken Saree",
          action: "error",
          rows: [3, 4, 5],
          errors: ['Row 3: category "linen" does not exist'],
        }),
      ]),
    );
    const user = userEvent.setup();
    render(<ImportProductsPage />);

    await user.upload(screen.getByLabelText("CSV file"), csvFile("handle\nok\n"));

    expect(previewMock).toHaveBeenCalledWith({ csv: "handle\nok\n" });
    const errorsTab = await screen.findByRole("tab", { name: "Errors (1)" });
    expect(errorsTab).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("Broken Saree")).toBeInTheDocument();
    expect(within(panel).getByText(/Rows 3–5/)).toBeInTheDocument();
    expect(within(panel).queryByText("Fine Saree")).not.toBeInTheDocument();

    // Arrow keys move between tabs.
    errorsTab.focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Changes (1)" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(screen.getByRole("tabpanel")).getByText("Fine Saree")).toBeInTheDocument();
  });

  it("imports in sequential batches of 10 and marks only a failed batch as failed", async () => {
    const products = Array.from({ length: 12 }, (_, i) =>
      plan({ key: `handle:p${i}`, handle: `p${i}`, name: `Saree ${i}`, changes: ["stock: 1 → 2"] }),
    );
    previewMock.mockResolvedValue(previewOf(products));
    commitMock
      .mockRejectedValueOnce({ status: "FETCH_ERROR", error: "TypeError: Failed to fetch" })
      .mockImplementationOnce(async ({ keys }: { keys: string[] }) => ({
        results: keys.map((key): ProductImportResult => ({
          key,
          status: "updated",
          slug: key.slice(7),
        })),
      }));
    const user = userEvent.setup();
    render(<ImportProductsPage />);

    await user.upload(screen.getByLabelText("CSV file"), csvFile());
    await user.click(await screen.findByRole("button", { name: "Import 12 products" }));

    await waitFor(() => expect(commitMock).toHaveBeenCalledTimes(2));
    expect(commitMock.mock.calls[0]?.[0].keys).toHaveLength(10);
    expect(commitMock.mock.calls[1]?.[0].keys).toEqual(["handle:p10", "handle:p11"]);

    expect(await screen.findByText(/Done: 0 created, 2 updated, 10 failed/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "12");
    expect(screen.getAllByText("Failed")).toHaveLength(10);
    expect(screen.getAllByRole("link", { name: "Open in editor" })[0]).toHaveAttribute(
      "href",
      "/admin/products/p10/edit",
    );
    expect(toastError).toHaveBeenCalledWith("10 products couldn't be imported.");
  });
});
