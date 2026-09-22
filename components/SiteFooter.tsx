import Link from "next/link";

const FOOTER_GROUPS: Array<{ heading: string; links: Array<{ href: string; label: string }> }> = [
  {
    heading: "Download",
    links: [
      { href: "/gta-6-download", label: "Download Status" },
      { href: "/downloads", label: "All download guides" },
      { href: "/where-to-buy", label: "Where to buy" },
      { href: "/gta-6-release-date", label: "Release date" },
    ],
  },
  {
    heading: "Help & guides",
    links: [
      { href: "/requirements", label: "Requirements" },
      { href: "/installation", label: "Installation" },
      { href: "/errors", label: "Error fixes" },
      { href: "/guides", label: "Guides" },
      { href: "/comparisons", label: "Comparisons" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { href: "/tools/fps-estimator", label: "FPS estimator" },
      { href: "/tools/can-i-run-gta-6", label: "PC requirement checker" },
    ],
  },
  {
    heading: "Site",
    links: [
      { href: "/news", label: "News" },
      { href: "/faq", label: "FAQ" },
      { href: "/feed.xml", label: "RSS feed" },
    ],
  },
];

const LEGAL = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink-200 bg-ink-950 text-ink-300">
      <div className="container-page py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_GROUPS.map((group) => (
            <div key={group.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
                {group.heading}
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <nav aria-label="Legal" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {LEGAL.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 space-y-2 border-t border-ink-800 pt-6 text-xs leading-6 text-ink-500">
          <p>
            © {new Date().getFullYear()} GTA6Download. An independent, fan-made information site.
            Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two
            Interactive. Grand Theft Auto, GTA and their logos are trademarks of their
            respective owners.
          </p>
          <p>
            Some outbound links to official stores are affiliate links — if you buy through them
            we may earn a commission at no extra cost to you. We only ever link to official
            storefronts and never host, link to, or distribute game files.
          </p>
        </div>
      </div>
    </footer>
  );
}
