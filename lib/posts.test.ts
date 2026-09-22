import { describe, it, expect } from "vitest";
import { parsePost, frontmatterSchema, CATEGORIES } from "./posts";

const VALID = `---
title: "Test Post"
slug: "test-post"
description: "A test."
date: "2026-06-01"
tags: ["gta6"]
category: "guides"
sources: ["https://example.com/a"]
author: "Editor"
---
Body text here.`;

describe("parsePost", () => {
  it("parses valid frontmatter and returns the body", () => {
    const { frontmatter, content } = parsePost(VALID);
    expect(frontmatter.title).toBe("Test Post");
    expect(frontmatter.sources).toEqual(["https://example.com/a"]);
    expect(frontmatter.status).toBe("published");
    expect(content.trim()).toBe("Body text here.");
  });

  it("defaults `updated` to `date` when omitted", () => {
    const { frontmatter } = parsePost(VALID);
    expect(frontmatter.updated).toBe("2026-06-01");
  });

  it("round-trips category", () => {
    expect(parsePost(VALID).frontmatter.category).toBe("guides");
  });

  it("defaults a missing category to news", () => {
    const noCategory = VALID.replace('category: "guides"\n', "");
    expect(parsePost(noCategory).frontmatter.category).toBe("news");
  });

  it("throws when sources are missing", () => {
    const bad = VALID.replace('sources: ["https://example.com/a"]', "sources: []");
    expect(() => parsePost(bad)).toThrow(/sources/i);
  });

  it("throws when a required field is missing", () => {
    expect(() => parsePost(VALID.replace('title: "Test Post"\n', ""))).toThrow(/title/);
  });

  it("names the offending field in the error", () => {
    expect(() => parsePost(VALID.replace("author: \"Editor\"", "author: \"\""))).toThrow(/author/);
  });
});

describe("frontmatterSchema", () => {
  it("rejects unknown status values", () => {
    const r = frontmatterSchema.safeParse({
      title: "x", slug: "x", description: "x", date: "2026-01-01",
      sources: ["https://x.com"], author: "x", status: "bogus",
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown categories", () => {
    const r = frontmatterSchema.safeParse({
      title: "x", slug: "x", description: "x", date: "2026-01-01",
      sources: ["https://x.com"], author: "x", category: "hot-takes",
    });
    expect(r.success).toBe(false);
  });

  it("exposes exactly the seven silo categories", () => {
    expect(CATEGORIES).toEqual([
      "downloads", "installation", "requirements", "errors", "news", "guides", "comparisons",
    ]);
  });
});
