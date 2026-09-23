import { siteConfig } from "@/site.config";
import { getPublishedPosts } from "@/lib/posts";
import { isProgrammaticBody } from "@/lib/pseo";
import { categoryMeta } from "@/lib/taxonomy";

const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]", "g");

function escapeXml(input: string): string {
  const escaped = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
  return escaped.replace(CONTROL_CHARS, "");
}

export function GET() {
  // The feed is news; programmatic bodies live on their hardware and error pages.
  const posts = getPublishedPosts().filter((post) => !isProgrammaticBody(post.slug));
  const base = siteConfig.url;
  const buildDate = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const fm = post.frontmatter;
      const link = `${base}/news/${post.slug}`;
      const category = categoryMeta(fm.category);
      return `    <item>
      <title>${escapeXml(fm.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <category>${escapeXml(category.label)}</category>
      <pubDate>${new Date(`${fm.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(fm.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteConfig.name} — GTA 6 news and download status`)}</title>
    <link>${base}</link>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <ttl>60</ttl>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <generator>${escapeXml(siteConfig.name)}</generator>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
