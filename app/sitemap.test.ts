import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("emits each URL exactly once", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).not.toHaveLength(0);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("only publishes absolute URLs on the configured origin", () => {
    for (const entry of sitemap()) {
      expect(new URL(entry.url).origin).toBe("https://gta6download.store");
    }
  });
});
