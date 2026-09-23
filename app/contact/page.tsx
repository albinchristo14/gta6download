import { siteConfig } from "@/site.config";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section, Prose } from "@/components/Layout";
import { EmailSignup } from "@/components/EmailSignup";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "Contact GTA6Download — Corrections, Press and Removals",
  description:
    "Report a factual error, request the source behind a claim, or contact the editorial team behind GTA6Download.",
  path: "/contact",
});

const crumb = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "/contact" },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) })))} />
      <PageHeader
        crumbs={crumb}
        eyebrow="Contact"
        title="Talk to the people who edit this site"
        description="Corrections, sourcing questions and removal requests are read by a human. The fastest correction is a link to the claim plus the source that contradicts it."
      />

      <Section title="Email">
        <Prose>
          <p>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="font-semibold text-brand-700 underline underline-offset-2"
            >
              hello@gta6download.store
            </a>
          </p>
          <p>
            We aim to reply within five working days. Legal and trademark requests are handled
            directly through the address above and take priority over general mail.
          </p>
        </Prose>
      </Section>

      <Section title="What to send, depending on why you are writing">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "A correction",
              body: "The page URL, the sentence that is wrong, and the primary source that contradicts it. We fix the live page and date the correction on the article.",
            },
            {
              title: "A missing source",
              body: "If we asserted something without a link, say which claim. Every factual statement here should trace to Rockstar, a platform holder, a filing, or a named outlet.",
            },
            {
              title: "A removal or privacy request",
              body: "Tell us what to remove and why. Requests about personal data are actioned before the next deploy, not the next review cycle.",
            },
          ].map((card) => (
            <div key={card.title} className="card p-5">
              <h2 className="text-base font-bold text-ink-950">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-600">{card.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Before you write">
        <Prose>
          <ul>
            <li>
              <strong>We cannot give you the game.</strong> No copy exists to distribute — see the{" "}
              <Link href="/gta-6-download">download status</Link>. We do not host, link to or mirror
              files of any kind.
            </li>
            <li>
              <strong>Support requests belong with the seller.</strong> A pre-order that has not
              appeared in your library is a PlayStation, Xbox or retailer account issue. Our{" "}
              <Link href="/news/gta-6-download-and-install-errors">error guide</Link> lists the checks that
              actually resolve it.
            </li>
            <li>
              <strong>We do not accept paid placements.</strong> No sponsored reviews, no ranking
              payments, no removal fees.
            </li>
          </ul>
        </Prose>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <EmailSignup
            id="contact-notify"
            title="Rather just get the updates?"
            description="Subscribe for the two emails that matter: when a real download exists, and if a PC version is ever announced."
            context="contact"
          />
        </div>
      </Section>
    </>
  );
}
