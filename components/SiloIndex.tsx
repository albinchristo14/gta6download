import Link from "next/link";
import type { Category } from "@/lib/posts";
import { categoryMeta, postsByCategory } from "@/lib/taxonomy";
import { downloadPages } from "@/lib/download-pages";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PostCard } from "@/components/PostCard";
import { EmailSignup } from "@/components/EmailSignup";
import { AdSlot } from "@/components/AdSlot";
import { siteConfig } from "@/site.config";

export function siloMetadata(category: Category) {
  const meta = categoryMeta(category);
  return pageMetadata({
    title: category === "downloads" ? "GTA 6 Download: PS5, Xbox and PC Availability" : category === "installation" ? "How to Install GTA 6: Pre-load and Platform Guide" : `${meta.label} — GTA 6`,
    description: meta.blurb,
    path: meta.path,
    keywords: [meta.label.toLowerCase(), "gta 6"],
  });
}

const CROSS_LINKED_DOWNLOAD_SLUGS: Record<Category, string[]> = {
  downloads: ["gta-6-download-ps5", "gta-6-download-xbox", "gta-6-download-pc", "gta-6-download-mobile"],
  installation: ["gta-6-download-ps5", "gta-6-download-xbox", "gta-6-download-offline"],
  requirements: ["gta-6-download-pc", "gta-6-download-windows-11", "gta-6-download-ps5"],
  errors: ["gta-6-download-ps5", "gta-6-download-xbox", "gta-6-download-steam"],
  news: ["gta-6-download-ps5", "gta-6-download-xbox", "gta-6-download-pc"],
  guides: ["gta-6-download-ps5", "gta-6-download-xbox", "gta-6-apk-download"],
  comparisons: ["gta-6-download-pc", "gta-6-download-ps5", "gta-6-download-xbox"],
};

export function SiloIndex({ category }: { category: Category }) {
  const meta = categoryMeta(category);
  const posts = postsByCategory(category);
  const relatedPages = downloadPages.filter((d) =>
    CROSS_LINKED_DOWNLOAD_SLUGS[category].includes(d.slug),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: meta.label, url: absoluteUrl(meta.path) },
        ])}
      />

      <div className="hero-gradient border-b border-ink-800 text-white">
        <div className="container-page py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-5">
            <Link href="/" className="text-xs text-ink-400 hover:text-white">
              Home / <span className="text-ink-200">{meta.label}</span>
            </Link>
          </nav>
          <p className="eyebrow text-brand-300">Silo</p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            GTA 6 {meta.label}
          </h1>
          <p className="mt-4 max-w-3xl text-balance leading-7 text-ink-200">{meta.blurb}</p>
          <p className="mt-4 text-xs text-ink-400">
            {posts.length} article{posts.length === 1 ? "" : "s"} in this silo · last checked{" "}
            {siteConfig.lastReviewed}
          </p>
        </div>
      </div>

      <div className="container-page py-12">
        {(category === "downloads" || category === "installation") && (
          <section className="mb-10 max-w-3xl rounded-xl border border-ink-200 bg-white p-6">
            <h2 className="text-xl font-bold text-ink-950">GTA 6 download and pre-load status</h2>
            <p className="mt-3 leading-7 text-ink-800">
              Rockstar says GTA 6 launches on 19 November 2026 for PS5 and Xbox Series X|S.
              Pre-load begins at local midnight on 12 November for eligible purchases. A PC version
              has not been announced. Check the{" "}
              <a href="https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions-Platforms" className="font-semibold text-brand-700 underline underline-offset-2">official platform and pre-load FAQ</a>{" "}
              for details, and see our <Link href="/where-to-buy" className="font-semibold text-brand-700 underline underline-offset-2">buying guide</Link> for purchase options.
            </p>
          </section>
        )}
        <AdSlot id="silo-top" />

        {posts.length === 0 ? (
          <div className="card max-w-2xl p-6">
            <h2 className="text-base font-bold text-ink-950">Nothing published here yet</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              We would rather leave this silo empty than fill it with pages that say nothing.
              GTA 6 {meta.label.toLowerCase()} coverage lands as soon as there is something
              verified to say — the{" "}
              <Link href="/gta-6-download" className="font-semibold text-brand-700 underline">
                download status page
              </Link>{" "}
              is kept current in the meantime.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} showCategory={false} />
            ))}
          </div>
        )}

        {relatedPages.length > 0 && (
          <section className="mt-14 border-t border-ink-200 pt-8">
            <h2 className="text-lg font-bold tracking-tight text-ink-950">
              Platform and format pages
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {relatedPages.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/${d.slug}`}
                    className="rounded-full border border-ink-200 px-3 py-1.5 font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-700"
                  >
                    {d.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-14 max-w-2xl">
          <EmailSignup
            title="Get the launch alert"
            description={`New ${meta.label.toLowerCase()} pages appear here first, plus one email when a real download exists.`}
            context={`silo:${category}`}
            id={category}
          />
        </div>
      </div>
    </>
  );
}
