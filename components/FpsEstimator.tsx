"use client";

import { useState } from "react";
import {
  RESOLUTIONS,
  estimateFps,
  type CpuOption,
  type GpuOption,
  type Resolution,
} from "@/lib/fps";

function tierLabel(tier: GpuOption["tier"] | CpuOption["tier"]) {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function FpsEstimator({
  gpus,
  cpus,
}: {
  gpus: GpuOption[];
  cpus: CpuOption[];
}) {
  const [gpuSlug, setGpuSlug] = useState(gpus[Math.floor(gpus.length / 2)].slug);
  const [cpuSlug, setCpuSlug] = useState(cpus[Math.floor(cpus.length / 2)].slug);
  const [resolution, setResolution] = useState<Resolution>("1080p");

  const gpu = gpus.find((g) => g.slug === gpuSlug) ?? gpus[0];
  const cpu = cpus.find((c) => c.slug === cpuSlug) ?? cpus[0];
  const chosen = estimateFps({ gpuTier: gpu.tier, cpuTier: cpu.tier, resolution });
  const table = RESOLUTIONS.map((res) => ({
    res,
    fps: estimateFps({ gpuTier: gpu.tier, cpuTier: cpu.tier, resolution: res }).fps,
  }));

  return (
    <div className="card overflow-hidden">
      <div className="grid gap-4 border-b border-ink-200 bg-ink-50 p-5 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="font-semibold text-ink-700">Graphics card</span>
          <select
            value={gpuSlug}
            onChange={(e) => setGpuSlug(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-sm"
          >
            {gpus.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-ink-700">Processor</span>
          <select
            value={cpuSlug}
            onChange={(e) => setCpuSlug(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-sm"
          >
            {cpus.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="text-sm">
          <legend className="font-semibold text-ink-700">Resolution</legend>
          <div className="mt-1.5 flex gap-2">
            {RESOLUTIONS.map((res) => (
              <label
                key={res}
                className={`flex-1 cursor-pointer rounded-lg border px-2 py-2.5 text-center text-sm font-semibold ${
                  resolution === res
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-ink-300 bg-white text-ink-600 hover:border-brand-300"
                }`}
              >
                <input
                  type="radio"
                  name="resolution"
                  value={res}
                  checked={resolution === res}
                  onChange={() => setResolution(res)}
                  className="sr-only"
                />
                {res === "4k" ? "4K" : res}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
          Projected frame rate — not a benchmark
        </p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-ink-950">
          {chosen.fps}
          <span className="ml-1 text-lg font-semibold text-ink-500">FPS</span>
        </p>
        <p className="mt-1 text-sm text-ink-600">
          {gpu.name} · {cpu.name} · {resolution === "4k" ? "4K" : resolution} (
          {tierLabel(gpu.tier)} GPU, {tierLabel(cpu.tier)} CPU)
        </p>

        <table className="mt-5 w-full border-collapse text-sm">
          <caption className="mb-2 text-left text-xs text-ink-500">
            The same hardware at each resolution
          </caption>
          <thead>
            <tr>
              <th className="border-b-2 border-ink-300 px-3 py-2 text-left font-semibold">
                Resolution
              </th>
              <th className="border-b-2 border-ink-300 px-3 py-2 text-right font-semibold">
                Projected FPS
              </th>
            </tr>
          </thead>
          <tbody>
            {table.map((row) => (
              <tr key={row.res} className={row.res === resolution ? "bg-brand-50" : undefined}>
                <td className="border-b border-ink-200 px-3 py-2">{row.res === "4k" ? "4K" : row.res}</td>
                <td className="border-b border-ink-200 px-3 py-2 text-right font-semibold tabular-nums">
                  ~{row.fps}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-5 rounded-lg border border-sunset-500/30 bg-sunset-500/10 p-4 text-xs leading-5 text-ink-700">
          <strong className="font-semibold">Why this is a guess.</strong> {chosen.note}
        </p>
      </div>
    </div>
  );
}
