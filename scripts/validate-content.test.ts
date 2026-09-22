import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { validateAllPosts, knownPaths } from "./validate-content";

let dir: string;

const frontmatter = ({
  slug = "t",
  title = "A GTA 6 title",
  description = "A description.",
  date = "2026-09-22",
  sources = '["https://www.rockstargames.com/VI/"]',
  category = "news",
  status = "published",
} = {}) =>
  `---
title: "${title}"
slug: "${slug}"
description: "${description}"
date: "${date}"
tags: ["gta 6"]
category: "${category}"
sources: ${sources}
status: "${status}"
author: "GTA6Download Editorial"
---
`;

const longBody = "Some substantial sentence about GTA 6. ".repeat(20);

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "posts-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function write(file: string, raw: string) {
  fs.writeFileSync(path.join(dir, file), raw);
}

describe("validateAllPosts", () => {
  it("accepts a well-formed post", () => {
    write("good.mdx", `${frontmatter()}${longBody}`);
    expect(validateAllPosts(dir)).toEqual([]);
  });

  it("reports invalid frontmatter against the file that caused it", () => {
    write("bad.mdx", `${frontmatter({ sources: "[]" })}${longBody}`);
    const errors = validateAllPosts(dir);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/bad\.mdx/);
  });

  it("catches two posts claiming the same slug", () => {
    write("a.mdx", `${frontmatter({ slug: "same" })}${longBody}`);
    write("b.mdx", `${frontmatter({ slug: "same" })}${longBody}`);
    expect(validateAllPosts(dir).join("\n")).toMatch(/duplicate slug "same"/);
  });

  it("rejects a body too thin to rank", () => {
    write("thin.mdx", `${frontmatter()}Short.`);
    expect(validateAllPosts(dir).join("\n")).toMatch(/under 400 characters/);
  });

  it("catches an internal link to a page that does not exist", () => {
    write("link.mdx", `${frontmatter()}${longBody}\n\nSee [this](/news/no-such-article).`);
    expect(validateAllPosts(dir).join("\n")).toMatch(/does not resolve/);
  });

  it("accepts a link to a real article and to a real programmatic route", () => {
    write(
      "link.mdx",
      `${frontmatter()}${longBody}\n\n[article](/news/gta-6-pc-download-status) and [gpu](/gpu/rtx-4060).`,
    );
    expect(validateAllPosts(dir)).toEqual([]);
  });

  it("flags an over-long SEO title", () => {
    write("t.mdx", `${frontmatter({ title: "x".repeat(75) })}${longBody}`);
    expect(validateAllPosts(dir).join("\n")).toMatch(/title is 75 characters/);
  });
});

describe("knownPaths", () => {
  it("includes the money page, every silo and the tools", () => {
    const paths = knownPaths();
    for (const p of ["/gta-6-download", "/downloads", "/tools/fps-estimator", "/where-to-buy"]) {
      expect(paths.has(p)).toBe(true);
    }
  });

  it("includes the download family by slug", () => {
    expect(knownPaths().has("/gta-6-apk-download")).toBe(true);
  });
});

describe("the real content set", () => {
  it("has no invalid posts in the repository", () => {
    expect(validateAllPosts()).toEqual([]);
  });
});
