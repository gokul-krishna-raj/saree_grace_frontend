import { env } from "@/lib/env";

// Uptime probe for the storefront: 200 only when the backend answers and its database ping
// succeeds (the backend's /health runs the ping). Never cached.
const TIMEOUT_MS = 8000;

export async function GET() {
  const started = Date.now();
  // The API base is ".../api/v1"; the backend also serves /health under it.
  const url = `${env.NEXT_PUBLIC_API_BASE_URL}/health`;
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    const body = (await res.json().catch(() => null)) as {
      success?: boolean;
      data?: { dbLatencyMs?: number };
    } | null;
    const ok = res.ok && body?.success === true;
    return Response.json(
      {
        status: ok ? "ok" : "error",
        backendStatus: res.status,
        dbLatencyMs: body?.data?.dbLatencyMs ?? null,
        latencyMs: Date.now() - started,
      },
      { status: ok ? 200 : 500, headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    return Response.json(
      { status: "error", error: (err as Error).name, latencyMs: Date.now() - started },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
