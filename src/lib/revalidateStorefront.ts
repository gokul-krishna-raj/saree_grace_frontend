import type { RootState } from "@/store";

export interface RevalidateStorefrontInput {
  productSlugs?: string[];
  allProducts?: boolean;
}

// After an admin product write, asks the Next server (app/api/revalidate) to regenerate the
// ISR-cached storefront pages on their next visit. Best-effort: if it fails, the pages still
// refresh on their normal `revalidate` schedule, so the admin's save is never blocked on it.
export async function revalidateStorefront(
  getState: () => unknown,
  input: RevalidateStorefrontInput,
): Promise<void> {
  const accessToken = (getState() as RootState).auth.accessToken;
  if (!accessToken) return;
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(input),
    });
  } catch {
    // Non-critical — see above.
  }
}
