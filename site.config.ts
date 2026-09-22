export type DownloadStatus = "preorder" | "available" | "not_yet";

export interface SiteConfig {
  name: string;
  url: string;
  description: string;
  author: string;
  /** ISO 8601 target launch date for the countdown. Update when Rockstar changes it. */
  releaseDate: string;
  downloadStatus: DownloadStatus;
  /** Truthful one-line availability summary reused across pages and structured data. */
  statusHeadline: string;
  /** Platforms with a confirmed, purchasable product. */
  confirmedPlatforms: string[];
  /** True once a PC version is officially announced by Rockstar/Take-Two. */
  pcAnnounced: boolean;
  /** Editorial "last reviewed" date (ISO) shown on evergreen pages. */
  lastReviewed: string;
}

export const siteConfig: SiteConfig = {
  name: "GTA6Download",
  url: "https://gta6download.store",
  description:
    "GTA 6 download status, release date, system requirements, news and where to buy — tracked against Rockstar's official announcements.",
  author: "GTA6Download Editorial",
  releaseDate: "2026-11-19T00:00:00.000Z",
  downloadStatus: "preorder",
  statusHeadline:
    "GTA 6 cannot be downloaded or played yet. It releases on 19 November 2026 for PS5 and Xbox Series X|S, and pre-orders are open.",
  confirmedPlatforms: ["PlayStation 5", "Xbox Series X|S"],
  pcAnnounced: false,
  lastReviewed: "2026-09-22",
};
