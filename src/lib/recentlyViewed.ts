// Per-device "recently viewed" list for the PDP. A convenience only: every access is guarded
// because localStorage can be unavailable (private mode, blocked site data).
export interface RecentlyViewedItem {
  slug: string;
  name: string;
  image?: string;
  price: number;
  isFromPrice: boolean;
}

const KEY = "sg_recently_viewed";
const MAX_ITEMS = 12;

export function readRecentlyViewed(): RecentlyViewedItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is RecentlyViewedItem =>
            typeof item === "object" && item !== null && typeof item.slug === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(item: RecentlyViewedItem) {
  try {
    const next = [item, ...readRecentlyViewed().filter((entry) => entry.slug !== item.slug)];
    window.localStorage.setItem(KEY, JSON.stringify(next.slice(0, MAX_ITEMS)));
  } catch {
    // ignore
  }
}
