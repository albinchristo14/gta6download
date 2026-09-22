import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import type { PostFrontmatter } from "@/lib/posts";

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}

export interface PageMetadataOptions {
  title: string;
  description: string;
  /** Path from the site root, e.g. "/gta-6-download". No trailing slash. */
  path: string;
  keywords?: string[];
  /** Set false for placeholder/thin pages so they never enter the index. */
  index?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/opengraph-image")],
    },
    // Unindexed placeholders still hand crawlers through to the real pages they link to.
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}

export function organizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: absoluteUrl("/icon.svg"),
  };
}

export function articleJsonLd(
  fm: PostFrontmatter,
  opts: { type?: "NewsArticle" | "Article"; path?: string } = {},
): object {
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "NewsArticle",
    headline: fm.title,
    description: fm.description,
    datePublished: fm.date,
    dateModified: fm.updated ?? fm.date,
    author: { "@type": "Organization", name: fm.author },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: absoluteUrl(opts.path ?? `/news/${fm.slug}`),
    ...(fm.image ? { image: absoluteUrl(fm.image) } : {}),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function breadcrumbJsonLd(crumbs: Array<{ name: string; url: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function howToJsonLd(name: string, steps: Array<{ name: string; text: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export interface VideoData {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
}

export function videoJsonLd(v: VideoData): object {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.name,
    description: v.description,
    thumbnailUrl: v.thumbnailUrl,
    uploadDate: v.uploadDate,
    contentUrl: v.contentUrl,
    embedUrl: v.contentUrl,
  };
}

export function softwareAppJsonLd(opts: {
  name: string;
  os: string;
  category?: string;
  offer?: { price: string; url: string };
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    applicationCategory: opts.category ?? "GameApplication",
    operatingSystem: opts.os,
    publisher: { "@type": "Organization", name: "Rockstar Games" },
    ...(opts.offer
      ? {
          offers: {
            "@type": "Offer",
            price: opts.offer.price,
            priceCurrency: "USD",
            url: opts.offer.url,
            availability: "https://schema.org/PreOrder",
          },
        }
      : {}),
  };
}

export function websiteSearchJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };
}
