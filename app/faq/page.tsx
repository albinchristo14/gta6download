import Link from "next/link";
import { faqItems } from "@/lib/faq";
import { pageMetadata, breadcrumbJsonLd, faqJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section } from "@/components/Layout";
import { EmailSignup } from "@/components/EmailSignup";

export const metadata = pageMetadata({
  title: "GTA 6 FAQ — Download, Release Date, PC, Price and Scams, Answered",
  description:
    "Straight answers on GTA 6: can you download it yet, when it releases, whether there is a PC version, what it costs, and how to avoid the scams around it.",
  path: "/faq",
  keywords: ["gta 6 faq", "is gta 6 out", "can i download gta 6", "is gta 6 free", "is gta 6 on pc"],
});

const crumb = [
  { name: "Home", href: "/" },
  { name: "FAQ", href: "/faq" },
];

const GROUPS = [
  { title: "Availability", match: /out yet|download gta 6|free|play gta 6 early/i },
  { title: "Platforms & PC", match: /pc|steam|mobile|android|ios|xbox game pass/i },
  { title: "Dates & money", match: /release date|cost|pre-order|delay/i },
  { title: "Technical", match: /requirement|mods|offline|dangerous/i },
];

export default function FaqPage() {
  const grouped = GROUPS.map((group) => ({
    title: group.title,
    items: faqItems.filter((f) => group.match.test(f.question)),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) }))),
          faqJsonLd(faqItems),
        ]}
      />

      <PageHeader
        crumbs={crumb}
        eyebrow={`${faqItems.length} questions · checked against Rockstar's own announcements`}
        title="GTA 6 FAQ"
        description="The questions this site gets asked most, answered in the space of a featured snippet — with the evidence kept separate from the speculation."
      />

      {grouped.map((group) => (
        <Section key={group.title} title={group.title}>
          <dl className="max-w-3xl divide-y divide-ink-200 border-t border-ink-200">
            {group.items.map((item) => (
              <div key={item.question} id={item.question.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-24 py-5">
                <dt className="text-base font-semibold text-ink-950">{item.question}</dt>
                <dd className="mt-2 text-[0.9375rem] leading-7 text-ink-600">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ))}

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { href: "/gta-6-download", label: "Download status hub", blurb: "Live availability, countdown and official pre-order links." },
            { href: "/gta-6-system-requirements", label: "System requirements", blurb: "What is official, what is projection, and why the two get confused." },
            { href: "/news/gta-6-download-scams-and-malware-safety", label: "Scam safety guide", blurb: "What fake download files actually do, and how to recover." },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="card p-5 hover:border-brand-400">
              <h2 className="text-sm font-bold text-ink-950">{card.label}</h2>
              <p className="mt-1.5 text-sm leading-6 text-ink-600">{card.blurb}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <EmailSignup
            id="faq-notify"
            title="Something not answered here?"
            description="Ask us via the contact page and we will add it with a source. Or leave an email and we will tell you when the answers on this page change."
            context="faq"
          />
        </div>
      </Section>
    </>
  );
}
