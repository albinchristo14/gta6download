# gta6download.store — Design Spec

**Date:** 2026-06-29
**Status:** Approved (brainstorming → ready for implementation plan)

## Goal

Build an SEO content hub at `gta6download.store` that ranks for GTA 6 download-related
search terms and monetizes via **affiliate/referral revenue** (official store links) and
**display ads**. Content is produced **AI-assisted with human review** before publishing.

## Strategic Context (why the design is shaped this way)

- The search intent behind "gta 6 download" is overwhelmingly download-the-game intent. As
  of mid-2026 GTA 6 is **not yet downloadable** (announced/pre-order phase). A pure
  article site mismatches that intent.
- "gta 6 download" attracts heavy malware/piracy/scam competition, so Google applies extra
  spam/trust scrutiny. A brand-new `.store` domain with no authority is the hardest
  starting position.
- **Therefore:** build a legitimate GTA 6 hub with news + an **honest "Download Status"
  page** that captures download intent legitimately (status + official pre-order links +
  email capture), positioned to capture the download-intent surge at actual launch.

## Decisions (locked)

| Area | Decision |
|---|---|
| Monetization | Affiliate/referral revenue + display ads |
| Content engine | AI-assisted drafting with human review before publish |
| Platform/stack | Next.js (App Router) + TypeScript + Tailwind, MDX files in repo, deploy on Vercel |
| Download intent handling | Honest, always-updated "Download Status" hub page |
| News source | RSS feeds (gaming news), filtered for GTA 6 |

## Architecture

Two halves:

1. **Public site** (`/app`) — statically generated Next.js pages. Static = fast = good
   Core Web Vitals = ranking signal. No database; content is MDX files.
2. **Content pipeline** (`/scripts`) — Node script that fetches RSS, filters for GTA 6,
   drafts original rewrites via the Claude API, and writes **drafts only** to
   `content/drafts/`. Nothing publishes without a human commit. This is the core guardrail
   against Google's scaled-content-abuse penalties.

## Site Structure & Pages

| Page | URL | Purpose / target intent |
|---|---|---|
| Homepage | `/` | Hero = download status + countdown, then latest news grid. Broad "gta 6 download". |
| Download Status hub ⭐ | `/gta-6-download` | Money page: availability status, official pre-order/buy buttons (affiliate), platform list, countdown, "notify me" email signup. |
| News index | `/news` | Paginated list of all articles. Ad impressions + freshness. |
| Article | `/news/[slug]` | Individual AI-drafted, human-approved posts. |
| Where to Buy | `/where-to-buy` | Official stores per platform with affiliate links + edition/price comparison. |
| Release Date | `/gta-6-release-date` | Evergreen high-volume keyword. |
| System Requirements | `/gta-6-system-requirements` | Evergreen high-volume keyword. |
| FAQ | `/faq` | Schema-marked Q&A targeting featured snippets ("is gta 6 out", "can I download gta 6 yet", "is gta 6 free"). |
| Legal | `/about`, `/contact`, `/privacy`, `/disclaimer` | Required for AdSense approval + Google trust (affiliate disclosure, ownership). |

### Cross-cutting SEO infrastructure (built once)
- Per-page metadata (title/description/canonical/OpenGraph) via Next.js Metadata API.
- JSON-LD structured data: `NewsArticle` (posts), `FAQPage` (FAQ), `BreadcrumbList`,
  `Organization`.
- Auto-generated `sitemap.xml` and `robots.txt`.
- Outbound RSS feed at `/feed.xml`.
- Fast/responsive/accessible layout for Core Web Vitals.

### Explicitly out of scope (YAGNI)
Comments, user accounts, on-site search, i18n. Revisit only if traffic justifies.

## Expansion (v2) — Silos, Programmatic Pages, Scale

Added 2026-06-29 after strategy review. Extends the v1 structure above; does not replace it.

### Content silos & taxonomy
Real categories (not just URL prefixes), each with an index page and per-article related-content
linking. Silos: **Downloads, Installation, Requirements, Errors, News, Guides, Comparisons.**
Articles carry a `category` and `tags`; every article renders a "Related" block (Guides / News /
Downloads / Troubleshooting / Requirements / FAQs).

### Download silo pages
`/gta-6-download-pc`, `-steam`, `-epic`, `-rockstar`, `-ps5`, `-xbox`, `-windows-11`, `-offline`,
`-online`, plus honest-framing pages for terms with no real product: `-mobile`, `-android`, `-ios`,
`-apk`. Each download-silo page targets its keyword and routes to official affiliate links.

### Honest-framing constraint (LOCKED — applies site-wide)
Pages that target "download" terms for which **no legitimate product exists** (mobile, Android, iOS,
APK) must tell the truth: state plainly that no official version exists, warn about scams/malware,
and convert to official pre-order/buy links + email capture. We do **not** publish pages implying a
download exists when it does not, and we **never host, link to, or distribute game files, cracks,
APKs, cheats, or save tools.** Rationale: such pages are an AdSense-rejection and site-wide-trust
risk on a new `.store` domain, and they fail user intent — which drags down rankings for the
legitimate pages too. This constraint is non-negotiable in the build; aggressive *keyword targeting*
is fine, deceptive *content* is not.

### Programmatic pages (data-driven, AI-written, human-reviewed)
Page families generated from a topic queue: **GPU+GTA6, CPU+GTA6, error-code fixes, platform
differences, comparisons (GTA 6 vs X).** Each page's body is **drafted by the Claude pipeline and
human-reviewed before publish** (same drafts-only gate as RSS). A programmatic page is published only
when it has genuine, differentiated content — no empty templated doorway pages. Scale target is
volume-permissive but quality-gated: pages exist because they say something real, not because a
template exists.

### Expanded JSON-LD schema set
Add to the v1 set (Article/FAQ/Breadcrumb/Organization): **HowTo** (installation/error guides),
**VideoObject** (video embeds), **SoftwareApplication** (download/requirements pages),
**WebSite + SearchAction** (sitelinks search box on the homepage).

### Internal linking discipline
Every article includes a related-content block linking across silos. Target a healthy internal-link
density per page (the v1 plan wires the reusable block; editorial fills specific links).

### Out of scope for the build (separate growth/ops playbook, not code)
Link building, social strategy, the publishing-volume calendar/cadence, daily-posting operations,
and KPI/analytics-account setup are **operations**, not site features. Captured in a separate
`docs/growth-playbook.md`, not as implementation tasks. Analytics *wiring* (GA/Clarity/GSC
verification tags) is a small build task; running the campaigns is not.

## Content Pipeline

Single script `scripts/ingest.ts`, run via `npm run ingest`.

```
RSS feeds → fetch & parse → filter "is this really GTA 6 news?" → dedupe
   → Claude API drafts ORIGINAL rewrite + analysis (with source attribution)
   → write content/drafts/<date>-<slug>.mdx (status: draft)
        → HUMAN reviews → move to content/posts/ → git commit → Vercel deploys
```

### Modules (each small, single-purpose, independently testable)

| Module | Job | Depends on |
|---|---|---|
| `feeds.config.ts` | RSS URLs + keyword filters (`gta 6`, `gta vi`, `rockstar`…) | — |
| `fetchFeeds.ts` | Pull & parse RSS into normalized items | `rss-parser` |
| `filter.ts` | Keep genuine GTA 6 items; drop off-topic/dupes (ledger `content/.seen.json`) | — |
| `draft.ts` | Send item to Claude API → original article (title, body, summary, tags) | `@anthropic-ai/sdk` |
| `writeDraft.ts` | Render draft into MDX with frontmatter | — |

### Anti-penalty guardrails
- Claude **rewrites and adds original analysis** — never copies source text; always cites +
  links the source.
- Output is a **draft**; nothing live until human commit (defeats scaled-content abuse).
- Each article includes an author byline and a "Sources" section (E-E-A-T signals).

### Model
`claude-opus-4-8` for quality drafts; config switch to `claude-haiku-4-5` for cheaper/
faster bulk drafting.

### Frontmatter schema (every post)
```yaml
title, slug, description, date, updated, tags, sources[], status, author, image
```

### Scheduling (optional, later)
Same script may run on Vercel Cron or a GitHub Action to **generate drafts only** — never
auto-publish; it opens a commit/PR for human review.

## Monetization Wiring

- **Affiliate links** centralized in `affiliates.config.ts`; every Buy/Pre-order button
  resolves its URL from there (one edit updates all pages). All affiliate links use
  `rel="sponsored nofollow"`; an FTC affiliate disclosure renders near them automatically.
- **Display ads** via an `<AdSlot />` component with placeholder slots in article/news
  layouts; inert until AdSense approval (which depends on legal pages + real content).
- **Email capture** on the Download Status hub; form posts to a configurable provider
  endpoint (e.g. ConvertKit/Buttondown), stubbed in config for later connection.

## Error Handling

**Pipeline:** RSS feed down → skip feed, log, continue. Claude API error → retry once, then
skip item + log. Malformed item → skip. Run always produces output or a clear log; never a
half-written file.

**Site:** custom `not-found.tsx` (404) and `error.tsx`; missing article → 404; missing
image → fallback. Build fails loudly on invalid MDX frontmatter (catches bad drafts pre-deploy).

## Testing

- Unit tests (Vitest) on pure logic: `filter.ts` (relevance/dedupe), frontmatter
  parsing/validation, `affiliates.config` resolution.
- External calls (RSS, Claude) mocked in tests — no live network in CI.
- Build-time check: every published post has valid frontmatter and ≥1 source.

## Success Criteria

- Site builds and deploys statically on Vercel.
- All evergreen + legal pages present and indexable (sitemap, robots, structured data valid).
- Download Status hub renders status, official affiliate links (disclosed, `sponsored nofollow`),
  countdown, and email signup.
- `npm run ingest` produces review-ready MDX drafts from RSS without auto-publishing.
- Tests pass with external calls mocked.
