import { env } from "@/lib/env";
import type { ApiErrorBody, ApiSuccess } from "@/types";

// Server Components fetch directly (not via RTK Query, which is a client-side cache) so
// product/category pages render real content in the initial HTML for crawlers — see
// CLAUDE_FRONTEND.md and Section 15 of the checklist. `revalidate` gives a short cache window
// instead of hammering the backend on every request while still reflecting catalog changes
// within a minute.
export async function serverFetch<T>(path: string, revalidateSeconds = 60): Promise<T | null> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    next: { revalidate: revalidateSeconds },
  });

  if (res.status === 404) return null;

  const body = (await res.json()) as ApiSuccess<T> | ApiErrorBody;
  if (!body.success) {
    if (!res.ok) return null;
    throw new Error(body.error.message);
  }
  return body.data;
}

// Like serverFetch, but also returns the pagination cursor from the response's `meta`, so a
// client list can continue from a server-rendered first page instead of re-requesting it.
export async function serverFetchPage<T>(
  path: string,
  revalidateSeconds = 60,
): Promise<{ data: T; nextCursor: string | null } | null> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    next: { revalidate: revalidateSeconds },
  });
  if (res.status === 404) return null;
  const body = (await res.json()) as ApiSuccess<T> | ApiErrorBody;
  if (!body.success) {
    if (!res.ok) return null;
    throw new Error(body.error.message);
  }
  return { data: body.data, nextCursor: body.meta?.nextCursor ?? null };
}
