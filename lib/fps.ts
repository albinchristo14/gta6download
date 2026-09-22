export type GpuTier = "entry" | "mainstream" | "high" | "ultra";
export type CpuTier = "low" | "mid" | "high";
export type Resolution = "1080p" | "1440p" | "4k";

export interface HardwareInput {
  gpuTier: GpuTier;
  cpuTier: CpuTier;
  resolution: Resolution;
  /** Optional, and only ever used to name a gap — the projections below ignore them. */
  ramGb?: number;
  freeSpaceGb?: number;
}

/**
 * There is no GTA 6 PC build, no official spec list and no benchmark, so nothing here is
 * a measurement. The numbers are relative multipliers anchored to the announced console
 * hardware and to what games of this scale have needed on PC. Every consumer of this
 * module has to label the output as a projection — `PROJECTION_NOTE` exists so that is
 * one string rather than a dozen.
 */
export const PROJECTION_NOTE =
  "This is an estimate, not a benchmark. GTA 6 has no announced PC version, no published system requirements and no measured frame rates, so this figure is extrapolated from the PS5/Xbox Series hardware the game was built for and from comparable open-world PC releases.";

/** Frames per second at the settings a mid-tier build would realistically use. */
const GPU_BASE: Record<GpuTier, number> = {
  entry: 34,
  mainstream: 58,
  high: 88,
  ultra: 118,
};

const CPU_MULT: Record<CpuTier, number> = {
  low: 0.72,
  mid: 0.94,
  high: 1.08,
};

const RESOLUTION_MULT: Record<Resolution, number> = {
  "1080p": 1,
  "1440p": 0.68,
  "4k": 0.42,
};

/** The line we treat as "playable" for an open-world action game. Ours, not Rockstar's. */
export const PLAYABLE_FLOOR = 30;

/** RAM and free space we would want before trusting a machine to hold a game this size. */
export const PROJECTED_PC_BASELINE = {
  ramGb: 16,
  freeSpaceGb: 150,
} as const;

const RES_LABEL: Record<Resolution, string> = {
  "1080p": "1080p",
  "1440p": "1440p",
  "4k": "4K",
};

/** The picker lists real hardware models and maps each to the tier the maths runs on. */
export interface GpuOption {
  slug: string;
  name: string;
  tier: GpuTier;
}

export interface CpuOption {
  slug: string;
  name: string;
  tier: CpuTier;
}

export const RESOLUTIONS: Resolution[] = ["1080p", "1440p", "4k"];

export function estimateFps(input: HardwareInput): { fps: number; note: string } {
  const raw =
    GPU_BASE[input.gpuTier] * CPU_MULT[input.cpuTier] * RESOLUTION_MULT[input.resolution];
  // A weak CPU caps the frame rate regardless of how fast the GPU is.
  const cpuCeiling = input.cpuTier === "low" ? 48 : input.cpuTier === "mid" ? 95 : Infinity;
  return { fps: Math.round(Math.min(raw, cpuCeiling)), note: PROJECTION_NOTE };
}

export interface Verdict {
  passes: boolean;
  fps: number;
  reason: string;
  gaps: string[];
}

export function meetsMinimum(input: HardwareInput): Verdict {
  const { fps } = estimateFps(input);
  const gaps: string[] = [];

  if (input.ramGb !== undefined && input.ramGb < PROJECTED_PC_BASELINE.ramGb) {
    gaps.push(
      `${input.ramGb} GB of RAM is under the ${PROJECTED_PC_BASELINE.ramGb} GB we would want for a game of this scale`,
    );
  }
  if (
    input.freeSpaceGb !== undefined &&
    input.freeSpaceGb < PROJECTED_PC_BASELINE.freeSpaceGb
  ) {
    gaps.push(
      `${input.freeSpaceGb} GB free is under the ${PROJECTED_PC_BASELINE.freeSpaceGb} GB buffer we recommend until a real file size is published`,
    );
  }

  const at = RES_LABEL[input.resolution];
  const reason = gaps.length
    ? `Projected ~${fps} FPS at ${at}, but: ${gaps.join("; ")}.`
    : `Projected ~${fps} FPS at ${at} — ${fps >= PLAYABLE_FLOOR ? "above" : "below"} the ${PLAYABLE_FLOOR} FPS line we treat as playable.`;

  return { passes: fps >= PLAYABLE_FLOOR && gaps.length === 0, fps, reason, gaps };
}

export function verdictNote(input: HardwareInput): string {
  const { passes } = meetsMinimum(input);
  const lead = passes
    ? "Hardware like this is the kind of machine a future PC build would likely target."
    : "Hardware like this sits below the level a future PC build would likely target.";
  return `${lead} There is no announced PC version of GTA 6 to run today, so this describes a product that does not exist. ${PROJECTION_NOTE}`;
}
