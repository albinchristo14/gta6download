# gta6download.store — Growth & Ops Playbook

These are **operations**, not site features. They live here (not in the implementation plan)
because they're ongoing work you run, not code an agent builds once. The code plan
(`docs/superpowers/plans/2026-06-29-gta6download-site.md`) builds the machine; this runs it.

> Honest-framing rule applies to everything below: target keywords aggressively, never publish
> deceptive download claims, never distribute files. See the spec's locked constraint.

## Content publishing cadence (guideline, not a hard target)

Volume goals are aspirational and **quality-gated** — never publish a page that doesn't say
something real (Google's scaled-content-abuse policy deindexes thin mass pages, especially on a
new domain).

| Phase | Goal | Focus |
|---|---|---|
| Week 1 | ~30 cornerstone pages | Download silo, requirements, release date, FAQ, top errors |
| Month 1 | ~100 pages | Fill silos; first programmatic batch (only with real data) |
| Month 2–3 | grow as quality allows | Benchmarks, error DB, comparisons, daily news |
| Month 6+ | scale further | Only as authority + indexing support it |

**Watch GSC, not the page count.** If indexed pages stop rising while published pages keep rising,
you're producing thin content — slow down and improve quality.

## KPIs & analytics

Track in: **Google Search Console, Bing Webmaster Tools, Google Analytics 4, Microsoft Clarity.**

| Milestone | Signal |
|---|---|
| 100 pages indexed | Crawling/indexing healthy |
| 1,000 pages indexed | Silos working |
| 10k daily visitors | Long-tail traction |
| 100k monthly | News + evergreen compounding |
| 500k → 1M monthly | Authority + launch-surge capture |

Analytics **wiring** (verification meta tags / GA + Clarity script IDs) is a small build task
(`site.config.ts` env fields). Running and reading the dashboards is ops.

## Link building (ongoing, manual)

Gaming blogs · YouTube creators · Reddit references · gaming forums · Discord communities ·
social profiles · Medium · Quora · Pinterest. Earn links by being genuinely the most accurate,
fastest-updated GTA 6 status/news source — not by spamming.

## Social distribution (ongoing)

YouTube Shorts · TikTok · Instagram Reels · Facebook · X · Telegram · Discord. Repurpose news +
countdown + status updates. The site's `/feed.xml` feeds automation tools.

## Deferred tools & pages (post-launch — need real GTA 6 data)

Build only once the game ships and real data exists; building now = empty shells.

- **Money calculator, vehicle price calculator** — need real in-game economy/vehicle data.
- **Graphics settings optimizer** — improves a lot once real benchmark data exists.
- **Interactive map** — needs map tiles/POI data.
- **Mission tracker, achievement/trophy tracker** — need real mission/achievement lists.
- **Character builder, save-game tracker** — need real game systems.
- **Programmatic page families at full scale** (every GPU/CPU/handheld/launcher/error code) —
  the generator is built (v3), but most pages stay `noindex` until real post-launch benchmark
  data lets each carry differentiated content. Fill the `data/*.json` files + review bodies
  over time; index per-page as each becomes real.

## Pre-launch checklist (do once, before promoting)

- [ ] Legal pages live (about/contact/privacy/disclaimer) — required for AdSense.
- [ ] Affiliate program approvals in `affiliates.config.ts` (Steam/Epic/Rockstar/console/retailer).
- [ ] AdSense applied for **after** real content + legal pages exist.
- [ ] GSC + Bing verified; sitemap submitted.
- [ ] GA4 + Clarity IDs set.
- [ ] Email provider connected (`EMAIL_PROVIDER_ENDPOINT`).
