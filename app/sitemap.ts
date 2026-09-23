import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";
import { getPublishedPosts } from "@/lib/posts";
import { categories } from "@/lib/taxonomy";
import { downloadPages } from "@/lib/download-pages";
import { isProgrammaticBody, readyItemPaths } from "@/lib/pseo";

/**
 * The one place that decides what is indexable. Anything `noindex` — a programmatic
 * page without a reviewed body, for example — must be filtered out here as well as in
 * `pageMetadata`, so the sitemap never promises a URL the page tells robots to ignore.
 */
const STATIC_PATHS = [
  "",
  "/gta-6-download",
  "/news",
  "/where-to-buy",
  "/gta-6-release-date",
  "/gta-6-system-requirements",
  "/faq",
  "/tools/fps-estimator",
  "/tools/can-i-run-gta-6",
  "/about",
  "/contact",
  "/privacy",
  "/disclaimer",
];

function url(path: string) {
  return `${siteConfig.url}${path}`;
}

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const reviewed = siteConfig.lastReviewed;

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: url(p),
    lastModified: new Date(`${reviewed}T00:00:00Z`),
    changeFrequency: p === "" || p === "/gta-6-download" ? "daily" : "weekly",
    priority: p === "/gta-6-download" ? 1 : p === "" ? 0.9 : 0.6,
  }));

  const siloEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: url(c.path),
    lastModified: new Date(`${reviewed}T00:00:00Z`),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const downloadEntries: MetadataRoute.Sitemap = downloadPages.map((d) => ({
    url: url(`/${d.slug}`),
    lastModified: new Date(`${reviewed}T00:00:00Z`),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap = getPublishedPosts()
    .filter((post) => !isProgrammaticBody(post.slug))
    .map((post) => ({
      url: url(`/news/${post.slug}`),
      lastModified: new Date(
        `${post.frontmatter.updated ?? post.frontmatter.date}T00:00:00Z`,
      ),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  // Programmatic pages enter the sitemap only once a data row AND a reviewed body exist.
  const pseoEntries: MetadataRoute.Sitemap = readyItemPaths(
    new Set(getPublishedPosts().map((p) => p.slug)),
  ).map((path) => ({
    url: url(path),
    lastModified: new Date(`${reviewed}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...siloEntries, ...downloadEntries, ...postEntries, ...pseoEntries];
}
