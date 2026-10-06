import { env } from "@/lib/env";
import { internalApiHeaders } from "@/lib/internalApi";
import type { ApiErrorBody, ApiSuccess } from "@/types";

// Server Components fetch directly (not via RTK Query, which is a client-side cache) so
// product/category pages render real content in the initial HTML for crawlers — see
// CLAUDE_FRONTEND.md and Section 15 of the checklist. `revalidate` gives a short cache window
// instead of hammering the backend on every request while still reflecting catalog changes
// within a minute.
//
// Only a genuine "no such record" answer resolves to `null`. Every other failure (5xx, 429,
// gateway timeout, non-JSON body, network error) throws. This matters for ISR: pages call
// `notFound()` on `null`, and a 404 rendered from a transient backend error used to be cached
// for the whole revalidate window. A thrown error instead makes Next keep serving the last good
// page (or show the error page on a first render, which is not cached).

export class ServerFetchError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
    this.name = "ServerFetchError";
  }
}

async function request<T>(path: string, revalidateSeconds: number): Promise<ApiSuccess<T> | null> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    headers: internalApiHeaders(),
    next: { revalidate: revalidateSeconds },
  });

  let body: ApiSuccess<T> | ApiErrorBody | undefined;
  try {
    body = (await res.json()) as ApiSuccess<T> | ApiErrorBody;
  } catch {
    body = undefined;
  }

  // The backend answers a missing record with its own `{ success: false }` 404. An unknown
  // route ("Route not found: …") or a gateway 404 means the API itself is misconfigured, which
  // must not be cached as "this product doesn't exist".
  if (
    res.status === 404 &&
    body?.success === false &&
    !body.error?.message?.startsWith("Route not found")
  ) {
    return null;
  }

  if (!res.ok || !body?.success) {
    const message =
      (body && !body.success && typeof body.error === "object" && body.error?.message) ||
      `HTTP ${res.status}`;
    throw new ServerFetchError(
      `Backend request failed: GET ${path} → ${message}`,
      res.status,
      path,
    );
  }
  return body;
}

export async function serverFetch<T>(path: string, revalidateSeconds = 60): Promise<T | null> {
  const body = await request<T>(path, revalidateSeconds);
  return body ? body.data : null;
}

// Like serverFetch, but also returns the pagination cursor from the response's `meta`, so a
// client list can continue from a server-rendered first page instead of re-requesting it.
export async function serverFetchPage<T>(
  path: string,
  revalidateSeconds = 60,
): Promise<{ data: T; nextCursor: string | null } | null> {
  const body = await request<T>(path, revalidateSeconds);
  return body ? { data: body.data, nextCursor: body.meta?.nextCursor ?? null } : null;
}
