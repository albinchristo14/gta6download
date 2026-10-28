"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export const PRIMARY_NAV = [
  { href: "/gta-6-download", label: "Download Status" },
  { href: "/gta-6-release-date", label: "Release Date" },
  { href: "/gta-6-system-requirements", label: "Requirements" },
  { href: "/where-to-buy", label: "Where to Buy" },
  { href: "/news", label: "News" },
];

export const SECONDARY_NAV = [
  { href: "/faq", label: "FAQ" },
  { href: "/downloads", label: "Downloads" },
  { href: "/guides", label: "Guides" },
  { href: "/errors", label: "Errors" },
  { href: "/tools/fps-estimator", label: "FPS Estimator" },
  { href: "/tools/can-i-run-gta-6", label: "Can I Run It?" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  if (pathname === "/") {
    return (
      <header className="vi-header">
        <a className="vi-announcement" href="#explore">Official trailer <span>Watch here ↓</span></a>
        <div className="vi-header-row">
          <Link href="/" className="vi-wordmark" aria-label="GTA6Download home">VI<span>DOWNLOAD HUB</span></Link>
          <div className="vi-header-actions">
            <Link href="/where-to-buy" className="vi-pill">Where to buy ↗</Link>
            <button ref={menuButton} type="button" className="vi-menu-button" aria-expanded={open} aria-controls="home-navigation" onClick={() => setOpen(v => !v)} aria-label={open ? "Close navigation" : "Open navigation"}>
              <span aria-hidden="true">{open ? "×" : "☰"}</span>
            </button>
          </div>
        </div>
        <nav id="home-navigation" aria-label="Main" className="vi-navigation" hidden={!open}>
          <div>{PRIMARY_NAV.map(n => <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}<span aria-hidden="true">↗</span></Link>)}</div>
          <div>{SECONDARY_NAV.map(n => <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}<span aria-hidden="true">↗</span></Link>)}</div>
          <p>Independent GTA 6 coverage. Not affiliated with Rockstar Games.</p>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/95 backdrop-blur supports-[backdrop-filter]:bg-ink-950/80">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-baseline gap-1.5 text-lg font-bold tracking-tight text-white"
        >
          <span className="text-brand-400">GTA</span>
          <span className="text-sunset-400">6</span>
          <span className="font-medium text-ink-200">Download</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-850 hover:text-white"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/gta-6-download"
            className="btn-primary ml-2 px-4 py-2 text-xs"
          >
            Get notified at launch
          </Link>
        </nav>

        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-ink-700 px-3 py-2 text-sm font-medium text-ink-200 lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-ink-800 bg-ink-900 lg:hidden"
        >
          <div className="container-page grid gap-1 py-4 sm:grid-cols-2">
            {[...PRIMARY_NAV, ...SECONDARY_NAV].map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-200 hover:bg-ink-850 hover:text-white"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
