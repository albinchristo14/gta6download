import Link from "next/link";
import { affiliateStores } from "@/affiliates.config";
import { siteConfig } from "@/site.config";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section, UpdatedNote } from "@/components/Layout";
import { AffiliateLink, StoreUnavailable } from "@/components/AffiliateLink";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { AdSlot } from "@/components/AdSlot";

export const metadata = pageMetadata({
  title: "Where to Buy GTA 6 — Every Official Store, Compared",
  description:
    "GTA 6 pre-orders are live on the Rockstar Store, PlayStation Store, Xbox Store, GameStop, Best Buy and Amazon from $79.99. Compare editions, bonuses and platform exclusives.",
  path: "/where-to-buy",
  keywords: ["where to buy gta 6", "gta 6 pre order", "gta 6 price", "gta 6 editions"],
});

const EDITIONS = [
  {
    name: "Standard Edition",
    price: "$79.99",
    includes: "The game. No launch bonus content is listed for this tier on Rockstar's editions page.",
    availability: "All official storefronts",
  },
  {
    name: "Ultimate Edition",
    price: "$99.99",
    includes: "The game plus additional in-game content — listings describe extras such as clothing, tattoos, vehicles, weapons and bonus items.",
    availability: "Rockstar Store, PlayStation Store, Microsoft Store",
  },
  {
    name: "Boxed physical",
    price: "$79.99 RRP",
    includes: "A download code in a box. There is no disc — Rockstar confirmed this for launch, and some retailers declined to stock it.",
    availability: "Authorised physical retailers",
  },
  {
    name: "Early access",
    price: "Does not exist",
    includes: "Neither published tier buys an earlier start. Pre-load is reported to open 12 November 2026 for pre-orders.",
    availability: "No such product",
  },
];

const crumb = [
  { name: "Home", href: "/" },
  { name: "Where to buy", href: "/where-to-buy" },
];

export default function WhereToBuyPage() {
  const live = affiliateStores.filter((s) => s.available);
  const notLive = affiliateStores.filter((s) => !s.available);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) })))} />

      <PageHeader
        crumbs={crumb}
        eyebrow="Buying guide · September 2026"
        title="Where to buy GTA 6 — six legitimate stores, and everywhere else is not"
        description="GTA 6 releases 19 November 2026 on PS5 and Xbox Series X|S. Pre-orders are open now, from $79.99. There is no PC version to buy, so no PC store page can be real."
      />

      <Section
        title="Official stores with a real GTA 6 listing"
        description="Affiliate links: if you buy through them we earn a commission at no cost to you. We only ever list storefronts that can actually deliver the game."
      >
        <AffiliateDisclosure />
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {live.map((store) => (
            <div key={store.id} className="card flex flex-col p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{store.platform}</p>
              <h2 className="mt-1 text-base font-bold text-ink-950">{store.name}</h2>
              <p className="mt-1 text-sm text-ink-600">
                {store.edition} · {store.price}
              </p>
              {store.note && <p className="mt-2 flex-1 text-xs leading-5 text-ink-500">{store.note}</p>}
              <AffiliateLink store={store} className="mt-4 self-start">
                Go to {store.name}
              </AffiliateLink>
            </div>
          ))}
        </div>
      </Section>

      <AdSlot id="buy-after-stores" />

      <Section
        title="Editions and prices"
        description="Published by Rockstar and its retail partners as of September 2026. Confirm at checkout — retailer bundles change."
      >
        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead className="bg-ink-100 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Edition</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">What you get</th>
                <th className="px-4 py-3 font-semibold">Where</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 bg-white">
              {EDITIONS.map((e) => (
                <tr key={e.name}>
                  <td className="px-4 py-3 font-semibold text-ink-950">{e.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{e.price}</td>
                  <td className="px-4 py-3 leading-6 text-ink-600">{e.includes}</td>
                  <td className="px-4 py-3 text-ink-600">{e.availability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <UpdatedNote className="mt-4" />
      </Section>

      <Section
        title="Stores with no GTA 6 listing — and why that matters"
        description="These are the pages scammers imitate, because they are where searchers expect to find the game."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notLive.map((store) => (
            <StoreUnavailable key={store.id} store={store} />
          ))}
        </div>
      </Section>

      <Section title="How to choose, in three lines">
        <ol className="max-w-3xl list-decimal space-y-3 pl-5 text-[1.0625rem] leading-7 text-ink-800">
          <li>
            Buy for the console you own: <strong className="font-semibold text-ink-950">PS5</strong> or{" "}
            <strong className="font-semibold text-ink-950">Xbox Series X|S</strong>. Nothing else can
            run it, and a licence does not transfer between families.
          </li>
          <li>
            Pick for the bonus, not the sticker price: retailer in-game extras differ, and the{" "}
            <Link href="/gta-6-editions-compared-which-to-preorder" className="font-semibold text-brand-700 underline underline-offset-2">
              editions comparison
            </Link>{" "}
            lays out what each one actually includes.
          </li>
          <li>
            Skip anyone who cannot name the platform. If a checkout page offers a PC copy, a mobile
            copy or "early access", it is not selling GTA 6 — see{" "}
            <Link href="/gta-6-scams-malware-download-safety" className="font-semibold text-brand-700 underline underline-offset-2">
              how these scams work
            </Link>
            .
          </li>
        </ol>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-ink-200 bg-ink-50 p-6">
            <h2 className="text-lg font-bold text-ink-950">Still deciding?</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              {siteConfig.statusHeadline} Prices are fixed at launch, so there is no advantage to
              buying from an unrecognised third party — only risk.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/gta-6-download" className="btn-secondary">
                Download status
              </Link>
              <Link href="/faq" className="btn-secondary">
                Read the FAQ
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-ink-200 p-6">
            <h2 className="text-lg font-bold text-ink-950">Related guides</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/gta-6-preorder-guide" className="font-semibold text-brand-700 hover:underline">
                  Pre-order guide: bonuses per storefront
                </Link>
              </li>
              <li>
                <Link href="/gta-6-release-date" className="font-semibold text-brand-700 hover:underline">
                  Release date and unlock times
                </Link>
              </li>
              <li>
                <Link href="/comparisons" className="font-semibold text-brand-700 hover:underline">
                  Comparisons silo
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
