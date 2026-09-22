# gta6download.store

An independent GTA 6 information site targeting "GTA 6 download" search terms. Next.js (App
Router) + MDX, statically generated, deployed on Vercel.

**Editorial rule that shapes the whole repo:** no legitimate version of GTA 6 is downloadable
before 19 November 2026, so no page implies one exists. Every page that matches a download
intent for a product we do not have (PC, mobile, APK, offline, Steam, Epic, Rockstar launcher)
states that plainly, warns about the malware those searches actually surface, and routes the
reader to an official storefront or the email alert. We never host, link to, or distribute
game files, cracks, APKs, cheats or save tools.

## Develop

```bash
npm install
cp .env.example .env   # add ANTHROPIC_API_KEY only if you run ingest
npm run dev
```

No database. Everything renders from files in `content/` and `data/`.

## Content workflow (AI-assisted, human-reviewed)

1. `npm run ingest` — pulls GTA 6 news from the RSS feeds in `scripts/feeds.config.ts`, drafts
   original rewrites with Claude, and writes **drafts only** to `content/drafts/`. Nothing
   publishes automatically, and `scripts/writeDraft.ts` refuses to write anywhere else.
2. Review each draft for accuracy. Edit freely.
3. Move an approved file to `content/posts/` with `status: "published"` and a `slug` you choose.
4. Commit. `npm run build` runs the validation guard first, then Vercel redeploys.

```bash
npm test          # 99 unit tests
npm run typecheck
npm run build     # prebuild = tsx scripts/validate-content.ts
```

## Routes

| Path | Source of truth |
| --- | --- |
| `/gta-6-download`, `/where-to-buy`, `/gta-6-release-date`, `/gta-6-system-requirements`, `/faq` | hand-written pages |
| `/news`, `/downloads`, `/installation`, `/requirements`, `/errors`, `/guides`, `/comparisons` | silo indexes over post frontmatter |
| `/news/[slug]` | `content/posts/*.mdx` |
| `/gta-6-download-pc`, `/gta-6-apk-download`, … (13) | `lib/download-pages.ts` |
| `/gpu/[card]`, `/cpu/[chip]`, `/errors/[error]` | `data/*.json` + a matching published post |
| `/tools/fps-estimator`, `/tools/can-i-run-gta-6` | `lib/fps.ts` projections, clearly labelled as estimates |
| `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | route handlers |

### Programmatic pages are gated on a human

A `/gpu/…`, `/cpu/…` or `/errors/…` URL exists as soon as its data row exists, but it is
`noindex` and absent from the sitemap until a published post with slug
`<family>-<row-slug>` (e.g. `gpu-rtx-4060`) sits in `content/posts/`. That is why the generator
can scale to hundreds of rows while the index stays small: 84 pages build, 43 are listed.
`npm run ingest` drafts those bodies, but they stay in `content/drafts/` until reviewed.

## Monetization

- **Affiliate links:** edit `affiliates.config.ts` — one file updates every Buy button. Links
  render `rel="sponsored nofollow noopener"` and each use carries an FTC disclosure.
- **Display ads:** `components/AdSlot.tsx` renders nothing until `NEXT_PUBLIC_ADSENSE_CLIENT`
  and `NEXT_PUBLIC_ADS_ENABLED="true"` are both set, so no empty box ever ships.
- **Email capture:** set `EMAIL_PROVIDER_ENDPOINT` to your provider's form action. Unset, the
  API logs the address instead of forwarding it, so local runs are inert.

## Out of scope

`docs/growth-playbook.md` holds the operational backlog we deliberately did not build: money
and vehicle calculators, graphics optimizer, interactive map, mission and achievement trackers,
character builder, link building, social, KPI campaigns. Keyword tooling is fair game; fake
urgency, fake downloads and scraped content are not.
