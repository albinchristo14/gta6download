import Link from "next/link";
import { siteConfig } from "@/site.config";
import { getPublishedPosts } from "@/lib/posts";
import { categories } from "@/lib/taxonomy";
import { faqItems } from "@/lib/faq";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Section, PageHeader, StatusPill } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { Countdown } from "@/components/Countdown";
import { EmailSignup } from "@/components/EmailSignup";
import { AdSlot } from "@/components/AdSlot";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";

export const metadata = pageMetadata({
  title: "GTA 6 Download Hub — status, release date, news and where to buy",
  description:
    "GTA 6 is not downloadable yet. Live release countdown, confirmed platforms, honest pre-order guidance and news checked against Rockstar's own announcements.",
  path: "/",
  keywords: ["gta 6 download", "gta 6", "gta 6 release date", "gta 6 pre-order"],
});

const FACTS = [
  {
    q: "Can I download GTA 6 right now?",
    a: "No. There is no playable or downloadable copy on any platform. Anyone offering one is selling you malware or nothing.",
    href: "/gta-6-download",
    linkLabel: "Read the full status",
  },
  {
    q: "Is there a PC version?",
    a: "Not announced. GTA 6 is confirmed for PS5 and Xbox Series X|S only, so there are no official PC system requirements either.",
    href: "/gta-6-system-requirements",
    linkLabel: "Requirements, honestly",
  },
  {
    q: "Where can I pre-order safely?",
    a: "Rockstar Store, PlayStation Store, Xbox Store, GameStop, Best Buy and Amazon. Prices start at $79.99 for PS5 and Xbox Series X|S.",
    href: "/where-to-buy",
    linkLabel: "Compare official stores",
  },
];

export default function HomePage() {
  const latest = getPublishedPosts().slice(0, 6);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Home", url: absoluteUrl("/") }])}
      />

      <PageHeader
        eyebrow="GTA 6 · download status"
        title="GTA 6 cannot be downloaded yet — here is exactly where things stand"
        description={siteConfig.statusHeadline}
      >
        <div className="flex flex-wrap items-center gap-4">
          <StatusPill />
          <Countdown target={siteConfig.releaseDate} onRelease="GTA 6 is out today" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/gta-6-download" className="btn-primary">
            Download status &amp; pre-order links
          </Link>
          <Link
            href="/gta-6-system-requirements"
            className="btn border border-ink-600 text-ink-100 hover:border-brand-400 hover:text-white"
          >
            System requirements
          </Link>
        </div>
      </PageHeader>

      <Section
        title="The three questions this site exists to answer"
        description="Every page here separates what Rockstar has confirmed from what is speculation. No fake download buttons."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {FACTS.map((f) => (
            <div key={f.q} className="card flex flex-col p-5">
              <h3 className="text-base font-bold text-ink-950">{f.q}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-600">{f.a}</p>
              <Link href={f.href} className="mt-4 text-sm font-semibold text-brand-700 hover:text-brand-800">
                {f.linkLabel} →
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <AdSlot id="home-after-facts" />

      <Section
        title="Latest GTA 6 news"
        description="Rewritten and checked against the primary source, with the original link on every article."
        href="/news"
        hrefLabel="All news"
      >
        {latest.length === 0 ? (
          <p className="text-sm text-ink-500">No published articles yet — run the ingest pipeline and review a draft.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Section>

      <section className="bg-ink-100">
        <div className="container-page grid gap-8 py-14 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink-950">Browse by topic</h2>
            <p className="mt-1.5 text-sm text-ink-600">
              The hub is organised into silos so each answer links to the next question you will have.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={c.path}
                    className="flex h-full flex-col rounded-lg border border-ink-200 bg-white p-4 hover:border-brand-400"
                  >
                    <span className="text-sm font-bold text-ink-950">{c.label}</span>
                    <span className="mt-1 text-xs leading-5 text-ink-600">{c.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-ink-200 bg-white p-6">
              <h2 className="text-lg font-bold text-ink-950">Estimate instead of guessing</h2>
              <p className="mt-1.5 text-sm leading-6 text-ink-600">
                Two free tools that label every number as a projection, because no real GTA 6 benchmark
                data exists before launch.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/tools/fps-estimator" className="btn-secondary">
                  FPS estimator
                </Link>
                <Link href="/tools/can-i-run-gta-6" className="btn-secondary">
                  Can I run GTA 6?
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-ink-200 bg-white p-6">
              <h2 className="text-lg font-bold text-ink-950">Common questions</h2>
              <dl className="mt-4 space-y-4">
                {faqItems.slice(0, 4).map((item) => (
                  <div key={item.question}>
                    <dt className="text-sm font-semibold text-ink-950">{item.question}</dt>
                    <dd className="mt-1 text-sm leading-6 text-ink-600">{item.answer}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/faq" className="mt-4 inline-block text-sm font-semibold text-brand-700">
                All {faqItems.length} questions →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <EmailSignup
            id="home-notify"
            title="Tell me the moment a real download exists"
            description="One email when GTA 6 goes live for pre-load, and another immediately if Rockstar ever announces a PC version. Nothing else."
            context="homepage"
          />
          <div className="text-sm leading-6 text-ink-600">
            <p className="font-semibold text-ink-900">Who we are</p>
            <p className="mt-1.5">
              GTA6Download is an independent fan-run information site. We are not affiliated with
              Rockstar Games or Take-Two Interactive, we never host game files, and we only link to
              official storefronts.
            </p>
            <AffiliateDisclosure className="mt-3" />
            <Link href="/about" className="font-semibold text-brand-700">
              How we source and review →
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
