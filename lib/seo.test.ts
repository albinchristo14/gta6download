import { describe, it, expect } from "vitest";
import {
  organizationJsonLd,
  articleJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
  pageMetadata,
  absoluteUrl,
} from "./seo";

const fm = {
  title: "T",
  slug: "s",
  description: "d",
  date: "2026-06-01",
  updated: "2026-06-02",
  tags: [],
  category: "news",
  sources: ["https://x.com"],
  status: "published",
  author: "A",
} as never;

describe("JSON-LD helpers", () => {
  it("organization has the right @type and url", () => {
    const ld = organizationJsonLd() as Record<string, unknown>;
    expect(ld["@type"]).toBe("Organization");
    expect(ld.url).toBe("https://gta6download.store");
  });

  it("article produces a NewsArticle with headline and dates", () => {
    const ld = articleJsonLd(fm) as Record<string, any>;
    expect(ld["@type"]).toBe("NewsArticle");
    expect(ld.headline).toBe("T");
    expect(ld.dateModified).toBe("2026-06-02");
    expect(ld.mainEntityOfPage).toBe("https://gta6download.store/news/s");
  });

  it("article omits image when the post has none", () => {
    expect((articleJsonLd(fm) as Record<string, unknown>).image).toBeUndefined();
  });

  it("faq produces a FAQPage with mainEntity entries", () => {
    const ld = faqJsonLd([{ question: "Q?", answer: "A." }]) as Record<string, any>;
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity[0]["@type"]).toBe("Question");
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("A.");
  });

  it("breadcrumb lists items in order", () => {
    const ld = breadcrumbJsonLd([
      { name: "Home", url: "https://gta6download.store" },
      { name: "News", url: "https://gta6download.store/news" },
    ]) as Record<string, any>;
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement[1].position).toBe(2);
  });
});

describe("pageMetadata", () => {
  it("sets a canonical absolute URL", () => {
    const md = pageMetadata({ title: "X", description: "Y", path: "/faq" });
    expect(md.alternates?.canonical).toBe("https://gta6download.store/faq");
    expect(md.openGraph?.images).toBeTruthy();
  });

  it("noindexes thin placeholder pages but still lets crawlers follow out", () => {
    expect(pageMetadata({ title: "X", description: "Y", path: "/gpu/z", index: false }).robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it("absoluteUrl leaves no trailing slash on the root", () => {
    expect(absoluteUrl()).toBe("https://gta6download.store/");
    expect(absoluteUrl("/news")).toBe("https://gta6download.store/news");
  });
});
