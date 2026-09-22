import { describe, it, expect } from "vitest";
import { affiliateStores, getStore, availableStores } from "./affiliates.config";

describe("affiliateStores", () => {
  it("every store has a non-empty https url", () => {
    expect(affiliateStores.length).toBeGreaterThan(0);
    for (const s of affiliateStores) {
      expect(s.url.startsWith("https://")).toBe(true);
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
    }
  });

  it("store ids are unique", () => {
    const ids = affiliateStores.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getStore resolves a known id and returns undefined for unknown", () => {
    expect(getStore(affiliateStores[0].id)?.id).toBe(affiliateStores[0].id);
    expect(getStore("does-not-exist")).toBeUndefined();
  });

  it("never marks a PC store as buyable while no PC version is announced", () => {
    const pc = affiliateStores.filter((s) => s.platform === "PC");
    expect(pc.length).toBeGreaterThan(0);
    for (const store of pc) {
      expect(store.available).toBe(false);
      expect(store.note).toBeTruthy();
    }
  });

  it("availableStores returns only official storefronts with a real product", () => {
    const live = availableStores();
    expect(live.length).toBeGreaterThan(0);
    expect(live.every((s) => s.available)).toBe(true);
    expect(live.some((s) => s.platform === "PC")).toBe(false);
  });
});
