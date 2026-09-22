import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  pseoFamilies,
  loadRows,
  bodySlugFor,
  getFamily,
  itemPath,
  type PseoFamily,
  type PseoRow,
} from "@/lib/pseo";
import { getPublishedPostBySlug } from "@/lib/posts";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/AdSlot";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { RelatedContent } from "@/components/RelatedContent";
import { siteConfig } from "@/site.config";

export const dynamicParams = false;

function resolve(
  familyParam: string,
  itemParam: string,
): { family: PseoFamily; row: PseoRow } | null {
  const family = getFamily(familyParam);
  if (!family) return null;
  const row = loadRows(family).find((r) => r.slug === itemParam);
  return row ? { family, row } : null;
}

/** A reviewed body is the second half of the gate; without it the page stays out of the index. */
function findBody(family: PseoFamily, row: PseoRow) {
  return getPublishedPostBySlug(bodySlugFor(family, row));
}

function specRows(family: PseoFamily, row: PseoRow): Array<{ label: string; value: string }> {
  if (family.id === "gpu") {
    return [
      { label: "Video memory", value: `${String(row.vramGb ?? "unknown")} GB` },
      { label: "Performance tier", value: String(row.tier ?? "unknown") },
      { label: "Vendor", value: String(row.vendor ?? "unknown") },
      { label: "Released", value: String(row.releaseYear ?? "unknown") },
    ];
  }
  if (family.id === "cpu") {
    return [
      { label: "Cores / threads", value: `${String(row.cores ?? "?")} / ${String(row.threads ?? "?")}` },
      { label: "Performance tier", value: String(row.tier ?? "unknown") },
      { label: "Vendor", value: String(row.vendor ?? "unknown") },
      { label: "Released", value: String(row.releaseYear ?? "unknown") },
    ];
  }
  return [
    { label: "Platform", value: String(row.platform ?? "All") },
    { label: "When it can happen", value: String(row.phase ?? "launch") },
    { label: "What you see", value: String(row.symptom ?? "—") },
  ];
}

function untitled(family: PseoFamily, row: PseoRow): string {
  return family.id === "error" ? row.name : `GTA 6 on ${row.name}`;
}

export function generateStaticParams() {
  return pseoFamilies.flatMap((family) =>
    loadRows(family).map((row) => ({ family: family.routeBase, item: row.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ family: string; item: string }>;
}) {
  const { family: familyParam, item } = await params;
  const resolved = resolve(familyParam, item);
  if (!resolved) return {};
  const { family, row } = resolved;
  const body = findBody(family, row);

  if (!body) {
    return pageMetadata({
      title: untitled(family, row),
      description: `We are still writing the verified GTA 6 detail page for ${row.name}.`,
      path: itemPath(family, row),
      index: false,
    });
  }

  return pageMetadata({
    title: body.frontmatter.title,
    description: body.frontmatter.description,
    path: itemPath(family, row),
    keywords: body.frontmatter.tags,
  });
}

export default async function PseoItemPage({
  params,
}: {
  params: Promise<{ family: string; item: string }>;
}) {
  const { family: familyParam, item } = await params;
  const resolved = resolve(familyParam, item);
  if (!resolved) notFound();

  const { family, row } = resolved;
  const path = itemPath(family, row);
  const body = findBody(family, row);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: row.name, url: absoluteUrl(path) },
        ])}
      />

      <div className="container-page py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
            <li>
              <Link href="/" className="hover:text-brand-700">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-ink-700">{row.name}</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">{family.label}</p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
            {body ? body.frontmatter.title : `GTA 6 on ${row.name}`}
          </h1>

          <dl className="card mt-6 grid gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
            {specRows(family, row).map((spec) => (
              <div key={spec.label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  {spec.label}
                </dt>
                <dd className="mt-0.5 font-medium text-ink-900">{spec.value}</dd>
              </div>
            ))}
          </dl>

          {body ? (
            <>
              <JsonLd data={articleJsonLd(body.frontmatter, { type: "Article", path })} />
              <AdSlot id="pseo-top" />
              <div className="prose-gta mt-8">
                <MDXRemote source={body.content} />
              </div>
              <AffiliateDisclosure className="mt-8" />
              <RelatedContent slug={body.slug} />
            </>
          ) : (
            <div className="card mt-8 p-6">
              <h2 className="text-base font-bold text-ink-950">
                This page is not published yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-700">
                We hold {family.label.toLowerCase()} pages back until there is verified,
                differentiated information to put on one — an empty template helps nobody.
                Meanwhile the honest picture of GTA 6 availability is on the{" "}
                <Link href="/gta-6-download" className="font-semibold text-brand-700 underline">
                  download status page
                </Link>
                , and{" "}
                {siteConfig.pcAnnounced
                  ? "PC requirements are covered on the"
                  : "there is still no announced PC version, which the"}{" "}
                <Link
                  href="/gta-6-system-requirements"
                  className="font-semibold text-brand-700 underline"
                >
                  system requirements page
                </Link>
                {siteConfig.pcAnnounced ? "." : " explains."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
