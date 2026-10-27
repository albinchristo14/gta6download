import { CATEGORIES, getPublishedPosts, type Category, type Post } from "@/lib/posts";

export { CATEGORIES };
export type { Category };

export interface CategoryMeta {
  id: Category;
  label: string;
  path: string;
  blurb: string;
}

export const categories: CategoryMeta[] = [
  {
    id: "downloads",
    label: "Downloads",
    path: "/downloads",
    blurb: "GTA 6 download and pre-load information for PS5 and Xbox, plus the latest on PC availability.",
  },
  {
    id: "installation",
    label: "Installation",
    path: "/installation",
    blurb: "How to prepare for GTA 6 pre-load and installation on PS5 and Xbox, and what is known about PC.",
  },
  {
    id: "requirements",
    label: "Requirements",
    path: "/requirements",
    blurb: "Hardware expectations, separated carefully from official confirmation.",
  },
  {
    id: "errors",
    label: "Errors",
    path: "/errors",
    blurb: "Launcher and store errors that can genuinely block a pre-order or preload.",
  },
  {
    id: "news",
    label: "News",
    path: "/news",
    blurb: "Every GTA 6 announcement, checked against the primary source before we repeat it.",
  },
  {
    id: "guides",
    label: "Guides",
    path: "/guides",
    blurb: "Editions, bonuses, refunds and how to buy safely from an official storefront.",
  },
  {
    id: "comparisons",
    label: "Comparisons",
    path: "/comparisons",
    blurb: "GTA 6 measured against the games people actually compare it to.",
  },
];

export function categoryMeta(category: Category): CategoryMeta {
  return categories.find((c) => c.id === category) ?? categories.find((c) => c.id === "news")!;
}

export function postsByCategory(category: Category): Post[] {
  return getPublishedPosts().filter((p) => p.frontmatter.category === category);
}

/** Same category first, then anything sharing a tag — the cross-silo related block. */
export function relatedPosts(slug: string, limit = 4): Post[] {
  const posts = getPublishedPosts();
  const self = posts.find((p) => p.slug === slug);
  if (!self) return posts.filter((p) => p.slug !== slug).slice(0, limit);

  const rest = posts.filter((p) => p.slug !== slug);
  const scored = rest.map((p) => {
    const sameCategory = p.frontmatter.category === self.frontmatter.category ? 2 : 0;
    const sharedTags = p.frontmatter.tags.filter((t) => self.frontmatter.tags.includes(t)).length;
    return { p, score: sameCategory + sharedTags };
  });

  return scored
    .sort((a, b) => b.score - a.score || Date.parse(b.p.frontmatter.date) - Date.parse(a.p.frontmatter.date))
    .filter((s) => s.score > 0)
    .slice(0, limit)
    .map((s) => s.p);
}
