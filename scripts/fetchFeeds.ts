import Parser from "rss-parser";
import { maxItemsPerFeed } from "./feeds.config";

export interface FeedItem {
  title: string;
  link: string;
  contentSnippet: string;
  pubDate?: string;
  sourceFeed: string;
  /** True only for Rockstar's own newswire — a draft from this is a fact, not a report. */
  fromPrimarySource?: boolean;
}

const PRIMARY_SOURCE_HOSTS = ["rockstargames.com"];

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function isPrimaryFeed(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return PRIMARY_SOURCE_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

/**
 * A dead or rate-limited feed is normal, so each URL is isolated: one failure logs and
 * moves on rather than aborting the run. The returned order is feed order, newest feeds
 * first only insofar as the feeds themselves are ordered.
 */
export async function fetchAllFeeds(
  urls: string[],
  parser: Pick<Parser, "parseURL"> = new Parser({ timeout: 15000 }),
  log: (message: string) => void = (m) => console.warn(`[ingest] ${m}`),
): Promise<FeedItem[]> {
  const all: FeedItem[] = [];

  for (const url of urls) {
    let feed;
    try {
      feed = await parser.parseURL(url);
    } catch (err) {
      log(`feed failed, skipping: ${url} — ${(err as Error).message}`);
      continue;
    }

    const primary = isPrimaryFeed(url);
    let taken = 0;
    for (const item of feed.items ?? []) {
      if (taken >= maxItemsPerFeed) break;
      const link = item.link?.trim();
      const title = stripHtml(item.title ?? "");
      if (!link || !title) continue;
      taken += 1;
      all.push({
        title,
        link,
        contentSnippet: stripHtml(item.contentSnippet ?? item.content ?? "").slice(0, 2000),
        pubDate: item.pubDate ?? item.isoDate,
        sourceFeed: url,
        fromPrimarySource: primary,
      });
    }
    log(`${url} → ${taken} items${primary ? " (primary source)" : ""}`);
  }

  return all;
}
