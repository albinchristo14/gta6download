import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPublishedPostBySlug, getPublishedPosts } from "@/lib/posts";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata, absoluteUrl } from "@/lib/seo";
import { categoryMeta } from "@/lib/taxonomy";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/AdSlot";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { RelatedContent } from "@/components/RelatedContent";
import { EmailSignup } from "@/components/EmailSignup";
import { siteConfig } from "@/site.config";

export const dynamicParams = false;

const mdxComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const external = props.href?.startsWith("http");
    return (
      <a
        {...props}
        {...(external ? { target: "_blank", rel: "noopener noreferrer sponsored" } : {})}
      />
    );
  },
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    path: `/news/${post.slug}`,
    keywords: post.frontmatter.tags,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);
  if (!post) notFound();

  const fm = post.frontmatter;
  const meta = categoryMeta(fm.category);
  const published = formatDate(fm.date);
  const updated = formatDate(fm.updated);

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(fm),
          breadcrumbJsonLd([
            { name: "Home", url: absoluteUrl("/") },
            { name: meta.label, url: absoluteUrl(meta.path) },
            { name: fm.title, url: absoluteUrl(`/news/${fm.slug}`) },
          ]),
        ]}
      />

      <article>
        <header className="border-b border-ink-200 bg-white">
          <div className="container-page max-w-3xl py-10 sm:py-14">
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
                <li>
                  <Link href="/" className="hover:text-brand-700">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={meta.path} className="hover:text-brand-700">
                    {meta.label}
                  </Link>
                </li>
              </ol>
            </nav>

            <p className="eyebrow text-brand-600">{meta.label}</p>
            <h1 className="mt-2 text-balance text-3xl font-bold leading-tight tracking-tight text-ink-950 sm:text-4xl">
              {fm.title}
            </h1>
            <p className="mt-4 text-balance text-lg leading-8 text-ink-600">{fm.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500">
              <span className="font-semibold text-ink-700">{fm.author}</span>
              <span>
                Published <time dateTime={fm.date}>{published}</time>
              </span>
              {fm.updated !== fm.date && (
                <span>
                  Updated <time dateTime={fm.updated}>{updated}</time>
                </span>
              )}
              <Link href="/about" className="underline hover:text-brand-700">
                How we source this
              </Link>
            </div>
          </div>
        </header>

        <div className="container-page py-10 sm:py-14">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="min-w-0">
              <AdSlot id="article-top" minHeight={90} />

              <div className="prose-gta">
                <MDXRemote source={post.content} components={mdxComponents} />
              </div>

              <AdSlot id="article-bottom" minHeight={250} />

              <section
                aria-labelledby="sources-heading"
                className="mt-10 rounded-lg border border-ink-200 bg-ink-50 p-5"
              >
                <h2 id="sources-heading" className="text-sm font-bold uppercase tracking-wider text-ink-700">
                  Sources
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-6">
                  {fm.sources.map((src) => (
                    <li key={src} className="break-words">
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-brand-700 underline hover:text-brand-800"
                      >
                        {src.replace(/^https?:\/\//, "")}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-5 text-ink-500">
                  Every factual claim on this page was checked against the links above. If something
                  has changed,{" "}
                  <Link href="/contact" className="underline">
                    tell us
                  </Link>{" "}
                  and we will correct it — corrections are logged on the page they affect.
                </p>
              </section>

              <AffiliateDisclosure className="mt-6" />
              <RelatedContent slug={post.slug} />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-ink-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  GTA 6 status
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink-950">
                  {siteConfig.statusHeadline}
                </p>
                <Link
                  href="/gta-6-download"
                  className="btn btn-primary mt-4 w-full text-center"
                >
                  Download status
                </Link>
              </div>

              <EmailSignup title="Launch alert" context={`article:${post.slug}`} id="article" />

              <nav aria-label="Related pages" className="rounded-lg border border-ink-200 bg-white p-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink-500">
                  Popular pages
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-6">
                  {[
                    { href: "/gta-6-download", label: "Can I download GTA 6 yet?" },
                    { href: "/gta-6-release-date", label: "GTA 6 release date" },
                    { href: "/gta-6-system-requirements", label: "System requirements" },
                    { href: "/where-to-buy", label: "Where to buy" },
                    { href: "/tools/can-i-run-gta-6", label: "Can I run GTA 6?" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-brand-700 hover:underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
