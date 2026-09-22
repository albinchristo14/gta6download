import Link from "next/link";
import { RequirementChecker } from "@/components/RequirementChecker";
import { Section } from "@/components/Layout";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/AdSlot";
import { hardwareCatalog } from "@/lib/pseo";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { PROJECTED_PC_BASELINE, PROJECTION_NOTE } from "@/lib/fps";
import type { CpuTier, GpuTier } from "@/lib/fps";
import { siteConfig } from "@/site.config";

export const metadata = pageMetadata({
  title: "Can I Run GTA 6? Honest Check Against Projected PC Specs",
  description:
    "Check a PC against projected GTA 6 requirements. There is no announced PC version and no official spec list, so the tool says which numbers are ours and which are Rockstar's.",
  path: "/tools/can-i-run-gta-6",
  keywords: ["can i run gta 6", "gta 6 pc requirements", "gta 6 system requirements checker"],
});

export default function CanIRunPage() {
  const { gpus, cpus } = hardwareCatalog();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: "Can I run GTA 6?", url: absoluteUrl("/tools/can-i-run-gta-6") },
        ])}
      />

      <div className="hero-gradient border-b border-ink-800 text-white">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow text-brand-300">Tool</p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Can I run GTA 6?
          </h1>
          <p className="mt-4 max-w-3xl text-balance leading-7 text-ink-200 sm:text-lg">
            The short answer for every PC in the world today is no — GTA 6 releases on{" "}
            {siteConfig.confirmedPlatforms.join(" and ")}, and Rockstar has announced no PC version
            at all. This tool answers the next question: if a PC build ever arrives, would this
            machine be ready?
          </p>
          <p className="mt-5 inline-flex rounded-full border border-sunset-500/40 bg-sunset-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sunset-400">
            Projected thresholds · not official requirements
          </p>
        </div>
      </div>

      <Section title="Check your machine">
        <div className="max-w-3xl">
          <RequirementChecker
            gpus={gpus.map((g) => ({ ...g, tier: g.tier as GpuTier }))}
            cpus={cpus.map((c) => ({ ...c, tier: c.tier as CpuTier }))}
          />
        </div>
      </Section>

      <Section
        title="Which numbers are Rockstar's and which are ours"
        description="The distinction is the whole point of the tool."
      >
        <div className="max-w-3xl overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b-2 border-ink-300 px-3 py-2 text-left font-semibold">
                  Item
                </th>
                <th className="border-b-2 border-ink-300 px-3 py-2 text-left font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  item: "PC system requirements",
                  status: "None published. Any site showing a GTA 6 requirements table is guessing.",
                },
                {
                  item: "Announced PC platforms",
                  status: "Zero. Confirmed platforms are PS5 and Xbox Series X|S only.",
                },
                {
                  item: "Release date",
                  status: "19 November 2026 — confirmed by Rockstar.",
                },
                {
                  item: `RAM threshold (${PROJECTED_PC_BASELINE.ramGb} GB)`,
                  status: "Ours, inferred from current open-world PC releases. Not a Rockstar figure.",
                },
                {
                  item: `Storage buffer (${PROJECTED_PC_BASELINE.freeSpaceGb} GB)`,
                  status: "Ours. No file size has been announced for any platform.",
                },
                {
                  item: "Frame rate projections",
                  status: "Modelled from console-equivalent hardware. No benchmark exists.",
                },
              ].map((row) => (
                <tr key={row.item}>
                  <td className="border-b border-ink-200 px-3 py-2 font-medium text-ink-900">
                    {row.item}
                  </td>
                  <td className="border-b border-ink-200 px-3 py-2 text-ink-600">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdSlot id="checker-mid" />
        <p className="mt-6 max-w-3xl text-xs leading-5 text-ink-500">{PROJECTION_NOTE}</p>
      </Section>

      <Section
        title="If you want to play it in 2026"
        description="A PC cannot, today. A console can be prepared for."
      >
        <div className="flex max-w-3xl flex-wrap gap-3">
          <Link href="/gta-6-download" className="btn-primary">
            Download status
          </Link>
          <Link href="/where-to-buy" className="btn-secondary">
            Where to buy
          </Link>
          <Link href="/gta-6-system-requirements" className="btn-secondary">
            Requirements, honestly
          </Link>
          <Link href="/gta-6-download-pc" className="btn-secondary">
            Why there is no PC version
          </Link>
        </div>
      </Section>
    </>
  );
}
