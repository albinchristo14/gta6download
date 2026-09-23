import { describe, it, expect, afterEach, vi } from "vitest";
import { siteConfig } from "./site.config";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

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

  it("prefers NEXT_PUBLIC_SITE_URL so a preview cannot publish production canonicals", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example/");
    const { siteConfig: preview } = await import("./site.config");
    expect(preview.url).toBe("https://preview.example");
  });

  it("keeps the contact address fixed when the origin changes", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example");
    const { siteConfig: preview } = await import("./site.config");
    expect(preview.supportEmail).toBe("hello@gta6download.store");
  });
});
