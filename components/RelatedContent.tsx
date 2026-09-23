import Link from "next/link";
import { postPath } from "@/lib/pseo";
import { relatedPosts, categories } from "@/lib/taxonomy";

/**
 * Cross-silo internal linking. Renders nothing when an article genuinely has no
 * related reading rather than padding the page with arbitrary links.
 */
export function RelatedContent({ slug, heading = "Keep reading" }: { slug: string; heading?: string }) {
  const related = relatedPosts(slug, 4);
  const otherCategories = categories.filter((c) => {
    const own = related.find((p) => p.frontmatter.category === c.id);
    return !own;
  });

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-14 border-t border-ink-200 pt-8">
      <h2 id="related-heading" className="text-lg font-bold tracking-tight text-ink-950">
        {heading}
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {related.map((post) => (
          <li key={post.slug}>
            <Link
              href={postPath(post.slug)}
              className="flex h-full flex-col rounded-lg border border-ink-200 bg-white p-4 hover:border-brand-400"
            >
              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-brand-600">
                {categories.find((c) => c.id === post.frontmatter.category)?.label}
              </span>
              <span className="mt-1.5 text-sm font-semibold leading-6 text-ink-950">
                {post.frontmatter.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {otherCategories.length > 0 && (
        <nav aria-label="Other topics" className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-500">Other silos:</span>
          {otherCategories.slice(0, 5).map((c) => (
            <Link
              key={c.id}
              href={c.path}
              className="rounded-full border border-ink-200 px-2.5 py-1 text-xs font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-700"
            >
              {c.label}
            </Link>
          ))}
        </nav>
      )}
    </section>
  );
}
