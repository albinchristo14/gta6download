import { siteConfig } from "@/site.config";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section, Prose } from "@/components/Layout";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "About GTA6Download — Who We Are and How We Source",
  description:
    "GTA6Download is an independent, non-affiliated information site about GTA 6 availability. Our sourcing rules, correction policy and disclosure of how the site earns money.",
  path: "/about",
});

const crumb = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) })))} />
      <PageHeader
        crumbs={crumb}
        eyebrow="About this site"
        title="An independent GTA 6 information site that will not pretend a download exists"
        description={`Last reviewed ${siteConfig.lastReviewed}. We are not Rockstar Games, not Take-Two Interactive, and not authorised by either.`}
      />

      <Section title="What this site is for">
        <Prose>
          <p>
            Almost everyone who searches for “GTA 6 download” wants one thing: the game. For most of
            2026 the honest answer is that it does not exist yet, and the search results are full of
            pages that will not say that. This site exists to give the accurate answer, to keep it
            current, and to send people to the only places that can legitimately sell the game.
          </p>
          <p>We concentrate on three jobs:</p>
          <ul>
            <li>
              <strong>Availability.</strong> The <Link href="/gta-6-download">download status hub</Link>{" "}
              and the countdown reflect what Rockstar has confirmed today, not what forums assumed.
            </li>
            <li>
              <strong>Safety.</strong> We explain what fake “GTA 6 download” files actually are and how
              to recover, rather than monetising the click.
            </li>
            <li>
              <strong>Evidence.</strong> Requirements, editions and dates are separated into what is
              confirmed and what is projection — and the projection is labelled.
            </li>
          </ul>
        </Prose>
      </Section>

      <Section title="How an article gets published">
        <Prose>
          <ol>
            <li>
              A topic or a news item enters the pipeline. We work from a primary source: Rockstar’s own
              store pages and Newswire posts, platform holders’ storefronts, or a company filing.
            </li>
            <li>
              AI tools assist with drafting and with monitoring feeds. They do not decide what goes
              live: a person reads every piece, checks the claims against the cited sources, and
              commits it by hand. Nothing publishes automatically.
            </li>
            <li>
              Every published article lists its sources with links. If a claim rests on reporting
              rather than a Rockstar statement, the copy says so.
            </li>
            <li>
              Pages are re-reviewed when the facts change. Time-sensitive pages carry a
              “last checked” date so you can judge how current they are.
            </li>
          </ol>
          <h2>Corrections</h2>
          <p>
            We are wrong occasionally, like any site covering a moving story. Corrections are made to
            the live page, and a dated correction goes on the article itself when the error was
            material. Report one through{" "}
            <Link href="/contact">the contact page</Link> with a link to the claim and the source that
            contradicts it — that is all we need to act.
          </p>
          <h2>What we will not do</h2>
          <ul>
            <li>Host, link to or mirror game files, APKs, cracks, cheats, mods or save editors.</li>
            <li>Publish a page implying a download exists where none does, however well it would rank.</li>
            <li>Accept payment for a review, a ranking, or removal of a correction.</li>
            <li>Add a programmatic page that has nothing specific to say about its topic.</li>
          </ul>
        </Prose>
      </Section>

      <Section title="How this site earns money">
        <Prose>
          <p>
            Two ways, both disclosed where they appear. Outbound links to official storefronts are
            affiliate links, and display advertising may run on article pages. Neither affects the
            availability answers: an honest “you cannot download this yet” is worse for conversions
            than a fake promise, and we publish it anyway because that is the point of the site.
          </p>
          <AffiliateDisclosure />
        </Prose>
      </Section>

      <Section title="Names, trademarks and ownership">
        <Prose>
          <p>
            Grand Theft Auto, GTA, GTA VI and their logos are trademarks of Take-Two Interactive and
            Rockstar Games. This site is a fan-run information resource; it is not affiliated with,
            endorsed by or sponsored by them, and it does not distribute their software. All
            screenshots, names and references belong to their respective owners. See the{" "}
            <Link href="/disclaimer">disclaimer</Link> for the full terms and the{" "}
            <Link href="/privacy">privacy policy</Link> for what we collect.
          </p>
        </Prose>
      </Section>
    </>
  );
}
