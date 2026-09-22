import { siteConfig } from "@/site.config";
import { getPublishedPostBySlug } from "@/lib/posts";
import { faqItems } from "@/lib/faq";
import { pageMetadata, breadcrumbJsonLd, howToJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section, UpdatedNote } from "@/components/Layout";
import { Countdown } from "@/components/Countdown";
import { EmailSignup } from "@/components/EmailSignup";
import { PostCard } from "@/components/PostCard";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "GTA 6 Release Date — 19 November 2026, Times and Delay History",
  description:
    "GTA 6 releases 19 November 2026 on PS5 and Xbox Series X|S at 5pm PT on 18 November. Live countdown, unlock times by region, and the two delays that moved it from 2025.",
  path: "/gta-6-release-date",
  keywords: ["gta 6 release date", "when does gta 6 come out", "gta 6 date"],
});

const crumb = [
  { name: "Home", href: "/" },
  { name: "Release date", href: "/gta-6-release-date" },
];

const TIMELINE = [
  { date: "Feb 2022", event: "Take-Two formally announces Grand Theft Auto VI in development.", tone: "info" },
  { date: "May 2023", event: "RDR2 publisher earnings guidance points GTA 6 at fiscal 2025.", tone: "info" },
  { date: "Dec 2023", event: "First trailer confirms Leonida and Vice City, returning after thirteen years.", tone: "info" },
  { date: "May 2025", event: "Rockstar delays from 2025 to 26 May 2026 — the first move.", tone: "warn" },
  { date: "Nov 2025", event: "Second delay, to 19 November 2026. Rockstar cites the time needed to finish at this scale.", tone: "warn" },
  { date: "25 Jun 2026", event: "Pre-orders open: $79.99 Standard and $99.99 Ultimate on PS5 and Xbox Series X|S.", tone: "ok" },
  { date: "12 Nov 2026", event: "Pre-load reported to begin for pre-orders — the download can finish before unlock.", tone: "ok" },
  { date: "19 Nov 2026", event: "Release. Unlocks 5pm PT on 18 Nov, which is midnight 19 Nov in the UK.", tone: "ok" },
];

const PREP_STEPS = [
  { name: "Pre-order on the right account", text: "Buy on the PSN or Microsoft account you actually play on. Licences bind to the account, not the console, and region-mismatched codes often will not redeem." },
  { name: "Clear storage before 12 November", text: "Rockstar has not published an install size, so assume it is large. Delete games you have finished and check free space on the internal drive, not an external one." },
  { name: "Enable background downloads", text: "PS5 needs Rest Mode with 'Stay Connected to the Internet'; Xbox needs Sleep mode plus 'Keep my games up to date'. This is the setting that decides whether the pre-load actually runs." },
  { name: "Redeem any physical code early", text: "Boxed editions contain a download code and no disc. Redeeming it starts the pre-load; leaving it sealed until launch day means downloading from zero when the queue is longest." },
  { name: "Plan for a day-one patch", text: "A release that has slipped twice usually still ships an update on day one. Budget time for it after unlock rather than assuming the pre-loaded file is complete." },
];

export default function ReleaseDatePage() {
  const article = getPublishedPostBySlug("gta-6-release-date-november-19-2026");
  const releaseFaqs = faqItems.filter((f) => /release|delay|out yet|early|pc\b/i.test(f.question));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) }))),
          howToJsonLd("How to be ready the moment GTA 6 unlocks", PREP_STEPS),
        ]}
      />

      <PageHeader
        crumbs={crumb}
        eyebrow="Confirmed by Rockstar"
        title="GTA 6 releases 19 November 2026"
        description="PlayStation 5 and Xbox Series X|S. Digital unlock at 5pm PT on 18 November — midnight in the UK. No PC version has been announced, so there is no PC release date to wait for."
      >
        <Countdown target={siteConfig.releaseDate} onRelease="GTA 6 is out — pre-load and downloads are live" />
      </PageHeader>

      <Section title="How this date was reached">
        <p className="max-w-3xl text-[1.0625rem] leading-7 text-ink-800">
          The date has moved twice, which is worth knowing before you plan anything around it. Rockstar
          has not published a third change, and its pattern is that a date moves before it is missed.
        </p>
        <ol className="mt-6 max-w-3xl space-y-0">
          {TIMELINE.map((item) => (
            <li key={item.date} className="flex gap-4 border-l-2 border-ink-200 pb-6 pl-5 last:pb-0">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">{item.date}</p>
                <p className="mt-1 text-sm leading-6 text-ink-800">{item.event}</p>
              </div>
            </li>
          ))}
        </ol>
        <UpdatedNote />
      </Section>

      <Section
        title="What happens when, on release week"
        description="Times below follow the reported pre-load date and Rockstar's standard 5pm PT unlock. Confirm on your own store page — regional rollout is not always simultaneous."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { when: "Now", what: "Pre-orders open", detail: "$79.99 Standard, $99.99 Ultimate, PS5 and Xbox Series X|S only. Nothing is downloadable." },
            { when: "12 Nov", what: "Pre-load begins", detail: "The download runs in the background on a console configured for it, so the install finishes before unlock." },
            { when: "18 Nov, 5pm PT", what: "Play unlock", detail: "Midnight in the UK. Expect a day-one patch on top of the pre-loaded files." },
          ].map((card) => (
            <div key={card.when} className="card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{card.when}</p>
              <h3 className="mt-1.5 text-base font-bold text-ink-950">{card.what}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-600">{card.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Getting ready, in order">
        <ol className="max-w-3xl list-decimal space-y-4 pl-5">
          {PREP_STEPS.map((step) => (
            <li key={step.name}>
              <p className="font-semibold text-ink-950">{step.name}</p>
              <p className="mt-1 text-sm leading-6 text-ink-600">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-ink-600">
          Full walkthrough, including the console settings that decide whether a pre-load runs:{" "}
          <Link href="/news/gta-6-preload-and-install-guide" className="font-semibold text-brand-700 underline underline-offset-2">
            GTA 6 pre-load and install guide
          </Link>
          .
        </p>
      </Section>

      <Section>
        <EmailSignup
          id="release-notify"
          title="Pinged the day it launches"
          description="One email at pre-load and one at release. We also alert subscribers if Rockstar ever confirms a PC date, which is the answer most people on this page are actually waiting for."
          context="release-date"
        />
      </Section>

      {releaseFaqs.length > 0 && (
        <Section title="Release date questions">
          <dl className="max-w-3xl divide-y divide-ink-200 border-t border-ink-200">
            {releaseFaqs.map((item) => (
              <div key={item.question} className="py-5">
                <dt className="text-base font-semibold text-ink-950">{item.question}</dt>
                <dd className="mt-1.5 text-sm leading-7 text-ink-600">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {article && (
        <Section title="The full story" href="/news" hrefLabel="All news">
          <div className="grid gap-5 sm:grid-cols-2">
            <PostCard post={article} />
          </div>
        </Section>
      )}
    </>
  );
}
