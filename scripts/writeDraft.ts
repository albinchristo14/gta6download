import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { DraftArticle } from "./draft";
import type { FeedItem } from "./fetchFeeds";

export const AUTHOR = "GTA6Download Editorial";

export function toMdx(
  draft: DraftArticle,
  sources: string[],
  dateISO: string,
): string {
  if (sources.length === 0) {
    throw new Error(`refusing to write ${draft.slug}: a draft with no source is unpublishable`);
  }

  return matter.stringify(`${draft.body}\n`, {
    title: draft.title,
    slug: draft.slug,
    description: draft.description,
    date: dateISO,
    updated: dateISO,
    tags: draft.tags,
    category: draft.category ?? "news",
    sources,
    status: "draft",
    author: AUTHOR,
  });
}

export function draftFilename(slug: string, dateISO: string): string {
  return `${dateISO}-${slug}.mdx`;
}

/**
 * Drafts land in content/drafts/ and nothing here can put a file anywhere else: publishing
 * is a human moving the file and committing it, which is the guardrail that keeps an
 * unattended run from putting unreviewed text in front of Google.
 */
export function writeDraft(
  draftsDir: string,
  postsDir: string,
  draft: DraftArticle,
  sources: string[],
  dateISO: string,
): string {
  const target = path.resolve(draftsDir);
  if (path.basename(target) !== "drafts") {
    throw new Error(`refusing to write outside a drafts directory: ${target}`);
  }
  if (target === path.resolve(postsDir)) {
    throw new Error("refusing to write into the published posts directory");
  }

  const filename = draftFilename(draft.slug, dateISO);
  const file = path.join(target, filename);
  if (fs.existsSync(file)) {
    // Never overwrite a draft a human may already be editing.
    return file;
  }

  const mdx = toMdx(draft, sources, dateISO);
  const tmp = `${file}.tmp`;
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(tmp, mdx);
  fs.renameSync(tmp, file);
  return file;
}

export function sourceLinksFor(item: FeedItem | null, extra: string[] = []): string[] {
  const links = item ? [item.link] : [];
  return [...new Set([...links, ...extra])];
}
