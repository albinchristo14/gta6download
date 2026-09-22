import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { affiliateStores, getStore } from "@/affiliates.config";
import { downloadPages, getDownloadPage } from "@/lib/download-pages";
import { getPublishedPostBySlug } from "@/lib/posts";
import { pageMetadata, breadcrumbJsonLd, softwareAppJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section, StatusPill, UpdatedNote } from "@/components/Layout";
import { Countdown } from "@/components/Countdown";
import { EmailSignup } from "@/components/EmailSignup";
import { AffiliateLink, StoreUnavailable } from "@/components/AffiliateLink";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { PostCard } from "@/components/PostCard";

export function generateStaticParams() {
  return downloadPages.map((page) => ({ downloadSlug: page.slug }));
}

// Anything not in the curated family is a 404 rather than an invented doorway page.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ downloadSlug: string }>;
}): Promise<Metadata> {
  const { downloadSlug } = await params;
  const page = getDownloadPage(downloadSlug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    keywords: [page.slug.replace(/-/g, " ")],
  });
}

export default async function DownloadPageRoute({
  params,
}: {
  params: Promise<{ downloadSlug: string }>;
}) {
  const { downloadSlug } = await params;
  const page = getDownloadPage(downloadSlug);
  if (!page) notFound();

  const stores = page.storeIds
    .map((id) => getStore(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const related = page.relatedSlug ? getPublishedPostBySlug(page.relatedSlug) : null;
  const siblings = downloadPages.filter((p) => p.slug !== page.slug).slice(0, 6);
  const crumb = [
    { name: "Home", href: "/" },
    { name: "Download status", href: "/gta-6-download" },
    { name: page.h1, href: `/${page.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) }))),
          ...(page.intent === "real"
            ? [softwareAppJsonLd({ name: "Grand Theft Auto VI", os: page.slug.includes("ps5") ? "PlayStation 5" : "Xbox Series X|S", category: "Game" })]
            : []),
        ]}
      />

      <PageHeader
        crumbs={crumb}
        eyebrow={page.intent === "real" ? "Confirmed platform · pre-order open" : "Honest answer · no such product exists"}
        title={page.h1}
        description={page.description}
      >
        <div className="flex flex-wrap items-center gap-4">
          <StatusPill tone={page.intent === "real" ? "ok" : "warn"} />
          <Countdown target={siteConfig.releaseDate} onRelease="GTA 6 is out today" />
        </div>
      </PageHeader>

      <Section title="Where this actually stands">
        <div className="max-w-3xl space-y-4">
          <p className="text-[1.0625rem] leading-7 text-ink-800">{page.intro}</p>
          <UpdatedNote />
        </div>
      </Section>

      <Section title="What is (and is not) true right now">
        <ul className="max-w-3xl space-y-3">
          {page.facts.map((fact) => (
            <li key={fact} className="flex gap-3 text-[0.9375rem] leading-7 text-ink-800">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {fact}
            </li>
          ))}
        </ul>
      </Section>

      {page.warning && (
        <Section>
          <div className="max-w-3xl rounded-xl border-l-4 border-sunset-500 bg-sunset-500/5 p-5">
            <h2 className="text-base font-bold text-ink-950">Before you click anything else</h2>
            <p className="mt-2 text-sm leading-7 text-ink-700">{page.warning}</p>
          </div>
        </Section>
      )}

      <Section
        title={page.intent === "real" ? "Official pre-order options" : "The only legitimate way to get GTA 6"}
        description={
          page.intent === "real"
            ? "Digital and physical pre-orders are open for this platform."
            : "Since no product matches this search, the legitimate option is the console pre-order — nothing more."
        }
      >
        <AffiliateDisclosure />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {stores.map((store) =>
            store.available ? (
              <div key={store.id} className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{store.platform}</p>
                <h3 className="mt-1 text-base font-bold text-ink-950">{store.name}</h3>
                <p className="mt-1 text-sm text-ink-600">
                  {store.edition} · {store.price}
                </p>
                {store.note && <p className="mt-2 text-xs leading-5 text-ink-500">{store.note}</p>}
                <AffiliateLink store={store} className="mt-4">
                  Pre-order at {store.name}
                </AffiliateLink>
              </div>
            ) : (
              <StoreUnavailable key={store.id} store={store} />
            ),
          )}
        </div>
      </Section>

      <Section>
        <EmailSignup
          id={`${page.slug}-notify`}
          title="Get notified when this changes"
          description="We update this page when Rockstar says anything about it — and email you if a version matching this search ever becomes real."
          context={page.slug}
        />
      </Section>

      {related && (
        <Section title="Related reading">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <PostCard post={related} />
          </div>
        </Section>
      )}

      <Section
        title="Other GTA 6 download questions"
        description="Each page answers its own search honestly, including the ones with no product behind them."
        href="/gta-6-download"
        hrefLabel="Full download status"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {siblings.map((sibling) => (
            <Link
              key={sibling.slug}
              href={`/${sibling.slug}`}
              className="rounded-lg border border-ink-200 bg-white p-4 text-sm font-semibold leading-6 text-ink-900 hover:border-brand-400"
            >
              {sibling.h1}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
