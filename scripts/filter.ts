import type { FeedItem } from "./fetchFeeds";

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Word boundaries are the whole trick. Without them "gta vi" matches "GTA Vice City" and
 * "gta 6" matches "gta 60", so a feed full of unrelated Rockstar coverage slips through.
 */
function compileKeywords(keywords: string[]): RegExp[] {
  return keywords.map((kw) => new RegExp(`(?:^|\\W)${escapeForRegex(kw)}(?:$|\\W)`, "i"));
}

export function isRelevant(
  item: { title: string; contentSnippet: string },
  keywords: string[],
): boolean {
  const haystack = `${item.title} ${item.contentSnippet}`;
  const patterns = compileKeywords(keywords);
  return patterns.some((re) => re.test(haystack));
}

/** Syndicated copies of one story differ only by tracking params, so normalise before comparing. */
export function canonicalLink(link: string): string {
  try {
    const url = new URL(link);
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_|ref_?id?$)/i.test(key)) url.searchParams.delete(key);
    }
    url.hash = "";
    url.search = url.searchParams.toString();
    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return link.trim().toLowerCase();
  }
}

/** Drops items already ingested on a previous run, and repeats inside this run. */
export function dedupe(items: FeedItem[], seen: Set<string>): FeedItem[] {
  const out: FeedItem[] = [];
  const local = new Set<string>();

  for (const item of items) {
    const key = canonicalLink(item.link);
    if (seen.has(key) || local.has(key)) continue;
    local.add(key);
    out.push(item);
  }

  return out;
}

/** Same headline on two feeds is a dupe even when the URLs do not normalise to each other. */
export function dedupeByTitle(items: FeedItem[]): FeedItem[] {
  const seenTitles = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    if (key.length < 12 || seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });
}
