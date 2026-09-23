import fs from "node:fs";
import path from "node:path";
import { parsePost, getPublishedPosts, type Category } from "../lib/posts";
import { categories } from "../lib/taxonomy";
import { downloadPages } from "../lib/download-pages";
import { pseoFamilies, loadRows, bodySlugFor, postPath } from "../lib/pseo";

const TITLE_MAX = 70;
const DESCRIPTION_MAX = 160;

/** Every route the site actually renders, so a typo in a link is a build failure. */
export function knownPaths(): Set<string> {
  const published = getPublishedPosts();
  const paths = new Set<string>([
    "/",
    "/gta-6-download",
    "/news",
    "/where-to-buy",
    "/gta-6-release-date",
    "/gta-6-system-requirements",
    "/faq",
    "/about",
    "/contact",
    "/privacy",
    "/disclaimer",
    "/tools/fps-estimator",
    "/tools/can-i-run-gta-6",
    "/feed.xml",
    "/sitemap.xml",
    "/robots.txt",
    ...categories.map((c) => c.path),
    ...downloadPages.map((d) => `/${d.slug}`),
    ...published.map((p) => postPath(p.slug)),
  ]);

  // A programmatic page's URL exists whether or not it is indexed, so links to it resolve.
  for (const family of pseoFamilies) {
    for (const row of loadRows(family)) {
      paths.add(`/${family.routeBase}/${row.slug}`);
    }
  }

  return paths;
}

function internalLinks(body: string): string[] {
  const found: string[] = [];
  const re = /\]\((\/[^)\s#]+)[^)]*\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) found.push(match[1]);
  return [...new Set(found)];
}

export function validateAllPosts(
  dir: string = path.join(process.cwd(), "content", "posts"),
): string[] {
  const errors: string[] = [];
  if (!fs.existsSync(dir)) return [`content directory missing: ${dir}`];

  const routes = knownPaths();
  const slugs = new Map<string, string>();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .sort();

  for (const file of files) {
    const label = `posts/${file}`;
    let post;
    try {
      const { frontmatter, content } = parsePost(fs.readFileSync(path.join(dir, file), "utf8"));
      post = { frontmatter, content };
    } catch (err) {
      errors.push(`${label}: ${(err as Error).message}`);
      continue;
    }

    const { title, slug, description, date, sources, category } = post.frontmatter;

    const existing = slugs.get(slug);
    if (existing) errors.push(`${label}: duplicate slug "${slug}", also used by ${existing}`);
    slugs.set(slug, file);

    if (title.length > TITLE_MAX) {
      errors.push(`${label}: title is ${title.length} characters, keep it under ${TITLE_MAX}`);
    }
    if (description.length > DESCRIPTION_MAX) {
      errors.push(
        `${label}: description is ${description.length} characters, keep it under ${DESCRIPTION_MAX}`,
      );
    }
    if (Number.isNaN(Date.parse(date))) {
      errors.push(`${label}: date "${date}" is not a parseable date`);
    }
    if (!Array.isArray(sources) || sources.length === 0) {
      errors.push(`${label}: published content must cite at least one source`);
    }
    if (post.content.trim().length < 400) {
      errors.push(`${label}: body is under 400 characters — too thin to publish`);
    }
    if (!categories.some((c) => c.id === (category as Category))) {
      errors.push(`${label}: unknown category "${category}"`);
    }

    for (const link of internalLinks(post.content)) {
      if (!routes.has(link)) {
        errors.push(`${label}: link to "${link}" does not resolve to any page`);
      }
    }
  }

  return errors;
}

/**
 * Literal `href="/somewhere"` strings in pages and components, checked the same way article
 * links are. Template hrefs are skipped because the value is computed at render time.
 */
export function validateLiteralHrefs(
  root: string = process.cwd(),
  dirs: string[] = ["app", "components"],
): string[] {
  const errors: string[] = [];
  const routes = knownPaths();

  const walk = (directory: string): string[] =>
    fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) return walk(full);
      return /\.(tsx?|jsx?)$/.test(entry.name) && !entry.name.endsWith(".test.ts") ? [full] : [];
    });

  for (const dir of dirs) {
    const base = path.join(root, dir);
    if (!fs.existsSync(base)) continue;
    for (const file of walk(base)) {
      const source = fs.readFileSync(file, "utf8");
      const re = /href\s*[:=]\s*"(\/[^"#]*)"/g;
      let match: RegExpExecArray | null;
      while ((match = re.exec(source)) !== null) {
        const href = match[1];
        if (href.includes("${")) continue;
        if (!routes.has(href)) {
          errors.push(`${path.relative(root, file)}: href "${href}" does not resolve to any page`);
        }
      }
    }
  }

  return errors;
}

if (process.argv[1] && /[\\/]validate-content\.(?:ts|mts|js|mjs|cjs)$/.test(process.argv[1])) {
  const errors = [...validateAllPosts(), ...validateLiteralHrefs()];
  if (errors.length > 0) {
    console.error(`[validate-content] ${errors.length} problem(s):\n` + errors.join("\n"));
    process.exit(1);
  }
  console.log("[validate-content] all posts and internal links valid.");
}
