import fs from "node:fs";
import path from "node:path";

export interface PseoFamily {
  id: string;
  label: string;
  /** URL segment the family lives under, e.g. "gpu" → /gpu/rtx-4060. */
  routeBase: string;
  /** Filename inside data/. */
  dataFile: string;
  /** Silo a reviewed body should be filed under. */
  bodyCategory: "requirements" | "errors";
}

export interface PseoRow {
  slug: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Families are cheap to add and impossible to publish by accident: a URL exists as soon
 * as a data row does, but it only becomes indexable when a matching reviewed body exists
 * (see `isReady`). That split is what keeps a thousand-row dataset from becoming a
 * thousand doorway pages.
 */
export const pseoFamilies: PseoFamily[] = [
  {
    id: "gpu",
    label: "GPU",
    routeBase: "gpu",
    dataFile: "gpus.json",
    bodyCategory: "requirements",
  },
  {
    id: "cpu",
    label: "CPU",
    routeBase: "cpu",
    dataFile: "cpus.json",
    bodyCategory: "requirements",
  },
  {
    id: "error",
    label: "Error fix",
    routeBase: "errors",
    dataFile: "errors.json",
    bodyCategory: "errors",
  },
];

export function getFamily(routeBase: string): PseoFamily | undefined {
  return pseoFamilies.find((f) => f.routeBase === routeBase);
}

const cache = new Map<string, PseoRow[]>();

export function loadRows(family: PseoFamily): PseoRow[] {
  const cached = cache.get(family.dataFile);
  if (cached) return cached;

  const file = path.join(process.cwd(), "data", family.dataFile);
  let rows: PseoRow[] = [];
  if (fs.existsSync(file)) {
    const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(parsed)) {
      throw new Error(`data/${family.dataFile} must contain a JSON array`);
    }
    rows = parsed.filter(
      (row): row is PseoRow =>
        !!row &&
        typeof (row as PseoRow).slug === "string" &&
        (row as PseoRow).slug.length > 0 &&
        typeof (row as PseoRow).name === "string" &&
        (row as PseoRow).name.length > 0,
    );
  }
  cache.set(family.dataFile, rows);
  return rows;
}

/** The slug a reviewed MDX body must carry for this row to become publishable. */
export function bodySlugFor(family: PseoFamily, row: PseoRow): string {
  return `${family.id}-${row.slug}`;
}

export function isReady(
  family: PseoFamily,
  row: PseoRow,
  publishedSlugs: Set<string>,
): boolean {
  return publishedSlugs.has(bodySlugFor(family, row));
}

export function itemPath(family: PseoFamily, row: PseoRow): string {
  return `/${family.routeBase}/${row.slug}`;
}

/**
 * Reverse of `bodySlugFor`. A body exists to publish a programmatic page, so that page is
 * its URL — left as `/news/gpu-rtx-4060` it would be a second indexable copy of `/gpu/rtx-4060`.
 */
export function pseoPathForSlug(slug: string): string | null {
  const [familyId, ...rest] = slug.split("-");
  if (rest.length === 0) return null;
  const family = pseoFamilies.find((f) => f.id === familyId);
  if (!family) return null;
  const rowSlug = rest.join("-");
  return loadRows(family).some((row) => row.slug === rowSlug)
    ? `/${family.routeBase}/${rowSlug}`
    : null;
}

export function isProgrammaticBody(slug: string): boolean {
  return pseoPathForSlug(slug) !== null;
}

/** Where a published post is served from: its family page, or the article template. */
export function postPath(slug: string): string {
  return pseoPathForSlug(slug) ?? `/news/${slug}`;
}

/** Only rows with a published, human-reviewed body belong in the sitemap. */
export function readyItemPaths(publishedSlugs: Set<string>): string[] {
  return pseoFamilies.flatMap((family) =>
    loadRows(family)
      .filter((row) => isReady(family, row, publishedSlugs))
      .map((row) => itemPath(family, row)),
  );
}

export interface HardwareCatalog {
  gpus: Array<{ slug: string; name: string; tier: string }>;
  cpus: Array<{ slug: string; name: string; tier: string }>;
}

/**
 * The same rows that drive /gpu/* and /cpu/* pages also feed the FPS estimator and the
 * requirement checker, so the tool and the pages cannot drift apart into two different
 * hardware lists.
 */
export function hardwareCatalog(): HardwareCatalog {
  const pick = (id: "gpu" | "cpu") =>
    loadRows(getFamily(id)!).map((row) => ({
      slug: row.slug,
      name: row.name,
      tier: String(row.tier ?? "entry"),
    }));
  return { gpus: pick("gpu"), cpus: pick("cpu") };
}
