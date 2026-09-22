import Link from "next/link";
import { FpsEstimator } from "@/components/FpsEstimator";
import { Section } from "@/components/Layout";
import { JsonLd } from "@/components/JsonLd";
import { hardwareCatalog } from "@/lib/pseo";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { PROJECTION_NOTE } from "@/lib/fps";
import type { CpuTier, GpuTier } from "@/lib/fps";
import { siteConfig } from "@/site.config";

export const metadata = pageMetadata({
  title: "GTA 6 FPS Estimator — Projected Frame Rate for Your GPU and CPU",
  description:
    "Pick a graphics card and processor to see a projected GTA 6 frame rate at 1080p, 1440p and 4K. Clearly labelled as an estimate: there is no PC version and no benchmark to measure against.",
  path: "/tools/fps-estimator",
  keywords: ["gta 6 fps estimator", "gta 6 projected fps", "gta 6 pc performance"],
});

export default function FpsEstimatorPage() {
  const { gpus, cpus } = hardwareCatalog();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: "Tools", url: absoluteUrl("/tools/fps-estimator") },
        ])}
      />

      <div className="hero-gradient border-b border-ink-800 text-white">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow text-brand-300">Tool</p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            GTA 6 FPS estimator
          </h1>
          <p className="mt-4 max-w-3xl text-balance leading-7 text-ink-200 sm:text-lg">
            Choose your graphics card and processor to see a <em>projected</em> frame rate. This is
            not a benchmark, because there is nothing to benchmark: GTA 6 has no announced PC version
            and Rockstar has published no performance targets.
          </p>
          <p className="mt-5 inline-flex rounded-full border border-sunset-500/40 bg-sunset-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sunset-400">
            Estimates only · no official PC data exists
          </p>
        </div>
      </div>

      <Section
        title="Project your frame rate"
        description={`${gpus.length} graphics cards and ${cpus.length} processors in the table below.`}
      >
        <div className="max-w-3xl">
          <FpsEstimator
            gpus={gpus.map((g) => ({ ...g, tier: g.tier as GpuTier }))}
            cpus={cpus.map((c) => ({ ...c, tier: c.tier as CpuTier }))}
          />
        </div>
      </Section>

      <Section title="How the number is produced" description="So you can judge it rather than trust it.">
        <div className="grid max-w-4xl gap-5 sm:grid-cols-2">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-ink-950">The anchor</h3>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              GTA 6 is built for PS5 and Xbox Series X|S — hardware equivalent to roughly a{" "}
              <strong className="text-ink-900">mainstream PC GPU</strong> at 30-60 FPS. That is the
              only real constraint the projection starts from, and it is why our baseline mainstream
              card lands near 60 FPS at 1080p.
            </p>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-ink-950">The scaling</h3>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              GPUs and CPUs are bucketed into performance tiers from published relative
              performance, and resolution multipliers come from how open-world PC ports typically
              scale. A weak CPU caps the result regardless of the graphics card — that ceiling is in
              the model deliberately.
            </p>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-ink-950">What it cannot tell you</h3>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              Whether the game will run well on PC at all. Port quality, upscaler support, engine
              settings and 1% lows dominate a result like this, and none of that is knowable before
              a PC version exists.
            </p>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-ink-950">What we update instead</h3>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              The{" "}
              <Link
                href="/gta-6-system-requirements"
                className="font-semibold text-brand-700 underline"
              >
                system requirements page
              </Link>{" "}
              tracks what Rockstar has actually confirmed, and says plainly where nothing has been
              confirmed.{" "}
              <Link
                href="/tools/can-i-run-gta-6"
                className="font-semibold text-brand-700 underline"
              >
                Can I run GTA 6?
              </Link>{" "}
              adds RAM and storage to the same model.
            </p>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-5 text-ink-500">{PROJECTION_NOTE}</p>
      </Section>

      <Section
        title="Where the game is actually available"
        description={`${siteConfig.statusHeadline}`}
      >
        <div className="flex max-w-3xl flex-wrap gap-3">
          <Link href="/gta-6-download" className="btn-primary">
            Download status
          </Link>
          <Link href="/gta-6-download-ps5" className="btn-secondary">
            PS5
          </Link>
          <Link href="/gta-6-download-xbox" className="btn-secondary">
            Xbox Series X|S
          </Link>
          <Link href="/gta-6-download-pc" className="btn-secondary">
            PC status
          </Link>
        </div>
      </Section>
    </>
  );
}
