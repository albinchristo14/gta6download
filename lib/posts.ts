import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

export const CATEGORIES = [
  "downloads",
  "installation",
  "requirements",
  "errors",
  "news",
  "guides",
  "comparisons",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    date: z.string().min(1),
    updated: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.enum(CATEGORIES).default("news"),
    sources: z.array(z.string().url()).min(1, "at least one source URL is required"),
    status: z.enum(["draft", "published"]).default("published"),
    author: z.string().min(1),
    image: z.string().optional(),
  })
  .transform((fm) => ({ ...fm, updated: fm.updated ?? fm.date }));

export type PostFrontmatter = z.infer<typeof frontmatterSchema>;

export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
  slug: string;
  /** Filename on disk, relative to the posts dir — carried so drafts can be traced back. */
  file: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

function readPostsFrom(dirName: "posts" | "drafts"): Post[] {
  const dir = path.join(CONTENT_DIR, dirName);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      let parsed: Post;
      try {
        const { frontmatter, content } = parsePost(raw);
        parsed = { frontmatter, content, slug: frontmatter.slug, file };
      } catch (err) {
        throw new Error(`${dirName}/${file}: ${(err as Error).message}`);
      }
      return parsed;
    })
    .sort((a, b) => Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date));
}

export function parsePost(raw: string): { frontmatter: PostFrontmatter; content: string } {
  const { data, content } = matter(raw);
  const result = frontmatterSchema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid frontmatter — ${detail}`);
  }
  return { frontmatter: result.data, content };
}

/** Everything in content/posts/, newest first, drafts and published alike. */
export function getAllPosts(): Post[] {
  return readPostsFrom("posts");
}

/** Only what the public site should list, link, or index. */
export function getPublishedPosts(): Post[] {
  return getAllPosts().filter((p) => p.frontmatter.status === "published");
}

/** Drafts awaiting human review — never rendered by the public site. */
export function getDraftPosts(): Post[] {
  return readPostsFrom("drafts");
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}

export function getPublishedPostBySlug(slug: string): Post | null {
  return getPublishedPosts().find((p) => p.slug === slug) ?? null;
}
