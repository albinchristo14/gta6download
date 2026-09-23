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
| `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/opengraph-image.png` | route handlers |

### Programmatic pages are gated on a human

A `/gpu/…`, `/cpu/…` or `/errors/…` URL exists as soon as its data row exists, but it is
`noindex` and absent from the sitemap until a published post with slug
`<family>-<row-slug>` (e.g. `gpu-rtx-4060`) sits in `content/posts/`. That is why the generator
can scale to hundreds of rows while the index stays small: all 34 rows currently have a reviewed
body, so 34 of the 76 listed URLs are programmatic; a row without one still builds, unindexed.
`npm run ingest` drafts those bodies, but they stay in `content/drafts/` until reviewed.

A body published this way is only ever the second half of its programmatic page: `postPath()` in
`lib/pseo.ts` resolves it to `/gpu/rtx-4060`, so `/news/…` is never generated for it and the
sitemap, silos, related blocks and RSS never point at a second copy. Editorial articles — the
ones in every other category — keep the `/news/<slug>` URL.

## Monetization

- **Affiliate links:** edit `affiliates.config.ts` — one file updates every Buy button. Links
  render `rel="sponsored nofollow noopener"` and each use carries an FTC disclosure.
- **Display ads:** `components/AdSlot.tsx` renders nothing until `NEXT_PUBLIC_ADSENSE_CLIENT`
  and `NEXT_PUBLIC_ADS_ENABLED="true"` are both set, so no empty box ever ships.
- **Email capture:** signups are added to a Resend audience. Set `RESEND_API_KEY` and
  `RESEND_AUDIENCE_ID` (Pages Function env, or the dev route's process env); a repeat address is
  re-used rather than duplicated. Locally, unset, the request logs the address so dev is
  inert; in production an unset pair returns `503` rather than telling people they are on a
  list that does not exist.

## Deploy (Cloudflare Pages)

`output: "export"` is on, so `next build` emits a plain file tree in `out/` — 76 HTML pages plus
`404.html`, `feed.xml`, `sitemap.xml`, `robots.txt`, `_headers`, ~7 MB. `next start` no longer
works; preview a production build with `npx wrangler pages dev out`, which also runs the Function.

The only server-rendered thing was `POST /api/subscribe`, and static export drops route handlers
(`out/api` does not exist). It now lives in `functions/api/subscribe.ts`, which wraps the same
`subscribeRequest()` as the dev route, so the browser contract is shared rather than duplicated.

1. **Connect the repo** — Pages → Create project → Git integration → `albinchristo14/gta6download`,
   production branch `main`. Framework preset **None**, build command `npm run build`, build output
   directory `out`. `functions/` and `public/_headers` are picked up from the repo automatically.
2. **Set the environment variables** in Pages settings (all `NEXT_PUBLIC_*` are inlined at build
   time, so they belong in the build environment, not at request time):

   | Variable | Purpose |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | Canonical origin for canonicals, `sitemap.xml`, `robots.txt`, `feed.xml`, JSON-LD. Defaults to `https://gta6download.store`; set it on every preview deploy. |
   | `NEXT_PUBLIC_GSC_VERIFICATION` | Search Console ownership meta |
   | `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_CLARITY_ID` | Analytics |
   | `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ADSENSE_CLIENT` | Ad slots, off until both are set |
   | `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` | Secrets, Function runtime only. Signups become Resend contacts in that audience; the Function returns 503 without both |

   Never set `ANTHROPIC_API_KEY` on the host; `npm run ingest` is a local or scheduled-CI job.
3. **Add the domain** in Pages → Custom domains. Cloudflare issues the certificate and flattens the
   apex record. Set `NEXT_PUBLIC_SITE_URL` to the exact origin you want canonicalised.
4. **Check it** after the first deploy:
   ```bash
   curl -sI https://gta6download.store/gpu/rtx-4060 | grep -i cache-control
   curl -s  https://gta6download.store/sitemap.xml | grep -c "<loc>"   # 76, and no repeats
   curl -sI https://gta6download.store/nope | head -1                   # 404, styled 404.html
   curl -sI https://gta6download.store/opengraph-image.png | grep -i content-type   # image/png
   curl -s -X POST https://gta6download.store/api/subscribe \
        -H 'content-type: application/json' -d '{"email":"you@example.com"}'
   ```
   The last one answers `503` until `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` are set — that is the
   Function being honest, not a broken deploy. A success is a `200` plus a new contact in
   Resend → Audiences; the visitor's `context` (which page signed them up) is logged but dropped,
   because Resend contacts carry no metadata field.
5. **Deploying is committing.** Every content change is an MDX/JSON edit, so a push to `main`
   rebuilds and publishes; `prebuild` runs `scripts/validate-content.ts`, which fails the build on
   a duplicate slug, an over-long title, a missing source or a broken internal link. Roll back from
   the Pages deployment list. `.github/workflows/ci.yml` typechecks, tests and builds on every push
   and PR but publishes nothing — with Git integration wired up, a second deployer would just race
   it. To publish by hand instead: `npx wrangler pages deploy out`.

A VPS still works with no changes beyond `npm ci && npm run build`, serving `out/` from nginx
instead of `next start`, plus your own rate limit on `/api/subscribe`.


## Out of scope

`docs/growth-playbook.md` holds the operational backlog we deliberately did not build: money
and vehicle calculators, graphics optimizer, interactive map, mission and achievement trackers,
character builder, link building, social, KPI campaigns. Keyword tooling is fair game; fake
urgency, fake downloads and scraped content are not.
