import { describe, it, expect } from "vitest";
import {
  estimateFps,
  meetsMinimum,
  verdictNote,
  PROJECTION_NOTE,
  PLAYABLE_FLOOR,
  type HardwareInput,
} from "./fps";

const base: HardwareInput = { gpuTier: "mainstream", cpuTier: "mid", resolution: "1080p" };

describe("estimateFps", () => {
  it("higher tiers and lower resolutions yield more fps", () => {
    const low = estimateFps({ gpuTier: "entry", cpuTier: "low", resolution: "4k" });
    const high = estimateFps({ gpuTier: "ultra", cpuTier: "high", resolution: "1080p" });
    expect(high.fps).toBeGreaterThan(low.fps);
    expect(low.fps).toBeGreaterThan(0);
  });

  it("always returns a projection note", () => {
    expect(estimateFps(base).note.toLowerCase()).toContain("estimate");
    expect(estimateFps(base).note).toBe(PROJECTION_NOTE);
  });

  it("never states an official spec exists", () => {
    expect(PROJECTION_NOTE.toLowerCase()).toContain("no published system requirements");
  });

  it("caps frame rate at the CPU rather than pretending the GPU decides", () => {
    const weakCpu = estimateFps({ gpuTier: "ultra", cpuTier: "low", resolution: "1080p" });
    const strongCpu = estimateFps({ gpuTier: "ultra", cpuTier: "high", resolution: "1080p" });
    expect(weakCpu.fps).toBeLessThan(strongCpu.fps);
  });
});

describe("meetsMinimum", () => {
  it("entry hardware at 4k fails", () => {
    expect(meetsMinimum({ gpuTier: "entry", cpuTier: "low", resolution: "4k" }).passes).toBe(
      false,
    );
  });

  it("mainstream hardware at 1080p passes", () => {
    expect(meetsMinimum(base).passes).toBe(true);
  });

  it("passes the playable line it reports", () => {
    const v = meetsMinimum({ gpuTier: "ultra", cpuTier: "high", resolution: "1080p" });
    expect(v.fps).toBeGreaterThanOrEqual(PLAYABLE_FLOOR);
    expect(v.passes).toBe(true);
  });

  it("names RAM and storage shortfalls as gaps instead of a bare verdict", () => {
    const v = meetsMinimum({ ...base, ramGb: 8, freeSpaceGb: 60 });
    expect(v.passes).toBe(false);
    expect(v.gaps).toHaveLength(2);
    expect(v.gaps[0]).toContain("8 GB");
    expect(v.reason).toContain("150 GB");
  });

  it("does not invent a shortfall when the numbers clear the baseline", () => {
    const v = meetsMinimum({ ...base, ramGb: 32, freeSpaceGb: 500 });
    expect(v.gaps).toEqual([]);
    expect(v.passes).toBe(true);
  });
});

describe("verdictNote", () => {
  it("keeps saying there is no PC build to run today, whichever way the verdict falls", () => {
    expect(verdictNote(base)).toContain("no announced PC version");
    expect(verdictNote({ ...base, gpuTier: "entry", cpuTier: "low", resolution: "4k" })).toContain(
      "no announced PC version",
    );
  });
});
