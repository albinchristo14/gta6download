import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import { isProgrammaticBody } from "@/lib/pseo";
import { categories } from "@/lib/taxonomy";
import { siteConfig } from "@/site.config";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { AdSlot } from "@/components/AdSlot";
import { EmailSignup } from "@/components/EmailSignup";

export const metadata = pageMetadata({
  title: "GTA 6 News — Every Announcement, Checked Against the Primary Source",
  description:
    "GTA 6 news with sourcing: release dates, delays, pre-order changes, PC status and requirements, each article linked to the evidence behind it.",
  path: "/news",
  keywords: ["gta 6 news", "gta 6 latest", "gta 6 update"],
});

const crumb = [
  { name: "Home", href: "/" },
  { name: "News", href: "/news" },
];

export default function NewsIndexPage() {
  const posts = getPublishedPosts().filter((post) => !isProgrammaticBody(post.slug));
  const [lead, ...rest] = posts;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) })))} />

      <PageHeader
        crumbs={crumb}
        eyebrow={`Updated ${siteConfig.lastReviewed}`}
        title="GTA 6 news"
        description="Every article here names its source, separates Rockstar's statements from third-party reporting, and is dated so you can tell a fresh answer from an old one."
      >
        <nav aria-label="Browse by topic" className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={c.path}
              className="rounded-full border border-ink-600 px-3 py-1.5 text-xs font-semibold text-ink-200 hover:border-brand-400 hover:text-white"
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </PageHeader>

      {lead && (
        <Section title="Newest">
          <article className="card relative overflow-hidden p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              {categories.find((c) => c.id === lead.frontmatter.category)?.label}
            </p>
            <h2 className="mt-3 text-balance text-2xl font-bold leading-snug text-ink-950 sm:text-3xl">
              <Link href={`/news/${lead.slug}`} className="after:absolute after:inset-0 hover:text-brand-700">
                {lead.frontmatter.title}
              </Link>
            </h2>
            <p className="mt-3 max-w-3xl text-[0.9375rem] leading-7 text-ink-600">
              {lead.frontmatter.description}
            </p>
            <p className="mt-4 text-xs text-ink-500">
              <time dateTime={lead.frontmatter.date}>
                {new Date(`${lead.frontmatter.date}T00:00:00Z`).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>{" "}
              · by {lead.frontmatter.author}
            </p>
          </article>
        </Section>
      )}

      <AdSlot id="news-after-lead" />

      {rest.length > 0 && (
        <Section title="More coverage">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </Section>
      )}

      <Section>
        <div className="max-w-2xl">
          <EmailSignup
            id="news-notify"
            title="Get the announcements, not the rumour mill"
            description="We email on two events only: when GTA 6 becomes actually downloadable, and if a PC version is ever confirmed."
            context="news-index"
          />
        </div>
      </Section>
    </>
  );
}
