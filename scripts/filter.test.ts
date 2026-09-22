import { describe, it, expect } from "vitest";
import { isRelevant, dedupe, dedupeByTitle, canonicalLink } from "./filter";
import { keywords } from "./feeds.config";
import type { FeedItem } from "./fetchFeeds";

function item(title: string, snippet = "", link = "https://example.com/a"): FeedItem {
  return { title, link, contentSnippet: snippet, sourceFeed: "https://example.com/feed" };
}

describe("isRelevant", () => {
  it("matches a GTA 6 mention in the title, case-insensitively", () => {
    expect(isRelevant({ title: "New GTA 6 trailer drops", contentSnippet: "" }, keywords)).toBe(
      true,
    );
  });

  it("matches a mention in the snippet", () => {
    expect(
      isRelevant({ title: "Rockstar update", contentSnippet: "details about Grand Theft Auto VI" }, keywords),
    ).toBe(true);
  });

  it("rejects GTA 5 and GTA Online coverage", () => {
    expect(isRelevant({ title: "GTA 5 mod news", contentSnippet: "old game" }, keywords)).toBe(
      false,
    );
    expect(
      isRelevant({ title: "GTA Online weekly updates", contentSnippet: "car meets and bonuses" }, keywords),
    ).toBe(false);
  });

  it("does not let 'GTA V' or 'Vice City' masquerade as 'GTA VI'", () => {
    expect(isRelevant({ title: "GTA V anniversary sale", contentSnippet: "" }, keywords)).toBe(false);
    expect(isRelevant({ title: "GTA Vice City definitive edition", contentSnippet: "" }, keywords)).toBe(
      false,
    );
  });

  it("does not match a number that merely starts with 6", () => {
    expect(isRelevant({ title: "GTA 60 fps patch for GTA 4", contentSnippet: "" }, keywords)).toBe(
      false,
    );
  });
});

describe("canonicalLink", () => {
  it("strips tracking parameters and the trailing slash", () => {
    expect(canonicalLink("https://Example.com/a/?utm_source=x&utm_medium=y#/top")).toBe(
      "https://example.com/a",
    );
  });

  it("keeps a real query parameter", () => {
    expect(canonicalLink("https://example.com/a?id=7")).toBe("https://example.com/a?id=7");
  });

  it("falls back to the raw string when the link is not a URL", () => {
    expect(canonicalLink("not a url")).toBe("not a url");
  });
});

describe("dedupe", () => {
  it("drops items already seen on a previous run", () => {
    const items = [item("A", "", "https://x.com/a"), item("B", "", "https://x.com/b")];
    const out = dedupe(items, new Set(["https://x.com/a"]));
    expect(out.map((i) => i.link)).toEqual(["https://x.com/b"]);
  });

  it("drops repeats inside the same run, including tracking-param variants", () => {
    const items = [
      item("A", "", "https://x.com/a"),
      item("A syndicated", "", "https://x.com/a?utm_source=ign"),
    ];
    expect(dedupe(items, new Set())).toHaveLength(1);
  });
});

describe("dedupeByTitle", () => {
  it("collapses the same headline carried by two feeds", () => {
    const items = [
      item("GTA 6 pre-orders open again this week", "", "https://a.com/1"),
      item("GTA 6 pre-orders open again this week", "", "https://b.com/2"),
    ];
    expect(dedupeByTitle(items)).toHaveLength(1);
  });

  it("keeps genuinely distinct headlines", () => {
    const items = [
      item("GTA 6 releases on 19 November 2026"),
      item("GTA 6 pre-load opens on 12 November"),
    ];
    expect(dedupeByTitle(items)).toHaveLength(2);
  });
});
