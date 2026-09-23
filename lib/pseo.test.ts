import { describe, it, expect } from "vitest";
import {
  pseoFamilies,
  loadRows,
  bodySlugFor,
  isReady,
  getFamily,
  itemPath,
  isProgrammaticBody,
  postPath,
  pseoPathForSlug,
  readyItemPaths,
} from "./pseo";

const gpu = pseoFamilies.find((f) => f.id === "gpu")!;
const error = pseoFamilies.find((f) => f.id === "error")!;

describe("pseo families", () => {
  it("have unique ids, route bases and data files", () => {
    for (const key of ["id", "routeBase", "dataFile"] as const) {
      const values = pseoFamilies.map((f) => f[key]);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("route bases never collide with a single-segment route they would shadow", () => {
    for (const family of pseoFamilies) {
      expect(family.routeBase).toMatch(/^[a-z0-9-]+$/);
      expect(family.routeBase).not.toMatch(/^gta-6-/);
    }
  });
});

describe("loadRows", () => {
  it("returns rows that all carry a slug and a name", () => {
    for (const family of pseoFamilies) {
      const rows = loadRows(family);
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.slug).toBeTruthy();
        expect(row.name).toBeTruthy();
      }
    }
  });

  it("keeps slugs unique inside a family so routes cannot collide", () => {
    for (const family of pseoFamilies) {
      const slugs = loadRows(family).map((r) => r.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("resolves through getFamily by route base", () => {
    expect(getFamily("gpu")?.id).toBe("gpu");
    expect(getFamily("nope")).toBeUndefined();
  });
});

describe("the readiness gate", () => {
  it("namespaces body slugs by family so two rows cannot share a body", () => {
    expect(bodySlugFor(gpu, { slug: "rtx-4060", name: "x" })).toBe("gpu-rtx-4060");
    expect(bodySlugFor(error, { slug: "rtx-4060", name: "x" })).toBe("error-rtx-4060");
  });

  it("is ready only when a published body slug exists", () => {
    const row = { slug: "rtx-4060", name: "x" };
    expect(isReady(gpu, row, new Set(["gpu-rtx-4060"]))).toBe(true);
    expect(isReady(gpu, row, new Set())).toBe(false);
    // A body in the wrong namespace must not unlock a page.
    expect(isReady(gpu, row, new Set(["error-rtx-4060"]))).toBe(false);
  });

  it("contributes nothing to the sitemap while no reviewed bodies exist", () => {
    expect(readyItemPaths(new Set())).toEqual([]);
  });

  it("emits a path once exactly one reviewed body is published", () => {
    const row = loadRows(gpu)[0];
    expect(readyItemPaths(new Set([bodySlugFor(gpu, row)]))).toContain(itemPath(gpu, row));
  });
});

describe("where a published body is served", () => {
  it("points a body slug at its programmatic page instead of a /news duplicate", () => {
    for (const family of pseoFamilies) {
      for (const row of loadRows(family)) {
        const slug = bodySlugFor(family, row);
        expect(pseoPathForSlug(slug)).toBe(itemPath(family, row));
        expect(postPath(slug)).toBe(itemPath(family, row));
        expect(isProgrammaticBody(slug)).toBe(true);
      }
    }
  });

  it("leaves ordinary article slugs on the article template", () => {
    expect(pseoPathForSlug("gta-6-pc-download-status")).toBeNull();
    expect(postPath("gta-6-pc-download-status")).toBe("/news/gta-6-pc-download-status");
    expect(isProgrammaticBody("gta-6-pc-download-status")).toBe(false);
  });

  it("does not invent a route for a family prefix with no matching row", () => {
    expect(pseoPathForSlug("gpu-not-a-real-card")).toBeNull();
    expect(postPath("gpu-not-a-real-card")).toBe("/news/gpu-not-a-real-card");
  });
});
