import { describe, it, expect } from "vitest";
import { timeUntil, relativeDays } from "./countdown";

const TARGET = "2026-11-19T00:00:00.000Z";

describe("timeUntil", () => {
  it("splits the remaining time into days, hours, minutes and seconds", () => {
    const now = new Date("2026-11-17T10:30:15.000Z");
    expect(timeUntil(TARGET, now)).toMatchObject({
      days: 1,
      hours: 13,
      minutes: 29,
      seconds: 45,
      isPast: false,
    });
  });

  it("reports exactly zero as not past with all parts zero", () => {
    expect(timeUntil(TARGET, new Date(TARGET))).toMatchObject({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("flags a passed date without returning negative units", () => {
    const r = timeUntil(TARGET, new Date("2026-12-01T00:00:00.000Z"));
    expect(r.isPast).toBe(true);
    expect(r.totalMs).toBeLessThan(0);
    expect(r.days).toBeGreaterThanOrEqual(0);
  });

  it("throws on an unparseable target instead of silently rendering NaN", () => {
    expect(() => timeUntil("not-a-date")).toThrow(/unparseable/);
  });
});

describe("relativeDays", () => {
  it("pluralises sensibly", () => {
    expect(relativeDays(1)).toBe("1 day");
    expect(relativeDays(12)).toBe("12 days");
    expect(relativeDays(90)).toBe("about 3 months");
  });
});
