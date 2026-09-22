"use client";

import { useState } from "react";
import {
  PROJECTED_PC_BASELINE,
  meetsMinimum,
  verdictNote,
  type CpuOption,
  type GpuOption,
} from "@/lib/fps";

const RAM_OPTIONS = [8, 16, 24, 32, 64];
const SPACE_OPTIONS = [120, 250, 500, 1000, 2000];

export function RequirementChecker({
  gpus,
  cpus,
}: {
  gpus: GpuOption[];
  cpus: CpuOption[];
}) {
  const [gpuSlug, setGpuSlug] = useState(gpus[Math.floor(gpus.length / 2)].slug);
  const [cpuSlug, setCpuSlug] = useState(cpus[Math.floor(cpus.length / 2)].slug);
  const [ramGb, setRamGb] = useState<number>(PROJECTED_PC_BASELINE.ramGb);
  const [freeSpaceGb, setFreeSpaceGb] = useState(500);
  const [checked, setChecked] = useState(false);

  const gpu = gpus.find((g) => g.slug === gpuSlug) ?? gpus[0];
  const cpu = cpus.find((c) => c.slug === cpuSlug) ?? cpus[0];
  const input = { gpuTier: gpu.tier, cpuTier: cpu.tier, resolution: "1080p" as const, ramGb, freeSpaceGb };
  const verdict = meetsMinimum(input);

  return (
    <div className="card overflow-hidden">
      <div className="grid gap-4 border-b border-ink-200 bg-ink-50 p-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-ink-700">Graphics card</span>
          <select
            value={gpuSlug}
            onChange={(e) => {
              setGpuSlug(e.target.value);
              setChecked(false);
            }}
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
            onChange={(e) => {
              setCpuSlug(e.target.value);
              setChecked(false);
            }}
            className="mt-1.5 block w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-sm"
          >
            {cpus.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-ink-700">System memory</span>
          <select
            value={ramGb}
            onChange={(e) => {
              setRamGb(Number(e.target.value));
              setChecked(false);
            }}
            className="mt-1.5 block w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-sm"
          >
            {RAM_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} GB
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-ink-700">Free space on the drive</span>
          <select
            value={freeSpaceGb}
            onChange={(e) => {
              setFreeSpaceGb(Number(e.target.value));
              setChecked(false);
            }}
            className="mt-1.5 block w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-sm"
          >
            {SPACE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n.toLocaleString("en-GB")} GB free
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="p-5">
        {!checked ? (
          <>
            <p className="text-sm leading-6 text-ink-600">
              Pick your parts, then check. There is no official GTA 6 PC spec list to compare
              against — the thresholds used here are ours, and the result is a projection.
            </p>
            <button type="button" onClick={() => setChecked(true)} className="btn-primary mt-4">
              Check this PC
            </button>
          </>
        ) : (
          <div
            role="status"
            className={`rounded-lg border p-5 ${
              verdict.passes
                ? "border-palm-500/40 bg-palm-500/5"
                : "border-sunset-500/40 bg-sunset-500/5"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Projected result — not an official requirement
            </p>
            <h2 className="mt-1.5 text-xl font-bold text-ink-950">
              {verdict.passes
                ? "Close enough that a future PC build would probably run on this"
                : "This machine is under where we would expect a PC build to land"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-700">{verdict.reason}</p>

            {verdict.gaps.length > 0 && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-700">
                {verdict.gaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            )}

            <p className="mt-4 text-xs leading-5 text-ink-500">{verdictNote(input)}</p>
            <button type="button" onClick={() => setChecked(false)} className="btn-secondary mt-4">
              Change hardware
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
