import { siteConfig } from "@/site.config";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section, Prose } from "@/components/Layout";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "Disclaimer — Unofficial Site, No Affiliation, No Warranty",
  description:
    "GTA6Download is not affiliated with Rockstar Games or Take-Two. Information is provided without warranty, affiliate links are disclosed, and we never host game files.",
  path: "/disclaimer",
});

const crumb = [
  { name: "Home", href: "/" },
  { name: "Disclaimer", href: "/disclaimer" },
];

export default function DisclaimerPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) })))} />
      <PageHeader
        crumbs={crumb}
        eyebrow={`Effective ${siteConfig.lastReviewed}`}
        title="Disclaimer"
        description="What this site is not, what it cannot be relied on for, and who owns the names on it."
      />

      <Section title="No affiliation">
        <Prose>
          <p>
            GTA6Download is an independent, fan-run information website. It is not affiliated with,
            authorised by, endorsed by or sponsored by Rockstar Games, Take-Two Interactive Software,
            Sony Interactive Entertainment, Microsoft, Valve, Epic Games or any other rights holder.
          </p>
          <p>
            “Grand Theft Auto”, “GTA”, “Grand Theft Auto VI”, “GTA VI”, Vice City, Rockstar Games and
            all related titles, artwork and characters are trademarks or copyrighted material of their
            respective owners and are used here only for identification and news reporting. We do not
            own them and we do not distribute them.
          </p>
        </Prose>
      </Section>

      <Section title="Information only, no warranty">
        <Prose>
          <p>
            Everything on this site is provided for general information, in good faith, and without
            warranty of any kind — express or implied — including accuracy, completeness, fitness for a
            purpose and availability. Release dates, prices, editions, platform support and storefront
            behaviour change without notice, and we update what we can when they do.
          </p>
          <p>Specifically, and because it is the most common way people are harmed here:</p>
          <ul>
            <li>
              We cannot make a copy of GTA 6 available. There is no download to give, and we will never
              host, link to, mirror or point you towards game files, APKs, cracks, keygens, cheats, mods
              or save editors.
            </li>
            <li>
              Anything labelled a projection, estimate or expectation on this site is exactly that:
              reasoned guesswork, clearly separated from confirmed facts, and not a specification.
            </li>
            <li>
              Hardware advice — including our{" "}
              <Link href="/tools/fps-estimator">FPS estimator</Link> and{" "}
              <Link href="/tools/can-i-run-gta-6">requirement checker</Link> — is derived from published
              console specifications and predecessor titles, not from GTA 6 benchmarks, which do not yet
              exist. Do not buy or upgrade hardware on our numbers alone.
            </li>
            <li>
              Third-party pages we link to are governed by their own terms. A link is not an endorsement,
              and we are not responsible for what a storefront, retailer or network does with your order
              or your data.
            </li>
          </ul>
          <p>
            To the fullest extent permitted by law, we exclude liability for loss arising from reliance
            on this website, including consequential and indirect loss. Nothing here limits liability that
            cannot lawfully be limited.
          </p>
        </Prose>
      </Section>

      <Section title="Affiliate and advertising disclosure">
        <Prose>
          <p>
            Outbound links to official storefronts on this site may be affiliate or referral links, and
            the site may display paid advertising. We may earn a commission when you buy through those
            links, at no additional cost to you. Affiliate and sponsored links carry{" "}
            <code>rel="sponsored nofollow"</code> so search engines do not treat them as endorsements.
          </p>
          <p>
            Compensation never determines what we say about availability. We would rather lose the
            conversion than publish a download claim we cannot support — which is the entire editorial
            reason this site tells you the game is not out.
          </p>
          <AffiliateDisclosure />
        </Prose>
      </Section>

      <Section title="News, commentary and fair use">
        <Prose>
          <p>
            Articles here are news reporting and commentary. Where we describe a claim made by another
            publisher, we link to it and attribute it, and we distinguish between what Rockstar has
            stated directly and what has been reported by third parties. If you believe a page
            misattributes or misrepresents something you own or published, see{" "}
            <Link href="/contact">the contact page</Link> and we will correct or remove it.
          </p>
        </Prose>
      </Section>
    </>
  );
}
