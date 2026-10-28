# GTA VI reference reconstruction

Reference: https://www.rockstargames.com/VI

## What was observed

The reference was opened in the connected Chrome browser. Its rendered DOM and screenshots showed a dark navy background, pink announcement banner, minimal expandable navigation, framed poster artwork, launch date/platform row, a large trailer panel, image-led feature cards, and news sections. These are browser observations, not conclusions established by static analysis.

## REA evidence and limits

- REA analysis of four downloaded first-party JavaScript chunks: `ev_66b56c50ad91bb17ab49d0ac618788dbeb94327153551eb9470715ca806db98d`.
- Summary view: `ev_358ba137018b8cf5dc81ceb6c0d6f3d72b6e95ee0a680bcc6e3fa9e4830bf0a5`.
- Module identity page: `ev_28231d30b0d631c80fe22bb582ca005dbad04e846fb75f84e1491eddbc143069`.
- The four files parsed without parse failures. Semantic coverage was partial because of result/heap limits. The analysis does not establish runtime execution or complete behavior.
- A separate localization-chunk analysis is retained as `ev_aea19bc1d504859e81fd121f2b488b20ebdf125d3dc021d964c9f4159efb5f83`; those files alone do not describe the homepage.
- REA live CDP observation was unavailable. A separate debugging-browser launch was rejected by the host policy. The existing browser connector supplied visual observations; it is not represented as REA runtime evidence.

## Reconstruction choices

The homepage follows the observed palette and section structure. The primary actions lead to our download status and store guides. Existing news selection, topic links, tools, FAQ previews, signup, disclosures, ad integration, metadata, and structured data are retained. Inner editorial pages retain their reading layout. The trailer section embeds the Rockstar player supplied by the user, with autoplay disabled and fullscreen enabled. A link to the official trailer page is retained below it.

The reference's proprietary animation engine and checkout flow are not reconstructed. Navigation uses a responsive disclosure menu with Escape dismissal and focus return. Motion is limited to hover feedback and respects reduced-motion preferences. The countdown now renders a deterministic placeholder before reading the browser clock, avoiding static-export hydration mismatches.

## Artwork provenance

All files in `public/vi/` were retrieved from the public first-party reference page. Grand Theft Auto artwork and trademarks belong to their respective owners. The site retains its independent fan-site disclosure.

| Local file | Reference media filename |
| --- | --- |
| poster.jpg | poster_full.0az_iud2g3y4j.jpg |
| launch-trailer.jpg | featured.0.fbrrtu5j-9_.jpg |
| leonida.jpg | onlyInLeonidaDesktop.15y2n40f3axwo.jpg |
| media.jpg | mediaDesktop.11iioep6d3wsf.jpg |
| trailer.jpg | trailer-2.0l.7aqib91fz6.jpg |

All media URLs use the prefix `https://www.rockstargames.com/VI/_next/static/media/`.

## Completion checklist

- Reference identity and visible layout: answered through direct browser observation.
- REA static analysis: partial; coverage limits preserved above.
- Core content preservation: checked against the previous homepage.
- Reconstruction: implemented in the existing Next.js application.
- Production build: passed; 91 static pages generated.
- Existing test suite: 119 tests passed across 15 files.
- Final exported homepage: no browser console errors, no missing images, exactly one H1, and no horizontal overflow at 1440px. Hero ends at approximately 998px in a 1000px viewport.
- Mobile interaction pass at 375px: no horizontal overflow; menu opens and closes, Escape restores focus, and all 11 menu destinations are present. Email label and required validation checked. This pass preceded the final countdown relocation and removal of the redundant artwork overlay.
- Internal destinations: all 27 unique homepage destinations returned HTTP 200 in the local export preview.
- Final tablet screenshots and the optional Lighthouse pass could not be completed: the browser screenshot operation stalled and was cancelled. No visual regression baseline exists. Visual regression verdict is INCONCLUSIVE; this does not invalidate the build and functional checks above.
- Signup delivery was not exercised through the static preview server; the existing subscription tests passed. No live email was sent.

Local preview: http://127.0.0.1:3010/

## Trailer and thumbnail follow-up

The trailer uses `https://www.rockstargames.com/videoplayer?id=76orsa95&embed&autoplay=false&locale=en_us`. The announcement banner scrolls to that embedded player.

All 50 existing posts now have an explicit image field and a separate 640px thumbnail under `public/vi/posts/`. The shared post card and newest news feature use those images, so each article keeps its thumbnail across the homepage, news index, and topic pages. The previous repeating three-image CSS cycle was removed. All 50 image files have different SHA-256 digests; their combined size is approximately 1.9 MB. `data/post-thumbnails.json` records each source URL and digest. The screenshots were sourced from Rockstar's public Only in Leonida page and serve as illustrative GTA VI artwork.

Player availability: an initial direct request to the embed URL returned Access Denied, but the final iframe loaded successfully inside the local site (HTTP 200), along with its underlying youtube-nocookie video iframe (HTTP 200). Autoplay remains disabled. The official trailer-page link remains available as a fallback. Video playback itself was not started during verification.

Follow-up validation: production build passed with all content/internal-link checks. Browser checks confirmed six distinct homepage thumbnails, 16 distinct news-index thumbnails, the requested iframe URL with autoplay=false and fullscreen permission, and no horizontal overflow at 375px, 768px, or 1440px. The 50-post asset check confirmed one unique existing thumbnail per post.
