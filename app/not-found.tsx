import Link from "next/link";

const DESTINATIONS = [
  {
    href: "/gta-6-download",
    title: "Can I download GTA 6 yet?",
    blurb: "The current availability status, updated against Rockstar's own announcements.",
  },
  {
    href: "/gta-6-release-date",
    title: "Release date",
    blurb: "19 November 2026 on PS5 and Xbox Series X|S, with the full change history.",
  },
  {
    href: "/where-to-buy",
    title: "Where to buy",
    blurb: "Every official storefront, with the editions and prices actually on sale.",
  },
  {
    href: "/news",
    title: "Latest GTA 6 news",
    blurb: "Every article on this site, newest first.",
  },
];

export default function NotFound() {
  return (
    <main className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-balance text-4xl font-bold tracking-tight text-ink-950">
          This page does not exist
        </h1>
        <p className="mt-4 text-pretty text-base leading-7 text-ink-600">
          Which is worth saying plainly: a page that is not here cannot be the GTA 6 download you
          were promised. Nothing on this site offers a file, because no legitimate GTA 6 file exists
          to offer yet. If somewhere else told you differently, that is the thing to be careful of.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/gta-6-download" className="btn-primary">
            Check download status
          </Link>
          <Link href="/news/how-to-avoid-gta-6-download-scams" className="btn-secondary">
            How to spot a fake download
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2">
        {DESTINATIONS.map((d) => (
          <Link key={d.href} href={d.href} className="card group p-5 hover:shadow-glow">
            <h2 className="text-base font-bold text-ink-950 group-hover:text-brand-700">
              {d.title}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-ink-600">{d.blurb}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
