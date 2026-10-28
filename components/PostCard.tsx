import Link from "next/link";
import type { Post } from "@/lib/posts";
import { postPath } from "@/lib/pseo";
import { categoryMeta } from "@/lib/taxonomy";

export function PostCard({ post, showCategory = true }: { post: Post; showCategory?: boolean }) {
  const { title, description, date, category, slug, image } = post.frontmatter;
  const meta = categoryMeta(category);

  return (
    <article className="card post-card group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-glow">
      {image && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={image} alt="" width="640" height="360" loading="lazy" decoding="async" className="post-card-image aspect-video w-full object-cover" />
      )}
      <div className="post-card-copy flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs">
          {showCategory && (
            <Link
              href={meta.path}
              className="relative z-10 rounded-full bg-brand-50 px-2.5 py-1 font-semibold uppercase tracking-wider text-brand-700"
            >
              {meta.label}
            </Link>
          )}
          <time dateTime={date} className="text-ink-500">
            {new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        </div>

        <h3 className="mt-3 text-lg font-bold leading-snug text-ink-950">
          <Link href={postPath(slug)} className="after:absolute after:inset-0 group-hover:text-brand-700">
            {title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-600">{description}</p>
        <span className="relative mt-auto pt-4 text-sm font-semibold text-brand-700">Read more</span>
      </div>
    </article>
  );
}
