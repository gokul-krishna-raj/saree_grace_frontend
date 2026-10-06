/**
 * Fetches every URL in a deployment's sitemap several times and fails if any response is not a
 * plain 200. Read-only (GET only), so it is safe to run against production.
 *
 *   npx tsx scripts/check-urls.ts https://www.sareegrace.in
 *   npx tsx scripts/check-urls.ts https://<preview>.vercel.app --rounds 5
 *
 * Sitemap entries are rewritten onto the given base URL, so a preview deployment is checked
 * against its own pages even though its sitemap may list production URLs. Redirects are not
 * followed: every sitemap URL is supposed to be canonical, so a 3xx counts as a failure too.
 */

const DEFAULT_ROUNDS = 3;
const CONCURRENCY = 6;
const TIMEOUT_MS = 30_000;

interface Result {
  url: string;
  round: number;
  status: number | "error";
  ms: number;
  vercelId: string | null;
  cache: string | null;
  detail?: string;
}

function parseArgs(argv: string[]) {
  const base = argv.find((a) => /^https?:\/\//.test(a));
  if (!base) {
    console.error("Usage: npx tsx scripts/check-urls.ts <base-url> [--rounds N]");
    process.exit(2);
  }
  const roundsIdx = argv.indexOf("--rounds");
  const rounds = roundsIdx >= 0 ? Number(argv[roundsIdx + 1]) : DEFAULT_ROUNDS;
  return { base: base.replace(/\/+$/, ""), rounds: Number.isFinite(rounds) ? rounds : 3 };
}

// Vercel's deployment protection on previews accepts this header when the project has a bypass
// secret configured (Settings → Deployment Protection → Protection Bypass for Automation).
function requestHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "user-agent": "saree-grace-check-urls/1.0" };
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (bypass) headers["x-vercel-protection-bypass"] = bypass;
  return headers;
}

async function getSitemapUrls(base: string): Promise<string[]> {
  const res = await fetch(`${base}/sitemap.xml`, { headers: requestHeaders() });
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]!);
  if (locs.length === 0) throw new Error("sitemap.xml contained no <loc> entries");
  // Rebase onto the deployment under test.
  return [...new Set(locs.map((loc) => base + new URL(loc).pathname))];
}

async function check(url: string, round: number): Promise<Result> {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      headers: requestHeaders(),
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = await res.text();
    const result: Result = {
      url,
      round,
      status: res.status,
      ms: Date.now() - started,
      vercelId: res.headers.get("x-vercel-id"),
      cache: res.headers.get("x-vercel-cache"),
    };
    if (res.status >= 300 && res.status < 400) result.detail = `→ ${res.headers.get("location")}`;
    // A soft 404 (not-found page served with 200) would be just as bad — flag it.
    if (res.status === 200 && /Page not found/i.test(body) && /noindex/i.test(body)) {
      result.status = "error";
      result.detail = "200 but body is the not-found page";
    }
    return result;
  } catch (err) {
    return {
      url,
      round,
      status: "error",
      ms: Date.now() - started,
      vercelId: null,
      cache: null,
      detail: (err as Error).message,
    };
  }
}

async function runPool<T, R>(items: T[], worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let next = 0;
  async function lane() {
    while (next < items.length) {
      const item = items[next++]!;
      results.push(await worker(item));
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, lane));
  return results;
}

async function main() {
  const { base, rounds } = parseArgs(process.argv.slice(2));
  const urls = await getSitemapUrls(base);
  console.log(`Checking ${urls.length} URLs from ${base}/sitemap.xml × ${rounds} rounds\n`);

  const failures: Result[] = [];
  for (let round = 1; round <= rounds; round++) {
    const results = await runPool(urls, (url) => check(url, round));
    const bad = results.filter((r) => r.status !== 200);
    failures.push(...bad);
    const slowest = Math.max(...results.map((r) => r.ms));
    console.log(
      `Round ${round}: ${results.length - bad.length}/${results.length} OK (slowest ${slowest} ms)`,
    );
    for (const r of bad) {
      console.log(
        `  ✗ ${r.status} ${r.url} ${r.ms}ms vercel-id=${r.vercelId ?? "-"} cache=${r.cache ?? "-"}${
          r.detail ? ` ${r.detail}` : ""
        }`,
      );
    }
  }

  if (failures.length > 0) {
    console.log(`\nFAIL: ${failures.length} non-200 responses`);
    process.exit(1);
  }
  console.log("\nPASS: every URL returned 200 in every round");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
