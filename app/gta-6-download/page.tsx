import Link from "next/link";
import { siteConfig } from "@/site.config";
import { affiliateStores, availableStores } from "@/affiliates.config";
import { downloadPages } from "@/lib/download-pages";
import { faqItems } from "@/lib/faq";
import { getPublishedPostBySlug } from "@/lib/posts";
import { pageMetadata, breadcrumbJsonLd, faqJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section, StatusPill, Breadcrumbs } from "@/components/Layout";
import { Countdown } from "@/components/Countdown";
import { EmailSignup } from "@/components/EmailSignup";
import { AffiliateLink, StoreUnavailable } from "@/components/AffiliateLink";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { AdSlot } from "@/components/AdSlot";
import { PostCard } from "@/components/PostCard";

export const metadata = pageMetadata({
  title: "GTA 6 Download Status — not released, pre-orders open, official stores only",
  description:
    "GTA 6 cannot be downloaded yet. It releases 19 November 2026 on PS5 and Xbox Series X|S. Live countdown, official pre-order links, PC reality and scam warnings.",
  path: "/gta-6-download",
  keywords: ["gta 6 download", "download gta 6", "gta 6 release date", "gta 6 pre order"],
});

const crumb = [
  { name: "Home", href: "/" },
  { name: "GTA 6 Download", href: "/gta-6-download" },
];

const PLATFORM_ROWS = [
  {
    platform: "PlayStation 5",
    status: "Confirmed · pre-order open",
    detail: "$79.99 Standard, $99.99 Ultimate. Pre-load reported from 12 Nov; unlocks 5pm PT on 18 Nov.",
    tone: "ok" as const,
  },
  {
    platform: "Xbox Series X|S",
    status: "Confirmed · pre-order open",
    detail: "Same two tiers, Series X|S only — One, One X and 360 are not supported.",
    tone: "ok" as const,
  },
  {
    platform: "PC (Steam / Epic / Rockstar Launcher)",
    status: "Not announced",
    detail: "No PC version, no listing, no system requirements. Nothing legitimate to download.",
    tone: "warn" as const,
  },
  {
    platform: "Android / iOS",
    status: "Never announced",
    detail: "Any APK or App Store listing is a scam payload, not a game build.",
    tone: "warn" as const,
  },
];

export default function Gta6DownloadPage() {
  const stores = affiliateStores;
  const real = downloadPages.filter((p) => p.intent === "real");
  const noProduct = downloadPages.filter((p) => p.intent === "no_product");
  const guides = [
    "gta-6-release-date-november-19-2026",
    "can-you-download-gta-6-right-now",
    "gta-6-pc-download-status",
  ]
    .map((slug) => getPublishedPostBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => p !== null);
  const downloadFaqs = faqItems.filter((f) =>
    /download|pc|steam|free|out yet|early/i.test(f.question),
  );

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) }))),
          faqJsonLd(downloadFaqs),
        ]}
      />

      <PageHeader
        crumbs={crumb}
        eyebrow="Download status · reviewed 22 September 2026"
        title="GTA 6 download: nothing is available yet, and here is what is"
        description={siteConfig.statusHeadline}
      >
        <Countdown target={siteConfig.releaseDate} onRelease="GTA 6 is out today — servers and downloads are live" />
        <div className="mt-6">
          <StatusPill />
        </div>
      </PageHeader>

      <Section title="The short answer">
        <div className="max-w-3xl space-y-4 text-[1.0625rem] leading-7 text-ink-800">
          <p>
            <strong className="font-semibold text-ink-950">You cannot download GTA 6.</strong> No
            platform has a copy of the game available, and that will not change until it releases at
            00:00 local time on <strong className="font-semibold text-ink-950">19 November 2026</strong>.
            Rockstar has confirmed PlayStation 5 and Xbox Series X|S only — there is no announced PC
            version, which is why every "GTA 6 PC download" page on the internet is inventing
            something.
          </p>
          <p>
            What you <em>can</em> do today is pre-order. Digital pre-orders have been live since 25
            June 2026 through the Rockstar Store, PlayStation Store, Microsoft Store and authorised
            physical retailers, starting at $79.99 for the Standard Edition and $99.99 for Ultimate.
            Pre-load for pre-orders is reported to open on <strong className="font-semibold text-ink-950">12 November 2026</strong>,
            so the download can finish before release — and the game then unlocks at{" "}
            <strong className="font-semibold text-ink-950">5pm PT on 18 November</strong>, which is
            midnight in the UK on 19 November.
          </p>
          <p>
            One purchase detail catches people out: boxed physical editions ship as a{" "}
            <strong className="font-semibold text-ink-950">download code with no disc inside</strong>.
            If you want a disc you cannot own, or you have slow or capped internet, buy digital
            deliberately rather than paying a retailer premium for packaging that contains nothing.
          </p>
        </div>
      </Section>

      <Section
        title="Platform by platform"
        description="Confirmed, not announced, or never going to happen — the distinction matters more than the countdown."
      >
        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead className="bg-ink-100 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Platform</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">What that means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 bg-white">
              {PLATFORM_ROWS.map((row) => (
                <tr key={row.platform}>
                  <td className="px-4 py-3 font-semibold text-ink-950">{row.platform}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.tone === "ok"
                          ? "rounded-full bg-palm-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-sunset-500/10 px-2.5 py-1 text-xs font-semibold text-sunset-600"
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 leading-6 text-ink-600">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <AdSlot id="download-mid" />

      <Section
        title="Official pre-order links"
        description="Every button below goes to a legitimate storefront. We do not link anywhere else, and we have no way to give you the game early."
      >
        <AffiliateDisclosure />
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) =>
            store.available ? (
              <div key={store.id} className="card flex flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  {store.platform}
                </p>
                <h3 className="mt-1 text-base font-bold text-ink-950">{store.name}</h3>
                <p className="mt-1 text-sm text-ink-600">
                  {store.edition} · {store.price}
                </p>
                {store.note && <p className="mt-2 flex-1 text-xs leading-5 text-ink-500">{store.note}</p>}
                <AffiliateLink store={store} className="mt-4 self-start">
                  Pre-order at {store.name}
                </AffiliateLink>
              </div>
            ) : (
              <StoreUnavailable key={store.id} store={store} />
            ),
          )}
        </div>
        <p className="mt-4 text-xs text-ink-500">
          Prices and editions are as published by Rockstar and its retail partners in September 2026
          and can change. Only the $159.99 Collector's edition is Xbox-exclusive; the C++ Edition is
          a Rockstar Direct offer.
        </p>
      </Section>

      <Section
        title="Search-specific answers"
        description="These pages exist because each one has a different honest answer. None of them pretends a download exists."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...real, ...noProduct].map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="rounded-lg border border-ink-200 bg-white p-4 hover:border-brand-400"
            >
              <span className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-wider">
                {page.intent === "real" ? (
                  <span className="text-emerald-700">Pre-orderable</span>
                ) : (
                  <span className="text-sunset-600">No product exists</span>
                )}
              </span>
              <span className="mt-1.5 block text-sm font-semibold leading-6 text-ink-950">
                {page.h1}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <section className="bg-ink-950 text-white">
        <div className="container-page grid gap-8 py-14 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Why a GTA 6 download before 19 November is always a scam
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-300">
              The logic is simple and does not require any technical knowledge: no copy of the game
              has shipped, so no file can be the game. That makes every offer a fraud by definition,
              and the fraud is usually aimed at your card details or your device rather than at a
              hard drive.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-200">
              <li>• A real retailer never needs you to "verify as a human" to receive a purchase.</li>
              <li>• A store page without a publisher name, price and platform list is not a store page.</li>
              <li>• Sites have sold "GTA 6 early access" for over a hundred dollars with no refund path. No early access exists, so the product cannot be delivered.</li>
              <li>• We will never host, link to or distribute a game file. That is a policy, not a limitation.</li>
            </ul>
            <Link href="/gta-6-apk-download" className="btn mt-6 border border-ink-600 text-ink-100 hover:border-brand-400 hover:text-white">
              What fake GTA 6 files actually do
            </Link>
          </div>
          <EmailSignup
            id="download-notify"
            title="Notify me when GTA 6 is actually downloadable"
            description="One email at pre-load or launch, and a separate alert if Rockstar ever announces a PC version. No newsletter, no selling your address."
            context="gta-6-download"
          />
        </div>
      </section>

      {guides.length > 0 && (
        <Section title="Read next" href="/news" hrefLabel="All articles">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </Section>
      )}

      <Section title="Download questions, answered">
        <dl className="max-w-3xl divide-y divide-ink-200 border-t border-ink-200">
          {downloadFaqs.map((item) => (
            <div key={item.question} className="py-5">
              <dt className="text-base font-semibold text-ink-950">{item.question}</dt>
              <dd className="mt-1.5 text-sm leading-7 text-ink-600">{item.answer}</dd>
            </div>
          ))}
        </dl>
        <Link href="/faq" className="mt-4 inline-block text-sm font-semibold text-brand-700">
          Full FAQ →
        </Link>
      </Section>
    </>
  );
}
