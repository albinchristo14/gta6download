import { describe, it, expect } from "vitest";
import { siteConfig } from "./site.config";

describe("siteConfig", () => {
  it("exposes the canonical site URL with no trailing slash", () => {
    expect(siteConfig.url).toBe("https://gta6download.store");
  });

  it("has a parseable ISO release date", () => {
    expect(Number.isNaN(Date.parse(siteConfig.releaseDate))).toBe(false);
  });

  it("uses a known download status value", () => {
    expect(["preorder", "available", "not_yet"]).toContain(siteConfig.downloadStatus);
  });

  it("never claims a PC version that Rockstar has not announced", () => {
    expect(siteConfig.confirmedPlatforms).not.toContain("PC");
    expect(siteConfig.pcAnnounced).toBe(false);
  });
});
