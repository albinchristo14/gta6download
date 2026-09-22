/**
 * Feeds are the input surface, so this is the one place to add or remove a source.
 * `rockstargames.com/newswire.rss` is the only primary source in the list and outranks
 * the aggregator feeds; everything else is coverage *of* GTA 6, not statements *from*
 * Rockstar, and drafts must be attributed that way.
 */
export const feeds: string[] = [
  "https://www.rockstargames.com/newswire.rss",
  "https://feeds.ign.com/ign/games-all",
  "https://www.gamespot.com/feeds/news/",
  "https://www.eurogamer.net/feed",
  "https://www.kotaku.com/feed/",
  "https://www.vg247.com/feed",
];

/**
 * Matched case-insensitively and anchored at word boundaries. The boundaries matter:
 * an unanchored "gta v" matches "gta vi", and an unanchored "gta 6" matches "gta 60".
 * Anything that is only about GTA 5 / GTA Online never matches this list, which is why
 * there is no separate exclusion set to keep in sync.
 */
export const keywords: string[] = [
  "gta 6",
  "gta vi",
  "gta6",
  "gta-6",
  "grand theft auto 6",
  "grand theft auto vi",
];

export const maxItemsPerFeed = 60;
