import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import { toMdx, writeDraft, draftFilename } from "./writeDraft";
import { parsePost } from "../lib/posts";
import type { DraftArticle } from "./draft";

const draft: DraftArticle = {
  title: "GTA 6 pre-load opens on 12 November",
  slug: "gta-6-preload-12-november",
  description: "What the reported pre-load window means.",
  body: "Body text.",
  tags: ["gta 6"],
};

let root: string;
let draftsDir: string;
let postsDir: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "ingest-"));
  draftsDir = path.join(root, "drafts");
  postsDir = path.join(root, "posts");
  fs.mkdirSync(draftsDir, { recursive: true });
  fs.mkdirSync(postsDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("toMdx", () => {
  it("emits a draft a human can review, tagged so it cannot be confused for published work", () => {
    const mdx = toMdx(draft, ["https://x.com/src"], "2026-09-22");
    const { data } = matter(mdx);
    expect(data.status).toBe("draft");
    expect(data.sources).toEqual(["https://x.com/src"]);
    expect(data.category).toBe("news");
    expect(matter(mdx).content.trim()).toBe("Body text.");
  });

  it("produces frontmatter that passes the real published-post schema", () => {
    const mdx = toMdx({ ...draft, category: "errors" }, ["https://x.com/src"], "2026-09-22");
    expect(parsePost(mdx).frontmatter.category).toBe("errors");
  });

  it("refuses a draft with no source, because that is unpublishable", () => {
    expect(() => toMdx(draft, [], "2026-09-22")).toThrow(/no source/);
  });
});

describe("draftFilename", () => {
  it("prefixes the date so drafts sort by run", () => {
    expect(draftFilename("gta-6-news", "2026-09-22")).toBe("2026-09-22-gta-6-news.mdx");
  });
});

describe("writeDraft", () => {
  it("writes into the drafts directory only", () => {
    const file = writeDraft(draftsDir, postsDir, draft, ["https://x.com/s"], "2026-09-22");
    expect(path.dirname(file)).toBe(draftsDir);
    expect(fs.existsSync(file)).toBe(true);
    expect(fs.readdirSync(postsDir)).toEqual([]);
  });

  it("refuses a target that is not a drafts directory", () => {
    expect(() => writeDraft(postsDir, postsDir, draft, ["https://x.com/s"], "2026-09-22")).toThrow(
      /outside a drafts directory/,
    );
  });

  it("never overwrites a draft somebody is already reviewing", () => {
    writeDraft(draftsDir, postsDir, draft, ["https://x.com/s"], "2026-09-22");
    const edited = path.join(draftsDir, "2026-09-22-gta-6-preload-12-november.mdx");
    fs.writeFileSync(edited, "hand edited");
    writeDraft(draftsDir, postsDir, { ...draft, body: "regenerated" }, ["https://x.com/s"], "2026-09-22");
    expect(fs.readFileSync(edited, "utf8")).toBe("hand edited");
  });

  it("leaves no temporary file behind", () => {
    writeDraft(draftsDir, postsDir, draft, ["https://x.com/s"], "2026-09-22");
    expect(fs.readdirSync(draftsDir)).toEqual(["2026-09-22-gta-6-preload-12-november.mdx"]);
  });
});
