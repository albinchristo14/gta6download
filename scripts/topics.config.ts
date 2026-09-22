import type { Category } from "../lib/posts";

export interface Topic {
  slug: string;
  title: string;
  category: Category;
  brief: string;
  /**
   * The only URLs a topic draft may cite. An editorial queue without a source list is how
   * invented facts get in — the model has to work from something we already trust.
   */
  sources: string[];
}

/**
 * Pages we decided to write, as opposed to stories that broke. Rows in `data/*.json` are
 * drafted through `draftFromPseoRow` instead; this list is for the standalone briefs.
 */
export const topics: Topic[] = [
  {
    slug: "does-gta-6-need-an-internet-connection",
    title: "Does GTA 6 Need an Always-Online Connection?",
    category: "downloads",
    brief:
      "Answer the offline-play question honestly. Rockstar has not stated an online requirement for the story campaign. Separate what is confirmed from the GTA Online precedent and from console platform behaviour (licence checks, day-one patches). End with what a buyer can assume and what they cannot.",
    sources: [
      "https://www.rockstargames.com/VI/",
      "https://www.rockstargames.com/help/article/3317",
    ],
  },
  {
    slug: "gta-6-on-game-pass-or-plus",
    title: "Will GTA 6 Be on Game Pass or PlayStation Plus at Launch?",
    category: "guides",
    brief:
      "Nobody at Rockstar, Microsoft or Sony has announced GTA 6 in a subscription catalogue. Say that plainly, then explain what each service's day-one policy has looked like for first-party versus third-party titles, and what a buyer should actually plan for. Do not imply a launch-day subscription route exists.",
    sources: [
      "https://www.rockstargames.com/VI/",
      "https://www.xbox.com/en-US/games/Grand-Theft-Auto-VI",
    ],
  },
  {
    slug: "gta-6-refund-policy",
    title: "Can You Refund a GTA 6 Pre-Order? The Rules Per Store",
    category: "guides",
    brief:
      "Pre-orders were taken by Sony, Microsoft, Rockstar and retail chains, and the refund rules differ by store and by whether the content has been delivered or redeemed. Cover each route and the pre-load complication in the same terms the official store help pages use.",
    sources: [
      "https://www.rockstargames.com/help/article/3317",
      "https://store.playstation.com/",
      "https://www.xbox.com/en-US/",
    ],
  },
  {
    slug: "gta-6-ps5-vs-xbox-series-x",
    title: "GTA 6 on PS5 vs Xbox Series X: Which Copy Should You Buy?",
    category: "comparisons",
    brief:
      "Both versions are announced for 19 November 2026 and Rockstar has published no per-platform performance targets. Compare only what is real: installed base, store ecosystem, exclusive content periods where announced, and console hardware equivalence. State clearly that any frame-rate difference claim is unsupported today.",
    sources: [
      "https://www.rockstargames.com/VI/",
      "https://www.xbox.com/en-US/games/Grand-Theft-Auto-VI",
      "https://store.playstation.com/",
    ],
  },
];
