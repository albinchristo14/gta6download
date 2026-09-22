import Link from "next/link";
import { siteConfig } from "@/site.config";
import { getPublishedPostBySlug } from "@/lib/posts";
import { pageMetadata, breadcrumbJsonLd, softwareAppJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section, UpdatedNote } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { EmailSignup } from "@/components/EmailSignup";

export const metadata = pageMetadata({
  title: "GTA 6 System Requirements — No PC Version Exists Yet, and What That Means",
  description:
    "Rockstar has published no GTA 6 system requirements because no PC version is announced. Confirmed console specs, GTA 5's real baseline, and clearly-labelled projections for a future PC release.",
  path: "/gta-6-system-requirements",
  keywords: ["gta 6 system requirements", "gta 6 pc requirements", "can i run gta 6"],
});

const crumb = [
  { name: "Home", href: "/" },
  { name: "System requirements", href: "/gta-6-system-requirements" },
];

const CONFIRMED = [
  { label: "Platforms", value: "PlayStation 5, Xbox Series X|S", verdict: "Confirmed" },
  { label: "Windows version", value: "Not announced — no date, no store page, no requirements", verdict: "None" },
  { label: "Official minimum spec", value: "Does not exist. Any table quoting one is inventing it.", verdict: "None" },
  { label: "Install size", value: "Not published for any platform", verdict: "Unknown" },
  { label: "Resolution / fps target", value: "Rockstar has committed to neither", verdict: "Unknown" },
];

const GTA5_BASELINE = [
  { part: "CPU (minimum)", gta5: "Intel Core 2 Quad Q6600 / AMD Phenom 9850", note: "AVX support is mandatory — the game will not launch without it." },
  { part: "CPU (recommended)", gta5: "Intel Core i5 3470 / AMD FX-8350", note: "Six modern cores is a comfortable baseline for a Rockstar port today." },
  { part: "RAM", gta5: "4 GB minimum · 8 GB recommended", note: "8 GB was the recommended figure in 2015; 16 GB is the ordinary assumption now." },
  { part: "GPU", gta5: "9800 GT 1 GB / HD 4870 1 GB minimum · GTX 660 2 GB / HD 7870 2 GB", note: "VRAM, not model name, is what fails first on open-world streaming." },
  { part: "Storage", gta5: "~110 GB at launch era", note: "GTA 6's figure is unpublished. Any number here is a guess." },
];

export default function SystemRequirementsPage() {
  const deepDive = getPublishedPostBySlug("gta-6-system-requirements-projected");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) }))),
          softwareAppJsonLd({
            name: "Grand Theft Auto VI",
            os: "PlayStation 5, Xbox Series X|S",
            category: "GameApplication",
          }),
        ]}
      />

      <PageHeader
        crumbs={crumb}
        eyebrow="Requirements status · no PC version announced"
        title="GTA 6 system requirements: there is nothing to publish yet"
        description="Rockstar has confirmed GTA 6 for PS5 and Xbox Series X|S on 19 November 2026 and has announced no PC version — which means no official Windows requirements exist. Here is the difference between what is known and what is guesswork."
      />

      <Section title="The status, field by field">
        <div className="overflow-hidden rounded-xl border border-ink-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-ink-100 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">What Rockstar has published</th>
                <th className="px-4 py-3 font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 bg-white">
              {CONFIRMED.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 font-semibold text-ink-950">{row.label}</td>
                  <td className="px-4 py-3 leading-6 text-ink-600">{row.value}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.verdict === "Confirmed"
                          ? "rounded-full bg-palm-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600"
                      }
                    >
                      {row.verdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <UpdatedNote className="mt-4" />
      </Section>

      <Section
        title="The only real data point: GTA 5's official requirements"
        description="Rockstar's last PC release is the best available signal about how it approaches Windows hardware — and about the failure modes that do not change between games."
      >
        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead className="bg-ink-100 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Part</th>
                <th className="px-4 py-3 font-semibold">GTA 5 (official, 2015)</th>
                <th className="px-4 py-3 font-semibold">Why it still matters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 bg-white">
              {GTA5_BASELINE.map((row) => (
                <tr key={row.part}>
                  <td className="px-4 py-3 font-semibold text-ink-950">{row.part}</td>
                  <td className="px-4 py-3 leading-6 text-ink-600">{row.gta5}</td>
                  <td className="px-4 py-3 leading-6 text-ink-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-600">
          The instruction-set line is the one that surprises people: GTA V needs a CPU implementing AVX
          and simply will not start without it, which is a hard incompatibility on pre-2011 processors
          rather than a performance problem. Expect a similar modern cut-off for any future Rockstar PC
          release, and read it as a launch blocker, not a settings tweak.
        </p>
      </Section>

      <Section
        title="Our projection, clearly labelled as a projection"
        description="Not a leak, not a Rockstar statement. This is reasoning from confirmed console hardware and the release timing a PC port would need."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { tier: "Minimum, plausibly", spec: "6-core CPU from 2018 onward · 16 GB RAM · 8 GB GPU around RTX 3060 / RX 6600 XT class · 100 GB+ of SSD", why: "A 2027–2028 port targets machines people already own, and the confirmed consoles are the floor it must run on." },
            { tier: "Comfortable 1440p", spec: "8-core CPU · 32 GB RAM · 12 GB GPU around RTX 4070 / RX 7800 XT class · NVMe SSD", why: "Open-world streaming is VRAM and SSD bound long before it is compute bound on this class of engine." },
          ].map((card) => (
            <div key={card.tier} className="card p-5">
              <h3 className="text-base font-bold text-ink-950">{card.tier}</h3>
              <p className="mt-2 font-mono text-sm leading-6 text-brand-800">{card.spec}</p>
              <p className="mt-3 text-sm leading-6 text-ink-600">{card.why}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-3xl rounded-lg border-l-4 border-sunset-500 bg-sunset-500/5 p-4 text-sm leading-6 text-ink-700">
          <strong className="font-semibold">If a site gives you a precise GTA 6 requirement table today,</strong>{" "}
          it is copying another site that invented it. There is no PC version to publish requirements for.
          The only honest answer is on this page, and we update it the day Rockstar says otherwise.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/tools/can-i-run-gta-6" className="btn-primary">
            Check your PC against these numbers
          </Link>
          <Link href="/tools/fps-estimator" className="btn-secondary">
            Estimate FPS by hardware tier
          </Link>
        </div>
      </Section>

      <Section title="Console owners: the requirement that does apply">
        <div className="max-w-3xl space-y-3 text-[1.0625rem] leading-7 text-ink-800">
          <p>
            For PS5 and Xbox Series X|S there is no hardware question to answer — you own the supported
            spec. The real requirement is <strong className="font-semibold text-ink-950">storage</strong> and{" "}
            <strong className="font-semibold text-ink-950">bandwidth</strong>: Rockstar has not published an
            install size, and {siteConfig.pcAnnounced ? "a PC version exists to compare against." : "there is no PC install size to cross-reference either."}
          </p>
          <p>
            Series S owners in particular should check free space on the 512 GB drive before the reported
            12 November pre-load: our{" "}
            <Link href="/news/gta-6-preload-and-install-guide" className="font-semibold text-brand-700 underline underline-offset-2">
              pre-load and install guide
            </Link>{" "}
            covers the console settings that make the difference.
          </p>
        </div>
      </Section>

      {deepDive && (
        <Section title="Read the long version" href="/requirements" hrefLabel="Requirements silo">
          <div className="grid gap-5 sm:grid-cols-2">
            <PostCard post={deepDive} />
          </div>
        </Section>
      )}

      <Section>
        <EmailSignup
          id="requirements-notify"
          title="Tell me when real requirements exist"
          description="We will email once — and only once — if Rockstar announces a PC version with an actual spec sheet. No newsletter in between."
          context="system-requirements"
        />
      </Section>
    </>
  );
}
