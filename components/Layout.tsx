import Link from "next/link";
import { siteConfig } from "@/site.config";

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs = [],
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Array<{ name: string; href: string }>;
  children?: React.ReactNode;
}) {
  return (
    <div className="hero-gradient border-b border-ink-800 text-white">
      <div className="container-page py-12 sm:py-16">
        {crumbs.length > 0 && <Breadcrumbs crumbs={crumbs} />}
        {eyebrow && <p className="eyebrow mt-6 text-brand-300">{eyebrow}</p>}
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-3xl text-balance text-base leading-7 text-ink-200 sm:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
}

export function Breadcrumbs({ crumbs }: { crumbs: Array<{ name: string; href: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-400">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-ink-300">{c.name}</span>
            ) : (
              <Link href={c.href} className="hover:text-white">
                {c.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Section({
  title,
  description,
  actions,
  href,
  hrefLabel,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`container-page py-12 sm:py-14 ${className}`}>
      {(title || actions) && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            {title && <h2 className="text-2xl font-bold tracking-tight text-ink-950">{title}</h2>}
            {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-600">{description}</p>}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            {href && hrefLabel && (
              <Link href={href} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                {hrefLabel} →
              </Link>
            )}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

/** The truthful availability statement, repeated wherever the site needs it. */
export function StatusPill({ tone = "warn" }: { tone?: "warn" | "ok" }) {
  const styles =
    tone === "ok"
      ? "border-palm-500/40 bg-palm-500/10 text-palm-400"
      : "border-sunset-500/40 bg-sunset-500/10 text-sunset-400";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {siteConfig.downloadStatus === "preorder" ? "Pre-order open · not downloadable" : "Status updated"}
    </span>
  );
}

export function Prose({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`prose-gta max-w-3xl ${className}`}>{children}</div>;
}

export function UpdatedNote({
  date = siteConfig.lastReviewed,
  className = "",
}: {
  date?: string;
  className?: string;
}) {
  return (
    <p className={`text-xs text-ink-500 ${className}`}>
      Independently researched. Last checked {new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} against Rockstar's official announcements.
    </p>
  );
}
