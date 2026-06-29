# gta6download.store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a statically-generated Next.js + MDX SEO hub for GTA 6 download-related search terms, with an AI-assisted RSS news pipeline (drafts only), an honest Download Status hub, affiliate + display-ad monetization, content silos, a download-page family (honest framing for no-product terms), expanded JSON-LD schema, and a topic-queue mode for programmatic page drafting. Tasks 1–13 are v1; Tasks 14–19 are the v2 expansion.

**Architecture:** A Next.js App Router site renders MDX content files at build time (static = fast = good Core Web Vitals). A separate Node script (`scripts/ingest.ts`) fetches gaming RSS feeds, filters for genuine GTA 6 items, drafts original rewrites via the Claude API, and writes **drafts only** into `content/drafts/`. Nothing publishes without a human moving a draft to `content/posts/` and committing. Monetization (affiliate links, ad slots, email capture) is centralized in config files so a single edit updates every page.

**Tech Stack:** Next.js (App Router) 15+, TypeScript, Tailwind CSS, `next-mdx-remote` for MDX, `gray-matter` for frontmatter, `rss-parser` for feeds, `@anthropic-ai/sdk` for drafting, `zod` for frontmatter validation, Vitest for tests. Deployed on Vercel.

## Global Constraints

- **Stack:** Next.js App Router + TypeScript + Tailwind CSS; content as MDX files in the repo; deploy on Vercel. (spec: Decisions table)
- **No database.** Content is files only. (spec: Architecture)
- **Pipeline produces drafts only** — `scripts/ingest.ts` writes to `content/drafts/`, never `content/posts/`; never auto-publishes. (spec: Content Pipeline)
- **Claude model:** `claude-opus-4-8` for quality drafts; config switch to `claude-haiku-4-5` for bulk. Use `client.messages.create({ model, max_tokens, messages })`; parse `response.content` by filtering `block.type === "text"`. `max_tokens` ~16000 (non-streaming). (spec: Model)
- **Affiliate links** are centralized in `affiliates.config.ts`; every Buy/Pre-order link renders with `rel="sponsored nofollow"` and an FTC disclosure nearby. (spec: Monetization)
- **Frontmatter schema (every post):** `title, slug, description, date, updated, tags, sources[], status, author, image`. (spec: Frontmatter schema)
- **Tests mock all external calls** (RSS, Claude) — no live network in CI. (spec: Testing)
- **Honest download intent:** the `/gta-6-download` hub states current availability truthfully (pre-order / not-yet-downloadable), with official affiliate links, countdown, and email signup. (spec: Strategic Context)

---

### Task 1: Project scaffold — Next.js + TypeScript + Tailwind + tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`, `vitest.config.ts`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a buildable Next.js app. `npm run build` succeeds; `npm run test` runs Vitest; `npm run ingest` is wired (script added in Task 9). Tailwind classes work in components.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "gta6download",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "ingest": "tsx scripts/ingest.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.70.0",
    "gray-matter": "^4.0.3",
    "next": "^15.2.0",
    "next-mdx-remote": "^5.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "rss-parser": "^3.13.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.2",
    "typescript": "^5.7.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create config files**

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;
```

`tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.mdx"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
```

`postcss.config.mjs`:
```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: { "@": new URL(".", import.meta.url).pathname },
  },
});
```

`.gitignore`:
```
node_modules
.next
out
.env
.env.local
*.tsbuildinfo
next-env.d.ts
content/.seen.json
```

`.env.example`:
```
ANTHROPIC_API_KEY=
# Optional: override the drafting model (default claude-opus-4-8)
DRAFT_MODEL=claude-opus-4-8
```

- [ ] **Step 4: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
}

body {
  color: var(--foreground);
  background: var(--background);
}
```

- [ ] **Step 5: Create `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GTA 6 Download Hub", template: "%s | GTA6Download" },
  description: "GTA 6 download status, release date, news, and where to buy.",
  metadataBase: new URL("https://gta6download.store"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Create placeholder `app/page.tsx`**

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">GTA 6 Download Hub</h1>
      <p className="mt-4">Scaffold OK.</p>
    </main>
  );
}
```

- [ ] **Step 7: Install and verify the build**

Run: `npm install && npm run build`
Expected: build completes without errors; `.next/` is produced; the `/` route is listed as static.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js + TypeScript + Tailwind + Vitest"
```

---

### Task 2: Site configuration constants (`site.config.ts`)

**Files:**
- Create: `site.config.ts`
- Test: `site.config.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `export const siteConfig` with fields `name: string`, `url: string`, `description: string`, `author: string`, `releaseDate: string` (ISO 8601 — GTA 6 target launch, used by the countdown), `downloadStatus: "preorder" | "available" | "not_yet"`. Consumed by metadata, the countdown, the Download Status hub, and JSON-LD.

- [ ] **Step 1: Write the failing test**

`site.config.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { siteConfig } from "./site.config";

describe("siteConfig", () => {
  it("exposes the canonical site URL with no trailing slash", () => {
    expect(siteConfig.url).toBe("https://gta6download.store");
  });

  it("has a parseable ISO release date", () => {
    expect(Number.isNaN(Date.parse(siteConfig.releaseDate))).toBe(false);
  });

  it("uses a known download status value", () => {
    expect(["preorder", "available", "not_yet"]).toContain(siteConfig.downloadStatus);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- site.config.test.ts`
Expected: FAIL — cannot resolve `./site.config`.

- [ ] **Step 3: Write `site.config.ts`**

```ts
export type DownloadStatus = "preorder" | "available" | "not_yet";

export interface SiteConfig {
  name: string;
  url: string;
  description: string;
  author: string;
  /** ISO 8601 target launch date for the countdown. Update when Rockstar confirms. */
  releaseDate: string;
  downloadStatus: DownloadStatus;
}

export const siteConfig: SiteConfig = {
  name: "GTA6Download",
  url: "https://gta6download.store",
  description: "GTA 6 download status, release date, news, and where to buy.",
  author: "GTA6Download Editorial",
  releaseDate: "2026-11-19T00:00:00.000Z",
  downloadStatus: "preorder",
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- site.config.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add site.config.ts site.config.test.ts
git commit -m "feat: add site configuration constants"
```

---

### Task 3: Frontmatter schema + content loader (`lib/posts.ts`)

**Files:**
- Create: `lib/posts.ts`
- Test: `lib/posts.test.ts`
- Create: `content/posts/.gitkeep`, `content/drafts/.gitkeep`

**Interfaces:**
- Consumes: nothing (pure logic + filesystem read).
- Produces:
  - `export const frontmatterSchema` (a Zod schema) with exactly: `title: string`, `slug: string`, `description: string`, `date: string`, `updated: string` (optional, defaults to `date`), `tags: string[]` (defaults `[]`), `sources: string[]` (min 1 url), `status: "draft" | "published"` (defaults `"published"`), `author: string`, `image: string` (optional).
  - `export type PostFrontmatter = z.infer<typeof frontmatterSchema>`.
  - `export function parsePost(raw: string): { frontmatter: PostFrontmatter; content: string }` — parses one MDX file's raw string via gray-matter, validates with Zod, throws a descriptive `Error` on invalid frontmatter.
  - `export function getAllPosts(): Array<{ frontmatter: PostFrontmatter; content: string; slug: string }>` — reads every `.mdx` in `content/posts/`, sorted by `date` descending.
  - `export function getPostBySlug(slug: string): { frontmatter: PostFrontmatter; content: string } | null`.

- [ ] **Step 1: Create content directories**

```bash
mkdir -p content/posts content/drafts
touch content/posts/.gitkeep content/drafts/.gitkeep
```

- [ ] **Step 2: Write the failing test**

`lib/posts.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parsePost, frontmatterSchema } from "./posts";

const VALID = `---
title: "Test Post"
slug: "test-post"
description: "A test."
date: "2026-06-01"
tags: ["gta6"]
sources: ["https://example.com/a"]
author: "Editor"
---
Body text here.`;

describe("parsePost", () => {
  it("parses valid frontmatter and returns the body", () => {
    const { frontmatter, content } = parsePost(VALID);
    expect(frontmatter.title).toBe("Test Post");
    expect(frontmatter.sources).toEqual(["https://example.com/a"]);
    expect(frontmatter.status).toBe("published"); // default
    expect(content.trim()).toBe("Body text here.");
  });

  it("defaults `updated` to `date` when omitted", () => {
    const { frontmatter } = parsePost(VALID);
    expect(frontmatter.updated).toBe("2026-06-01");
  });

  it("throws when sources are missing", () => {
    const bad = VALID.replace('sources: ["https://example.com/a"]', "sources: []");
    expect(() => parsePost(bad)).toThrow(/sources/i);
  });

  it("throws when a required field is missing", () => {
    const bad = VALID.replace('title: "Test Post"\n', "");
    expect(() => parsePost(bad)).toThrow();
  });
});

describe("frontmatterSchema", () => {
  it("rejects unknown status values", () => {
    const r = frontmatterSchema.safeParse({
      title: "x", slug: "x", description: "x", date: "2026-01-01",
      sources: ["https://x.com"], author: "x", status: "bogus",
    });
    expect(r.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- lib/posts.test.ts`
Expected: FAIL — cannot resolve `./posts`.

- [ ] **Step 4: Write `lib/posts.ts`**

```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

export const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    date: z.string().min(1),
    updated: z.string().optional(),
    tags: z.array(z.string()).default([]),
    sources: z.array(z.string().url()).min(1, "at least one source URL is required"),
    status: z.enum(["draft", "published"]).default("published"),
    author: z.string().min(1),
    image: z.string().optional(),
  })
  .transform((fm) => ({ ...fm, updated: fm.updated ?? fm.date }));

export type PostFrontmatter = z.infer<typeof frontmatterSchema>;

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export function parsePost(raw: string): { frontmatter: PostFrontmatter; content: string } {
  const { data, content } = matter(raw);
  const result = frontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid frontmatter: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
  return { frontmatter: result.data, content };
}

export function getAllPosts(): Array<{ frontmatter: PostFrontmatter; content: string; slug: string }> {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { frontmatter, content } = parsePost(raw);
    return { frontmatter, content, slug: frontmatter.slug };
  });
  return posts.sort((a, b) => Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date));
}

export function getPostBySlug(slug: string): { frontmatter: PostFrontmatter; content: string } | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- lib/posts.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/posts.ts lib/posts.test.ts content/posts/.gitkeep content/drafts/.gitkeep
git commit -m "feat: add frontmatter schema and MDX content loader"
```

---

### Task 4: Affiliate config + disclosure + buy-button (`affiliates.config.ts`, `components/`)

**Files:**
- Create: `affiliates.config.ts`
- Create: `components/AffiliateLink.tsx`
- Create: `components/AffiliateDisclosure.tsx`
- Test: `affiliates.config.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export interface AffiliateStore { id: string; name: string; platform: string; url: string; edition?: string; price?: string }`
  - `export const affiliateStores: AffiliateStore[]` — official stores (Steam, Epic, Rockstar, PlayStation Store, Xbox).
  - `export function getStore(id: string): AffiliateStore | undefined`
  - `<AffiliateLink store={AffiliateStore}>label</AffiliateLink>` — renders `<a rel="sponsored nofollow" target="_blank">` to `store.url`.
  - `<AffiliateDisclosure />` — renders the FTC disclosure text.

- [ ] **Step 1: Write the failing test**

`affiliates.config.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { affiliateStores, getStore } from "./affiliates.config";

describe("affiliateStores", () => {
  it("every store has a non-empty https url", () => {
    expect(affiliateStores.length).toBeGreaterThan(0);
    for (const s of affiliateStores) {
      expect(s.url.startsWith("https://")).toBe(true);
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
    }
  });

  it("store ids are unique", () => {
    const ids = affiliateStores.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getStore resolves a known id and returns undefined for unknown", () => {
    expect(getStore(affiliateStores[0].id)?.id).toBe(affiliateStores[0].id);
    expect(getStore("does-not-exist")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- affiliates.config.test.ts`
Expected: FAIL — cannot resolve `./affiliates.config`.

- [ ] **Step 3: Write `affiliates.config.ts`**

```ts
export interface AffiliateStore {
  id: string;
  name: string;
  platform: string;
  /** Official store URL. Replace with your affiliate/referral URL once approved. */
  url: string;
  edition?: string;
  price?: string;
}

export const affiliateStores: AffiliateStore[] = [
  { id: "rockstar", name: "Rockstar Store", platform: "PC", url: "https://www.rockstargames.com/" },
  { id: "steam", name: "Steam", platform: "PC", url: "https://store.steampowered.com/" },
  { id: "epic", name: "Epic Games Store", platform: "PC", url: "https://store.epicgames.com/" },
  { id: "playstation", name: "PlayStation Store", platform: "PS5", url: "https://store.playstation.com/" },
  { id: "xbox", name: "Xbox Store", platform: "Xbox Series X|S", url: "https://www.xbox.com/games/store" },
];

export function getStore(id: string): AffiliateStore | undefined {
  return affiliateStores.find((s) => s.id === id);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- affiliates.config.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `components/AffiliateLink.tsx`**

```tsx
import type { AffiliateStore } from "@/affiliates.config";

export function AffiliateLink({
  store,
  children,
  className = "",
}: {
  store: AffiliateStore;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={store.url}
      rel="sponsored nofollow"
      target="_blank"
      className={`inline-block rounded-md bg-amber-500 px-4 py-2 font-semibold text-black hover:bg-amber-400 ${className}`}
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 6: Write `components/AffiliateDisclosure.tsx`**

```tsx
export function AffiliateDisclosure() {
  return (
    <p className="my-4 text-xs text-neutral-500">
      Disclosure: Some links on this page are affiliate links. If you buy through them we may
      earn a commission at no extra cost to you. We only link to official stores.
    </p>
  );
}
```

- [ ] **Step 7: Run the full test suite and the build**

Run: `npm test && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 8: Commit**

```bash
git add affiliates.config.ts affiliates.config.test.ts components/AffiliateLink.tsx components/AffiliateDisclosure.tsx
git commit -m "feat: add affiliate config, disclosure, and buy-button components"
```

---

### Task 5: Countdown + AdSlot + email signup components

**Files:**
- Create: `components/Countdown.tsx`
- Create: `components/AdSlot.tsx`
- Create: `components/EmailSignup.tsx`
- Create: `lib/countdown.ts`
- Test: `lib/countdown.test.ts`

**Interfaces:**
- Consumes: `siteConfig.releaseDate` (Task 2).
- Produces:
  - `export function timeUntil(target: string, now?: Date): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean }` (pure, testable).
  - `<Countdown target={string} />` — a client component using `timeUntil`.
  - `<AdSlot id={string} />` — placeholder ad container (inert until AdSense script added).
  - `<EmailSignup />` — client form posting to `/api/subscribe` (route added in Task 6).

- [ ] **Step 1: Write the failing test**

`lib/countdown.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { timeUntil } from "./countdown";

describe("timeUntil", () => {
  it("computes a positive remaining span before the target", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const r = timeUntil("2026-01-03T01:02:03.000Z", now);
    expect(r.isPast).toBe(false);
    expect(r.days).toBe(2);
    expect(r.hours).toBe(1);
    expect(r.minutes).toBe(2);
    expect(r.seconds).toBe(3);
  });

  it("flags a target in the past", () => {
    const now = new Date("2026-02-01T00:00:00.000Z");
    const r = timeUntil("2026-01-01T00:00:00.000Z", now);
    expect(r.isPast).toBe(true);
    expect(r.days).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/countdown.test.ts`
Expected: FAIL — cannot resolve `./countdown`.

- [ ] **Step 3: Write `lib/countdown.ts`**

```ts
export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function timeUntil(target: string, now: Date = new Date()): Remaining {
  const diffMs = Date.parse(target) - now.getTime();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/countdown.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write `components/Countdown.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { timeUntil, type Remaining } from "@/lib/countdown";

export function Countdown({ target }: { target: string }) {
  const [r, setR] = useState<Remaining>(() => timeUntil(target));

  useEffect(() => {
    const id = setInterval(() => setR(timeUntil(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (r.isPast) {
    return <p className="text-lg font-semibold">The wait is over — check the status above.</p>;
  }

  const cell = (n: number, label: string) => (
    <div className="flex flex-col items-center rounded-md bg-neutral-900 px-4 py-2 text-white">
      <span className="text-2xl font-bold tabular-nums">{n}</span>
      <span className="text-xs uppercase">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-3" aria-label="Time until GTA 6 release">
      {cell(r.days, "days")}
      {cell(r.hours, "hrs")}
      {cell(r.minutes, "min")}
      {cell(r.seconds, "sec")}
    </div>
  );
}
```

- [ ] **Step 6: Write `components/AdSlot.tsx`**

```tsx
/**
 * Placeholder ad container. Inert until an AdSense (or other) script is added.
 * Once approved, render the ad markup here keyed by `id`.
 */
export function AdSlot({ id }: { id: string }) {
  return (
    <div
      data-ad-slot={id}
      className="my-6 flex min-h-[90px] items-center justify-center rounded border border-dashed border-neutral-300 text-xs text-neutral-400"
    >
      Advertisement
    </div>
  );
}
```

- [ ] **Step 7: Write `components/EmailSignup.tsx`**

```tsx
"use client";

import { useState } from "react";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="font-semibold text-green-700">Thanks — we’ll email you when it’s downloadable.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="flex-1 rounded-md border border-neutral-300 px-3 py-2"
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-md bg-neutral-900 px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {state === "loading" ? "…" : "Notify me"}
      </button>
      {state === "error" && <span className="text-sm text-red-600">Something went wrong.</span>}
    </form>
  );
}
```

- [ ] **Step 8: Run the build**

Run: `npm run build`
Expected: build succeeds (note: `/api/subscribe` not yet present — `EmailSignup` references it only at runtime via fetch, so build is unaffected).

- [ ] **Step 9: Commit**

```bash
git add components/Countdown.tsx components/AdSlot.tsx components/EmailSignup.tsx lib/countdown.ts lib/countdown.test.ts
git commit -m "feat: add countdown, ad slot, and email signup components"
```

---

### Task 6: Email subscribe API route (`app/api/subscribe/route.ts`)

**Files:**
- Create: `app/api/subscribe/route.ts`
- Create: `lib/subscribe.ts`
- Test: `lib/subscribe.test.ts`

**Interfaces:**
- Consumes: nothing (provider endpoint stubbed via env).
- Produces:
  - `export function validateEmail(input: unknown): string | null` — returns a normalized email or `null` if invalid.
  - `POST /api/subscribe` — accepts `{ email }`, validates, forwards to `process.env.EMAIL_PROVIDER_ENDPOINT` if set (otherwise logs and accepts), returns `{ ok: true }` (200) or `{ ok: false }` (400 invalid / 502 provider error).

- [ ] **Step 1: Write the failing test**

`lib/subscribe.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { validateEmail } from "./subscribe";

describe("validateEmail", () => {
  it("accepts and lowercases a valid email", () => {
    expect(validateEmail("User@Example.COM")).toBe("user@example.com");
  });
  it("rejects malformed input", () => {
    expect(validateEmail("not-an-email")).toBeNull();
    expect(validateEmail("")).toBeNull();
    expect(validateEmail(42)).toBeNull();
    expect(validateEmail(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/subscribe.test.ts`
Expected: FAIL — cannot resolve `./subscribe`.

- [ ] **Step 3: Write `lib/subscribe.ts`**

```ts
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const normalized = input.trim().toLowerCase();
  return EMAIL_RE.test(normalized) ? normalized : null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/subscribe.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write `app/api/subscribe/route.ts`**

```ts
import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/subscribe";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = validateEmail((body as { email?: unknown })?.email);
  if (!email) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const endpoint = process.env.EMAIL_PROVIDER_ENDPOINT;
  if (!endpoint) {
    // No provider configured yet — accept and log so the form works in dev.
    console.log(`[subscribe] (no provider configured) ${email}`);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
```

- [ ] **Step 6: Add `EMAIL_PROVIDER_ENDPOINT` to `.env.example`**

Append to `.env.example`:
```
# Optional: POST endpoint of your email provider (ConvertKit/Buttondown form action)
EMAIL_PROVIDER_ENDPOINT=
```

- [ ] **Step 7: Run the build**

Run: `npm run build`
Expected: build succeeds; `/api/subscribe` listed as a route (dynamic / function).

- [ ] **Step 8: Commit**

```bash
git add app/api/subscribe/route.ts lib/subscribe.ts lib/subscribe.test.ts .env.example
git commit -m "feat: add email subscribe API route with validation"
```

---

### Task 7: Shared layout chrome + SEO/JSON-LD helpers (`components/`, `lib/seo.ts`)

**Files:**
- Create: `components/SiteHeader.tsx`
- Create: `components/SiteFooter.tsx`
- Create: `lib/seo.ts`
- Test: `lib/seo.test.ts`
- Modify: `app/layout.tsx` (wrap children with header/footer)

**Interfaces:**
- Consumes: `siteConfig` (Task 2), `getAllPosts` / `PostFrontmatter` (Task 3).
- Produces:
  - `export function organizationJsonLd(): object`
  - `export function articleJsonLd(fm: PostFrontmatter): object` — `NewsArticle` schema.
  - `export function faqJsonLd(items: Array<{ question: string; answer: string }>): object` — `FAQPage`.
  - `export function breadcrumbJsonLd(crumbs: Array<{ name: string; url: string }>): object`.
  - `<SiteHeader />`, `<SiteFooter />` — nav + legal links.

- [ ] **Step 1: Write the failing test**

`lib/seo.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { organizationJsonLd, articleJsonLd, faqJsonLd, breadcrumbJsonLd } from "./seo";

describe("JSON-LD helpers", () => {
  it("organization has the right @type and url", () => {
    const ld = organizationJsonLd() as Record<string, unknown>;
    expect(ld["@type"]).toBe("Organization");
    expect(ld.url).toBe("https://gta6download.store");
  });

  it("article produces a NewsArticle with headline and dates", () => {
    const ld = articleJsonLd({
      title: "T", slug: "s", description: "d", date: "2026-06-01", updated: "2026-06-02",
      tags: [], sources: ["https://x.com"], status: "published", author: "A",
    }) as Record<string, unknown>;
    expect(ld["@type"]).toBe("NewsArticle");
    expect(ld.headline).toBe("T");
    expect(ld.dateModified).toBe("2026-06-02");
  });

  it("faq produces a FAQPage with mainEntity entries", () => {
    const ld = faqJsonLd([{ question: "Q?", answer: "A." }]) as Record<string, any>;
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity[0]["@type"]).toBe("Question");
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("A.");
  });

  it("breadcrumb lists items in order", () => {
    const ld = breadcrumbJsonLd([
      { name: "Home", url: "https://gta6download.store" },
      { name: "News", url: "https://gta6download.store/news" },
    ]) as Record<string, any>;
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement[1].position).toBe(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/seo.test.ts`
Expected: FAIL — cannot resolve `./seo`.

- [ ] **Step 3: Write `lib/seo.ts`**

```ts
import { siteConfig } from "@/site.config";
import type { PostFrontmatter } from "@/lib/posts";

export function organizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function articleJsonLd(fm: PostFrontmatter): object {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: fm.title,
    description: fm.description,
    datePublished: fm.date,
    dateModified: fm.updated ?? fm.date,
    author: { "@type": "Organization", name: fm.author },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: `${siteConfig.url}/news/${fm.slug}`,
    ...(fm.image ? { image: fm.image } : {}),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function breadcrumbJsonLd(crumbs: Array<{ name: string; url: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/seo.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write `components/SiteHeader.tsx`**

```tsx
import Link from "next/link";

const NAV = [
  { href: "/gta-6-download", label: "Download Status" },
  { href: "/news", label: "News" },
  { href: "/where-to-buy", label: "Where to Buy" },
  { href: "/gta-6-release-date", label: "Release Date" },
  { href: "/gta-6-system-requirements", label: "System Requirements" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          GTA6Download
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:underline">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 6: Write `components/SiteFooter.tsx`**

```tsx
import Link from "next/link";

const LEGAL = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-500">
        <nav className="flex flex-wrap gap-4">
          {LEGAL.map((l) => (
            <Link key={l.href} href={l.href} className="hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="mt-4">
          GTA6Download is an unofficial fan resource. Grand Theft Auto and GTA are trademarks of
          Take-Two Interactive / Rockstar Games. We are not affiliated with Rockstar Games.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Wire header/footer into `app/layout.tsx`**

Replace the `<body>` contents in `app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { default: "GTA 6 Download Hub", template: "%s | GTA6Download" },
  description: "GTA 6 download status, release date, news, and where to buy.",
  metadataBase: new URL("https://gta6download.store"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Run the build**

Run: `npm test && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 9: Commit**

```bash
git add lib/seo.ts lib/seo.test.ts components/SiteHeader.tsx components/SiteFooter.tsx app/layout.tsx
git commit -m "feat: add layout chrome and JSON-LD SEO helpers"
```

---

### Task 8: Core pages — Download Status hub, Where to Buy, evergreen pages, FAQ, legal

**Files:**
- Create: `app/page.tsx` (replace placeholder — homepage)
- Create: `app/gta-6-download/page.tsx`
- Create: `app/where-to-buy/page.tsx`
- Create: `app/gta-6-release-date/page.tsx`
- Create: `app/gta-6-system-requirements/page.tsx`
- Create: `app/faq/page.tsx`
- Create: `app/about/page.tsx`, `app/contact/page.tsx`, `app/privacy/page.tsx`, `app/disclaimer/page.tsx`
- Create: `lib/faq.ts`

**Interfaces:**
- Consumes: `siteConfig`, `affiliateStores` + `AffiliateLink` + `AffiliateDisclosure`, `Countdown`, `EmailSignup`, `AdSlot`, `getAllPosts`, `faqJsonLd`, `breadcrumbJsonLd`.
- Produces: static routes for every page in the spec's Site Structure table. `lib/faq.ts` exports `export const faqItems: Array<{ question: string; answer: string }>`.

- [ ] **Step 1: Write `lib/faq.ts`**

```ts
export const faqItems: Array<{ question: string; answer: string }> = [
  {
    question: "Is GTA 6 out yet?",
    answer:
      "No. GTA 6 has been announced by Rockstar Games but is not yet released. Check our Download Status page for the current, up-to-date availability.",
  },
  {
    question: "Can I download GTA 6 right now?",
    answer:
      "Not yet. The game is in the pre-release/pre-order phase. Anyone offering a 'GTA 6 download' today is not legitimate. We link only to official stores.",
  },
  {
    question: "Is GTA 6 free?",
    answer:
      "No. GTA 6 is a paid title. When it launches you will buy it from official stores such as the Rockstar Store, Steam, Epic, PlayStation Store, or Xbox.",
  },
  {
    question: "Where can I pre-order GTA 6?",
    answer:
      "See our Where to Buy page for official pre-order links per platform. We only list official storefronts.",
  },
];
```

- [ ] **Step 2: Write `app/gta-6-download/page.tsx` (the money page)**

```tsx
import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { affiliateStores } from "@/affiliates.config";
import { AffiliateLink } from "@/components/AffiliateLink";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { Countdown } from "@/components/Countdown";
import { EmailSignup } from "@/components/EmailSignup";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "GTA 6 Download — Availability Status",
  description:
    "Can you download GTA 6 yet? Honest, up-to-date GTA 6 download status, official pre-order links, and a release countdown.",
  alternates: { canonical: "/gta-6-download" },
};

const STATUS_TEXT: Record<typeof siteConfig.downloadStatus, string> = {
  not_yet: "GTA 6 is not yet available to download.",
  preorder: "GTA 6 is not downloadable yet — but you can pre-order it now from official stores.",
  available: "GTA 6 is available now. Buy it from an official store below.",
};

export default function DownloadStatusPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: siteConfig.url },
              { name: "GTA 6 Download", url: `${siteConfig.url}/gta-6-download` },
            ])
          ),
        }}
      />
      <h1 className="text-3xl font-bold">GTA 6 Download Status</h1>

      <div className="my-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
        <p className="text-lg font-semibold">{STATUS_TEXT[siteConfig.downloadStatus]}</p>
        <p className="mt-2 text-sm text-neutral-700">
          Beware of any site offering a “free GTA 6 download” right now — those are scams or
          malware. The only safe way to get the game is through the official stores listed below.
        </p>
      </div>

      <section className="my-8">
        <h2 className="mb-2 text-xl font-semibold">Release countdown</h2>
        <Countdown target={siteConfig.releaseDate} />
      </section>

      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Get it from an official store</h2>
        <AffiliateDisclosure />
        <div className="flex flex-wrap gap-3">
          {affiliateStores.map((store) => (
            <AffiliateLink key={store.id} store={store}>
              {store.name} ({store.platform})
            </AffiliateLink>
          ))}
        </div>
      </section>

      <section className="my-8 rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-2 text-xl font-semibold">Get notified when it’s downloadable</h2>
        <p className="mb-3 text-sm text-neutral-700">
          We’ll email you the moment GTA 6 is officially available to download. No spam.
        </p>
        <EmailSignup />
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Write `app/where-to-buy/page.tsx`**

```tsx
import type { Metadata } from "next";
import { affiliateStores } from "@/affiliates.config";
import { AffiliateLink } from "@/components/AffiliateLink";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";

export const metadata: Metadata = {
  title: "Where to Buy GTA 6 — Official Stores by Platform",
  description: "Official GTA 6 storefronts for PC, PlayStation 5, and Xbox Series X|S.",
  alternates: { canonical: "/where-to-buy" },
};

export default function WhereToBuyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Where to Buy GTA 6</h1>
      <p className="mt-2 text-neutral-700">
        We list only official storefronts. Prices and editions appear here once Rockstar confirms them.
      </p>
      <AffiliateDisclosure />
      <ul className="mt-4 space-y-4">
        {affiliateStores.map((store) => (
          <li key={store.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-4">
            <div>
              <p className="font-semibold">{store.name}</p>
              <p className="text-sm text-neutral-500">{store.platform}</p>
            </div>
            <AffiliateLink store={store}>Visit store</AffiliateLink>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 4: Write the two evergreen pages**

`app/gta-6-release-date/page.tsx`:
```tsx
import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { Countdown } from "@/components/Countdown";

export const metadata: Metadata = {
  title: "GTA 6 Release Date — Latest Confirmed Information",
  description: "When is GTA 6 coming out? The latest on the GTA 6 release date with a live countdown.",
  alternates: { canonical: "/gta-6-release-date" },
};

export default function ReleaseDatePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">GTA 6 Release Date</h1>
      <p className="mt-2 text-neutral-700">
        This page tracks the latest confirmed GTA 6 release information from Rockstar Games. We update
        it whenever there is official news.
      </p>
      <div className="my-6">
        <Countdown target={siteConfig.releaseDate} />
      </div>
      <p className="text-sm text-neutral-500">
        Target window shown above reflects the most recent official guidance and is updated as
        Rockstar confirms specifics.
      </p>
    </main>
  );
}
```

`app/gta-6-system-requirements/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GTA 6 System Requirements (PC) — Minimum & Recommended",
  description: "Expected GTA 6 PC system requirements: minimum and recommended CPU, GPU, RAM, and storage.",
  alternates: { canonical: "/gta-6-system-requirements" },
};

export default function SystemRequirementsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">GTA 6 System Requirements</h1>
      <p className="mt-2 text-neutral-700">
        Official PC system requirements have not been published yet. This page will list the exact
        minimum and recommended specs the moment Rockstar confirms them.
      </p>
      <h2 className="mt-6 text-xl font-semibold">Consoles</h2>
      <p className="mt-2 text-neutral-700">
        GTA 6 is confirmed for PlayStation 5 and Xbox Series X|S. No additional hardware is required
        beyond those consoles.
      </p>
    </main>
  );
}
```

- [ ] **Step 5: Write `app/faq/page.tsx`**

```tsx
import type { Metadata } from "next";
import { faqItems } from "@/lib/faq";
import { faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "GTA 6 FAQ — Is It Out, Can I Download It, Is It Free?",
  description: "Answers to the most common GTA 6 questions: release status, download availability, and price.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqItems)) }}
      />
      <h1 className="text-3xl font-bold">GTA 6 FAQ</h1>
      <dl className="mt-6 space-y-6">
        {faqItems.map((it) => (
          <div key={it.question}>
            <dt className="font-semibold">{it.question}</dt>
            <dd className="mt-1 text-neutral-700">{it.answer}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
```

- [ ] **Step 6: Write the four legal pages**

Each is a simple static page. `app/about/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">About GTA6Download</h1>
      <p className="mt-4 text-neutral-700">
        GTA6Download is an independent fan resource tracking GTA 6 news, the release date, system
        requirements, and where to buy the game from official stores. We are not affiliated with
        Rockstar Games or Take-Two Interactive.
      </p>
    </main>
  );
}
```

`app/contact/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-4 text-neutral-700">
        Questions or corrections? Email us at{" "}
        <a className="underline" href="mailto:hello@gta6download.store">hello@gta6download.store</a>.
      </p>
    </main>
  );
}
```

`app/privacy/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-neutral-700">
        We collect only the email address you voluntarily submit for release notifications. We do not
        sell your data. Third-party ad and analytics partners may set cookies; see their policies for
        details. You can request deletion of your email at any time via the Contact page.
      </p>
    </main>
  );
}
```

`app/disclaimer/page.tsx`:
```tsx
import type { Metadata } from "next";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";

export const metadata: Metadata = { title: "Disclaimer", alternates: { canonical: "/disclaimer" } };

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Disclaimer</h1>
      <p className="mt-4 text-neutral-700">
        GTA6Download is unofficial and not affiliated with Rockstar Games or Take-Two Interactive.
        All trademarks belong to their respective owners. Information is provided as-is; we link only
        to official stores and never host or distribute game files.
      </p>
      <AffiliateDisclosure />
    </main>
  );
}
```

- [ ] **Step 7: Replace `app/page.tsx` with the homepage**

```tsx
import Link from "next/link";
import { siteConfig } from "@/site.config";
import { Countdown } from "@/components/Countdown";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 9);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-lg border border-amber-300 bg-amber-50 p-6">
        <h1 className="text-3xl font-bold">GTA 6 Download &amp; Release Hub</h1>
        <p className="mt-2 text-neutral-700">
          GTA 6 is not downloadable yet. Track the official status, count down to launch, and get
          notified the moment it’s available.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Countdown target={siteConfig.releaseDate} />
          <Link
            href="/gta-6-download"
            className="rounded-md bg-neutral-900 px-4 py-2 font-semibold text-white"
          >
            Download status →
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold">Latest GTA 6 News</h2>
        {posts.length === 0 ? (
          <p className="text-neutral-500">No articles published yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug} className="rounded-md border border-neutral-200 p-4">
                <Link href={`/news/${p.slug}`} className="font-semibold hover:underline">
                  {p.frontmatter.title}
                </Link>
                <p className="mt-1 text-sm text-neutral-500">{p.frontmatter.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 8: Run the build**

Run: `npm run build`
Expected: build succeeds; all routes (`/`, `/gta-6-download`, `/where-to-buy`, `/gta-6-release-date`, `/gta-6-system-requirements`, `/faq`, `/about`, `/contact`, `/privacy`, `/disclaimer`) appear as static.

- [ ] **Step 9: Commit**

```bash
git add app lib/faq.ts
git commit -m "feat: add download status hub, where-to-buy, evergreen, FAQ, and legal pages"
```

---

### Task 9: News index + article pages (MDX rendering)

**Files:**
- Create: `app/news/page.tsx`
- Create: `app/news/[slug]/page.tsx`
- Create: `content/posts/2026-06-15-welcome.mdx` (one seed post so routes render)

**Interfaces:**
- Consumes: `getAllPosts`, `getPostBySlug` (Task 3), `articleJsonLd`, `breadcrumbJsonLd` (Task 7), `AdSlot` (Task 5), `next-mdx-remote/rsc`.
- Produces: `/news` (list) and `/news/[slug]` (article) static routes; `generateStaticParams` enumerates slugs; `generateMetadata` per article.

- [ ] **Step 1: Create a seed post so the route renders**

`content/posts/2026-06-15-welcome.mdx`:
```mdx
---
title: "Welcome to the GTA 6 News Hub"
slug: "welcome"
description: "What this site covers and how we track GTA 6 news, release date, and download status."
date: "2026-06-15"
tags: ["gta6", "meta"]
sources: ["https://www.rockstargames.com/"]
author: "GTA6Download Editorial"
---

This is the GTA 6 news hub. We track official announcements, the release date, system
requirements, and where to buy the game — and we update the download status page the moment
anything changes.

## Our approach

Every article links to its primary source and adds original analysis. We never host game files
and we only point to official stores.
```

- [ ] **Step 2: Write `app/news/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "GTA 6 News",
  description: "The latest GTA 6 news, rumors, and official announcements.",
  alternates: { canonical: "/news" },
};

export default function NewsIndexPage() {
  const posts = getAllPosts();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">GTA 6 News</h1>
      <AdSlot id="news-top" />
      {posts.length === 0 ? (
        <p className="mt-4 text-neutral-500">No articles published yet.</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {posts.map((p) => (
            <li key={p.slug} className="border-b border-neutral-200 pb-4">
              <Link href={`/news/${p.slug}`} className="text-xl font-semibold hover:underline">
                {p.frontmatter.title}
              </Link>
              <p className="mt-1 text-sm text-neutral-500">
                {new Date(p.frontmatter.date).toLocaleDateString()} — {p.frontmatter.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Write `app/news/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/site.config";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { AdSlot } from "@/components/AdSlot";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: { canonical: `/news/${post.frontmatter.slug}` },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  const { frontmatter, content } = post;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(frontmatter)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: siteConfig.url },
              { name: "News", url: `${siteConfig.url}/news` },
              { name: frontmatter.title, url: `${siteConfig.url}/news/${frontmatter.slug}` },
            ])
          ),
        }}
      />
      <article>
        <h1 className="text-3xl font-bold">{frontmatter.title}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          By {frontmatter.author} · {new Date(frontmatter.date).toLocaleDateString()}
        </p>
        <AdSlot id="article-top" />
        <div className="prose mt-6 max-w-none">
          <MDXRemote source={content} />
        </div>
        <section className="mt-10 border-t border-neutral-200 pt-4">
          <h2 className="text-lg font-semibold">Sources</h2>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {frontmatter.sources.map((s) => (
              <li key={s}>
                <a className="underline" href={s} rel="nofollow" target="_blank">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
```

- [ ] **Step 4: Run the build**

Run: `npm run build`
Expected: build succeeds; `/news` static; `/news/welcome` generated via `generateStaticParams`.

- [ ] **Step 5: Commit**

```bash
git add app/news content/posts/2026-06-15-welcome.mdx
git commit -m "feat: add news index and MDX article pages with a seed post"
```

---

### Task 10: sitemap, robots, and outbound RSS feed

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `app/feed.xml/route.ts`

**Interfaces:**
- Consumes: `siteConfig`, `getAllPosts`.
- Produces: `/sitemap.xml`, `/robots.txt`, `/feed.xml` routes.

- [ ] **Step 1: Write `app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";
import { getAllPosts } from "@/lib/posts";

const STATIC_PATHS = [
  "",
  "/gta-6-download",
  "/news",
  "/where-to-buy",
  "/gta-6-release-date",
  "/gta-6-system-requirements",
  "/faq",
  "/about",
  "/contact",
  "/privacy",
  "/disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_PATHS.map((p) => ({
    url: `${siteConfig.url}${p}`,
    lastModified: new Date(),
  }));
  const postEntries = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/news/${post.slug}`,
    lastModified: new Date(post.frontmatter.updated ?? post.frontmatter.date),
  }));
  return [...staticEntries, ...postEntries];
}
```

- [ ] **Step 2: Write `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Write `app/feed.xml/route.ts`**

```ts
import { siteConfig } from "@/site.config";
import { getAllPosts } from "@/lib/posts";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.frontmatter.title)}</title>
      <link>${siteConfig.url}/news/${p.slug}</link>
      <guid>${siteConfig.url}/news/${p.slug}</guid>
      <pubDate>${new Date(p.frontmatter.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.frontmatter.description)}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)} — GTA 6 News</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
```

- [ ] **Step 4: Run the build**

Run: `npm run build`
Expected: build succeeds; `/sitemap.xml`, `/robots.txt`, `/feed.xml` listed as routes.

- [ ] **Step 5: Commit**

```bash
git add app/sitemap.ts app/robots.ts app/feed.xml/route.ts
git commit -m "feat: add sitemap, robots, and outbound RSS feed"
```

---

### Task 11: 404 / error pages

**Files:**
- Create: `app/not-found.tsx`
- Create: `app/error.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: custom 404 and runtime-error boundaries.

- [ ] **Step 1: Write `app/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold">404 — Page not found</h1>
      <p className="mt-4 text-neutral-600">That page doesn’t exist.</p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-white">
        Back to home
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Write `app/error.tsx`**

```tsx
"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-white"
      >
        Try again
      </button>
    </main>
  );
}
```

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/not-found.tsx app/error.tsx
git commit -m "feat: add custom 404 and error pages"
```

---

### Task 12: Content pipeline — feeds config, fetch, filter, draft, writeDraft, ingest

**Files:**
- Create: `scripts/feeds.config.ts`
- Create: `scripts/fetchFeeds.ts`
- Create: `scripts/filter.ts`
- Create: `scripts/draft.ts`
- Create: `scripts/writeDraft.ts`
- Create: `scripts/ingest.ts`
- Test: `scripts/filter.test.ts`
- Test: `scripts/writeDraft.test.ts`
- Test: `scripts/draft.test.ts`

**Interfaces:**
- Consumes: `rss-parser`, `@anthropic-ai/sdk`, `gray-matter` (for serializing).
- Produces:
  - `scripts/feeds.config.ts`: `export const feeds: string[]` (RSS URLs); `export const keywords: string[]` (`["gta 6", "gta vi", "grand theft auto 6", "grand theft auto vi"]`).
  - `scripts/fetchFeeds.ts`: `export interface FeedItem { title: string; link: string; contentSnippet: string; pubDate?: string; sourceFeed: string }`; `export async function fetchAllFeeds(urls: string[], parser?: Parser): Promise<FeedItem[]>` — one bad feed never breaks the run.
  - `scripts/filter.ts`: `export function isRelevant(item: { title: string; contentSnippet: string }, keywords: string[]): boolean`; `export function dedupe(items: FeedItem[], seen: Set<string>): FeedItem[]`.
  - `scripts/draft.ts`: `export interface DraftArticle { title: string; slug: string; description: string; body: string; tags: string[] }`; `export async function draftArticle(item: FeedItem, client: AnthropicLike, model: string): Promise<DraftArticle>` where `AnthropicLike` is `{ messages: { create: (args: any) => Promise<{ content: Array<{ type: string; text?: string }> }> } }` (so tests can inject a fake).
  - `scripts/writeDraft.ts`: `export function toMdx(draft: DraftArticle, item: FeedItem, dateISO: string): string` — serializes frontmatter (`status: draft`) + body via gray-matter; `export function draftFilename(slug: string, dateISO: string): string`.
  - `scripts/ingest.ts`: orchestrates fetch → filter → dedupe → draft → write, updating `content/.seen.json`.

- [ ] **Step 1: Write `scripts/feeds.config.ts`**

```ts
export const feeds: string[] = [
  "https://www.rockstargames.com/newswire.rss",
  "https://feeds.ign.com/ign/games-all",
  "https://www.gamespot.com/feeds/news/",
  "https://www.eurogamer.net/feed",
];

export const keywords: string[] = [
  "gta 6",
  "gta vi",
  "grand theft auto 6",
  "grand theft auto vi",
];
```

- [ ] **Step 2: Write the failing `filter` test**

`scripts/filter.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { isRelevant, dedupe } from "./filter";
import { keywords } from "./feeds.config";

describe("isRelevant", () => {
  it("matches a GTA 6 title case-insensitively", () => {
    expect(isRelevant({ title: "New GTA 6 trailer drops", contentSnippet: "" }, keywords)).toBe(true);
  });
  it("matches keyword in the snippet", () => {
    expect(isRelevant({ title: "Rockstar update", contentSnippet: "details about Grand Theft Auto VI" }, keywords)).toBe(true);
  });
  it("rejects unrelated items", () => {
    expect(isRelevant({ title: "GTA 5 mod news", contentSnippet: "old game" }, keywords)).toBe(false);
  });
});

describe("dedupe", () => {
  it("drops items whose link is already in the seen set", () => {
    const items = [
      { title: "A", link: "https://x.com/a", contentSnippet: "", sourceFeed: "f" },
      { title: "B", link: "https://x.com/b", contentSnippet: "", sourceFeed: "f" },
    ];
    const seen = new Set(["https://x.com/a"]);
    const out = dedupe(items, seen);
    expect(out.map((i) => i.link)).toEqual(["https://x.com/b"]);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test -- scripts/filter.test.ts`
Expected: FAIL — cannot resolve `./filter`.

- [ ] **Step 4: Write `scripts/fetchFeeds.ts` and `scripts/filter.ts`**

`scripts/fetchFeeds.ts`:
```ts
import Parser from "rss-parser";

export interface FeedItem {
  title: string;
  link: string;
  contentSnippet: string;
  pubDate?: string;
  sourceFeed: string;
}

export async function fetchAllFeeds(
  urls: string[],
  parser: Parser = new Parser()
): Promise<FeedItem[]> {
  const all: FeedItem[] = [];
  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url);
      for (const item of feed.items ?? []) {
        if (!item.title || !item.link) continue;
        all.push({
          title: item.title,
          link: item.link,
          contentSnippet: item.contentSnippet ?? "",
          pubDate: item.pubDate,
          sourceFeed: url,
        });
      }
    } catch (err) {
      console.warn(`[ingest] feed failed, skipping: ${url} — ${(err as Error).message}`);
    }
  }
  return all;
}
```

`scripts/filter.ts`:
```ts
import type { FeedItem } from "./fetchFeeds";

export function isRelevant(
  item: { title: string; contentSnippet: string },
  keywords: string[]
): boolean {
  const haystack = `${item.title} ${item.contentSnippet}`.toLowerCase();
  return keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

export function dedupe(items: FeedItem[], seen: Set<string>): FeedItem[] {
  const out: FeedItem[] = [];
  const local = new Set<string>();
  for (const item of items) {
    if (seen.has(item.link) || local.has(item.link)) continue;
    local.add(item.link);
    out.push(item);
  }
  return out;
}
```

- [ ] **Step 5: Run to verify the filter test passes**

Run: `npm test -- scripts/filter.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Write the failing `draft` test (Claude call mocked)**

`scripts/draft.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { draftArticle } from "./draft";

const fakeJson = JSON.stringify({
  title: "GTA 6 Trailer Breakdown",
  slug: "gta-6-trailer-breakdown",
  description: "What the new trailer reveals.",
  body: "Original analysis here.",
  tags: ["gta6", "trailer"],
});

const fakeClient = {
  messages: {
    create: async () => ({ content: [{ type: "text", text: fakeJson }] }),
  },
};

describe("draftArticle", () => {
  it("returns a structured draft parsed from the model's JSON", async () => {
    const item = { title: "New trailer", link: "https://x.com/t", contentSnippet: "trailer", sourceFeed: "f" };
    const draft = await draftArticle(item, fakeClient, "claude-opus-4-8");
    expect(draft.title).toBe("GTA 6 Trailer Breakdown");
    expect(draft.slug).toBe("gta-6-trailer-breakdown");
    expect(draft.tags).toContain("trailer");
  });

  it("throws when the model returns no text block", async () => {
    const badClient = { messages: { create: async () => ({ content: [] }) } };
    const item = { title: "x", link: "https://x.com/x", contentSnippet: "", sourceFeed: "f" };
    await expect(draftArticle(item, badClient, "claude-opus-4-8")).rejects.toThrow();
  });
});
```

- [ ] **Step 7: Run to verify it fails**

Run: `npm test -- scripts/draft.test.ts`
Expected: FAIL — cannot resolve `./draft`.

- [ ] **Step 8: Write `scripts/draft.ts`**

```ts
import type { FeedItem } from "./fetchFeeds";

export interface DraftArticle {
  title: string;
  slug: string;
  description: string;
  body: string;
  tags: string[];
}

export interface AnthropicLike {
  messages: {
    create: (args: unknown) => Promise<{ content: Array<{ type: string; text?: string }> }>;
  };
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

const SYSTEM = `You are an editorial assistant for a GTA 6 news site. Given a source news item,
write an ORIGINAL, rewritten article with your own analysis. Never copy the source text. Always
treat the source as a reference to cite, not text to reproduce. Respond ONLY with a JSON object:
{"title": string, "slug": string, "description": string, "body": string (markdown), "tags": string[]}.`;

export async function draftArticle(
  item: FeedItem,
  client: AnthropicLike,
  model: string
): Promise<DraftArticle> {
  const userPrompt = `Source title: ${item.title}
Source snippet: ${item.contentSnippet}
Source URL: ${item.link}

Write an original GTA 6 news article (300-600 words) with analysis. Output JSON only.`;

  const response = await client.messages.create({
    model,
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content.find((b) => b.type === "text" && b.text)?.text;
  if (!text) {
    throw new Error(`draftArticle: model returned no text block for ${item.link}`);
  }

  let parsed: Partial<DraftArticle>;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`draftArticle: model output was not valid JSON for ${item.link}`);
  }

  return {
    title: parsed.title ?? item.title,
    slug: parsed.slug ? slugify(parsed.slug) : slugify(parsed.title ?? item.title),
    description: parsed.description ?? "",
    body: parsed.body ?? "",
    tags: Array.isArray(parsed.tags) ? parsed.tags : ["gta6"],
  };
}
```

- [ ] **Step 9: Run to verify the draft test passes**

Run: `npm test -- scripts/draft.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 10: Write the failing `writeDraft` test**

`scripts/writeDraft.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import matter from "gray-matter";
import { toMdx, draftFilename } from "./writeDraft";

const draft = {
  title: "GTA 6 News",
  slug: "gta-6-news",
  description: "A summary.",
  body: "Body text.",
  tags: ["gta6"],
};
const item = { title: "src", link: "https://x.com/src", contentSnippet: "", sourceFeed: "f" };

describe("toMdx", () => {
  it("emits frontmatter with status draft, the source URL, and the body", () => {
    const mdx = toMdx(draft, item, "2026-06-20");
    const { data, content } = matter(mdx);
    expect(data.status).toBe("draft");
    expect(data.sources).toEqual(["https://x.com/src"]);
    expect(data.slug).toBe("gta-6-news");
    expect(content.trim()).toBe("Body text.");
  });
});

describe("draftFilename", () => {
  it("prefixes the date", () => {
    expect(draftFilename("gta-6-news", "2026-06-20")).toBe("2026-06-20-gta-6-news.mdx");
  });
});
```

- [ ] **Step 11: Run to verify it fails**

Run: `npm test -- scripts/writeDraft.test.ts`
Expected: FAIL — cannot resolve `./writeDraft`.

- [ ] **Step 12: Write `scripts/writeDraft.ts`**

```ts
import matter from "gray-matter";
import type { DraftArticle } from "./draft";
import type { FeedItem } from "./fetchFeeds";

export function toMdx(draft: DraftArticle, item: FeedItem, dateISO: string): string {
  return matter.stringify(draft.body, {
    title: draft.title,
    slug: draft.slug,
    description: draft.description,
    date: dateISO,
    updated: dateISO,
    tags: draft.tags,
    sources: [item.link],
    status: "draft",
    author: "GTA6Download Editorial",
  });
}

export function draftFilename(slug: string, dateISO: string): string {
  return `${dateISO}-${slug}.mdx`;
}
```

- [ ] **Step 13: Run to verify the writeDraft test passes**

Run: `npm test -- scripts/writeDraft.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 14: Write `scripts/ingest.ts` (orchestrator)**

```ts
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { feeds, keywords } from "./feeds.config";
import { fetchAllFeeds } from "./fetchFeeds";
import { isRelevant, dedupe } from "./filter";
import { draftArticle } from "./draft";
import { toMdx, draftFilename } from "./writeDraft";

const SEEN_PATH = path.join(process.cwd(), "content", ".seen.json");
const DRAFTS_DIR = path.join(process.cwd(), "content", "drafts");

function loadSeen(): Set<string> {
  try {
    return new Set(JSON.parse(fs.readFileSync(SEEN_PATH, "utf8")) as string[]);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>): void {
  fs.mkdirSync(path.dirname(SEEN_PATH), { recursive: true });
  fs.writeFileSync(SEEN_PATH, JSON.stringify([...seen], null, 2));
}

async function main(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[ingest] ANTHROPIC_API_KEY is not set. Aborting.");
    process.exit(1);
  }
  const model = process.env.DRAFT_MODEL ?? "claude-opus-4-8";
  const client = new Anthropic({ apiKey });

  const seen = loadSeen();
  const items = await fetchAllFeeds(feeds);
  const relevant = items.filter((i) => isRelevant(i, keywords));
  const fresh = dedupe(relevant, seen);

  console.log(`[ingest] ${items.length} items, ${relevant.length} relevant, ${fresh.length} new`);
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });

  const dateISO = new Date().toISOString().slice(0, 10);
  let written = 0;

  for (const item of fresh) {
    try {
      const draft = await draftArticle(item, client, model);
      const mdx = toMdx(draft, item, dateISO);
      const file = path.join(DRAFTS_DIR, draftFilename(draft.slug, dateISO));
      fs.writeFileSync(file, mdx);
      seen.add(item.link);
      written++;
      console.log(`[ingest] wrote draft: ${path.basename(file)}`);
    } catch (err) {
      console.warn(`[ingest] draft failed for ${item.link}: ${(err as Error).message}`);
    }
  }

  saveSeen(seen);
  console.log(`[ingest] done — ${written} draft(s) written to content/drafts/. Review before publishing.`);
}

main().catch((err) => {
  console.error("[ingest] fatal:", err);
  process.exit(1);
});
```

- [ ] **Step 15: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 16: Commit**

```bash
git add scripts
git commit -m "feat: add AI-assisted RSS ingest pipeline (drafts only)"
```

---

### Task 13: Build-time content validation guard + README

**Files:**
- Create: `scripts/validate-content.ts`
- Modify: `package.json` (add `prebuild` script)
- Create: `README.md`
- Test: `scripts/validate-content.test.ts`

**Interfaces:**
- Consumes: `parsePost` / `getAllPosts` (Task 3).
- Produces: `export function validateAllPosts(dir?: string): string[]` — returns an array of error strings (empty = valid); a CLI wrapper exits non-zero if any errors. Wired as `prebuild` so a bad post fails the deploy.

- [ ] **Step 1: Write the failing test**

`scripts/validate-content.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { validateAllPosts } from "./validate-content";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "posts-"));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("validateAllPosts", () => {
  it("returns no errors for a valid post", () => {
    fs.writeFileSync(
      path.join(dir, "good.mdx"),
      `---\ntitle: "T"\nslug: "t"\ndescription: "d"\ndate: "2026-01-01"\nsources: ["https://x.com"]\nauthor: "A"\n---\nBody`
    );
    expect(validateAllPosts(dir)).toEqual([]);
  });

  it("reports an error for a post missing sources", () => {
    fs.writeFileSync(
      path.join(dir, "bad.mdx"),
      `---\ntitle: "T"\nslug: "t"\ndescription: "d"\ndate: "2026-01-01"\nsources: []\nauthor: "A"\n---\nBody`
    );
    const errors = validateAllPosts(dir);
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/bad\.mdx/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- scripts/validate-content.test.ts`
Expected: FAIL — cannot resolve `./validate-content`.

- [ ] **Step 3: Write `scripts/validate-content.ts`**

```ts
import fs from "node:fs";
import path from "node:path";
import { parsePost } from "@/lib/posts";

export function validateAllPosts(
  dir: string = path.join(process.cwd(), "content", "posts")
): string[] {
  const errors: string[] = [];
  if (!fs.existsSync(dir)) return errors;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    try {
      parsePost(raw);
    } catch (err) {
      errors.push(`${file}: ${(err as Error).message}`);
    }
  }
  return errors;
}

// CLI entry: run directly to fail the build on invalid content.
if (process.argv[1] && process.argv[1].endsWith("validate-content.ts")) {
  const errors = validateAllPosts();
  if (errors.length > 0) {
    console.error("[validate-content] invalid posts:\n" + errors.join("\n"));
    process.exit(1);
  }
  console.log("[validate-content] all posts valid.");
}
```

- [ ] **Step 4: Run to verify the test passes**

Run: `npm test -- scripts/validate-content.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire `prebuild` into `package.json`**

Add to the `scripts` block:
```json
"prebuild": "tsx scripts/validate-content.ts",
```

- [ ] **Step 6: Write `README.md`**

```markdown
# gta6download.store

SEO content hub for GTA 6 download-related search terms. Next.js (App Router) + MDX, deployed on Vercel.

## Develop

```bash
npm install
cp .env.example .env   # add ANTHROPIC_API_KEY
npm run dev
```

## Content workflow (AI-assisted, human-reviewed)

1. `npm run ingest` — fetches GTA 6 news from RSS, drafts original rewrites via Claude, and writes
   **drafts only** to `content/drafts/`. Nothing is published automatically.
2. Review each draft in `content/drafts/`. Edit for accuracy and quality.
3. Move an approved draft to `content/posts/` and change `status: draft` → `status: published`.
4. Commit. Vercel rebuilds and deploys. `npm run build` runs a content validation guard first.

## Monetization

- Affiliate links: edit `affiliates.config.ts` (one file updates every Buy button). Links render with
  `rel="sponsored nofollow"` and an FTC disclosure.
- Display ads: drop your AdSense (or other) script in and render markup inside `components/AdSlot.tsx`.
- Email capture: set `EMAIL_PROVIDER_ENDPOINT` to your provider's form endpoint.

## Tests

```bash
npm test
```
```

- [ ] **Step 7: Run the full verification**

Run: `npm test && npm run build`
Expected: all tests pass; `prebuild` validation prints "all posts valid."; build succeeds.

- [ ] **Step 8: Commit**

```bash
git add scripts/validate-content.ts scripts/validate-content.test.ts package.json README.md
git commit -m "feat: add build-time content validation guard and README"
```

---

## v2 — Silos, Download Pages, Programmatic Content, Expanded Schema

These tasks extend v1 (Tasks 1–13). They depend on the v1 content loader, SEO helpers, components,
and pipeline. **Honest-framing constraint (from the spec, LOCKED):** download-silo pages for terms
with no real product (mobile/android/ios/apk) state the truth and convert to official links — they
do not imply a download exists, and the site never hosts/links files.

### Task 14: Taxonomy — categories + related-content data

**Files:**
- Create: `lib/taxonomy.ts`
- Modify: `lib/posts.ts` (add optional `category` to frontmatter schema)
- Test: `lib/taxonomy.test.ts`
- Modify: `lib/posts.test.ts` (add a `category` round-trip assertion)

**Interfaces:**
- Consumes: `getAllPosts`, `PostFrontmatter` (Task 3).
- Produces:
  - `export type Category = "downloads" | "installation" | "requirements" | "errors" | "news" | "guides" | "comparisons"`
  - `export const categories: Array<{ id: Category; label: string; path: string }>`
  - `export function postsByCategory(category: Category): Post[]` (where `Post` is the `getAllPosts` element type).
  - `export function relatedPosts(slug: string, limit?: number): Post[]` — same-category first, then shared tags.
  - Frontmatter schema gains `category: Category` (optional; defaults to `"news"`).

- [ ] **Step 1: Add `category` to the frontmatter schema in `lib/posts.ts`**

In the `frontmatterSchema` object (Task 3), add this field (before `tags`):
```ts
    category: z
      .enum(["downloads", "installation", "requirements", "errors", "news", "guides", "comparisons"])
      .default("news"),
```

- [ ] **Step 2: Add a category assertion to `lib/posts.test.ts`**

Append to the `parsePost` describe block:
```ts
  it("defaults category to news when omitted", () => {
    const { frontmatter } = parsePost(VALID);
    expect(frontmatter.category).toBe("news");
  });
```

- [ ] **Step 3: Run to confirm posts tests still pass**

Run: `npm test -- lib/posts.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 4: Write the failing taxonomy test**

`lib/taxonomy.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { categories } from "./taxonomy";

describe("categories", () => {
  it("exposes all seven silos with unique paths", () => {
    expect(categories).toHaveLength(7);
    const paths = categories.map((c) => c.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(categories.find((c) => c.id === "downloads")?.path).toBe("/downloads");
  });
});
```

- [ ] **Step 5: Run to verify it fails**

Run: `npm test -- lib/taxonomy.test.ts`
Expected: FAIL — cannot resolve `./taxonomy`.

- [ ] **Step 6: Write `lib/taxonomy.ts`**

```ts
import { getAllPosts } from "@/lib/posts";

export type Category =
  | "downloads"
  | "installation"
  | "requirements"
  | "errors"
  | "news"
  | "guides"
  | "comparisons";

export const categories: Array<{ id: Category; label: string; path: string }> = [
  { id: "downloads", label: "Downloads", path: "/downloads" },
  { id: "installation", label: "Installation", path: "/installation" },
  { id: "requirements", label: "Requirements", path: "/requirements" },
  { id: "errors", label: "Errors", path: "/errors" },
  { id: "news", label: "News", path: "/news" },
  { id: "guides", label: "Guides", path: "/guides" },
  { id: "comparisons", label: "Comparisons", path: "/comparisons" },
];

type Post = ReturnType<typeof getAllPosts>[number];

export function postsByCategory(category: Category): Post[] {
  return getAllPosts().filter((p) => p.frontmatter.category === category);
}

export function relatedPosts(slug: string, limit = 6): Post[] {
  const all = getAllPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return all.slice(0, limit);
  const sameCat = all.filter(
    (p) => p.slug !== slug && p.frontmatter.category === current.frontmatter.category
  );
  const sharedTag = all.filter(
    (p) =>
      p.slug !== slug &&
      p.frontmatter.category !== current.frontmatter.category &&
      p.frontmatter.tags.some((t) => current.frontmatter.tags.includes(t))
  );
  return [...sameCat, ...sharedTag].slice(0, limit);
}
```

- [ ] **Step 7: Run to verify it passes**

Run: `npm test -- lib/taxonomy.test.ts lib/posts.test.ts`
Expected: PASS (taxonomy 1 + posts 6).

- [ ] **Step 8: Commit**

```bash
git add lib/taxonomy.ts lib/taxonomy.test.ts lib/posts.ts lib/posts.test.ts
git commit -m "feat: add content taxonomy (categories + related posts)"
```

---

### Task 15: RelatedContent component + wire into article pages

**Files:**
- Create: `components/RelatedContent.tsx`
- Modify: `app/news/[slug]/page.tsx` (render `<RelatedContent slug={...} />`)

**Interfaces:**
- Consumes: `relatedPosts`, `categories` (Task 14).
- Produces: `<RelatedContent slug={string} />` — renders a "Related" block grouped by silo, linking to related articles + each silo index. Empty-safe (renders nothing useful-looking if no related posts).

- [ ] **Step 1: Write `components/RelatedContent.tsx`**

```tsx
import Link from "next/link";
import { relatedPosts, categories } from "@/lib/taxonomy";

export function RelatedContent({ slug }: { slug: string }) {
  const related = relatedPosts(slug);
  return (
    <aside className="mt-10 border-t border-neutral-200 pt-6">
      <h2 className="text-lg font-semibold">Related</h2>
      {related.length > 0 && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {related.map((p) => (
            <li key={p.slug}>
              <Link href={`/news/${p.slug}`} className="text-sm hover:underline">
                {p.frontmatter.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <nav className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-600">
        {categories.map((c) => (
          <Link key={c.id} href={c.path} className="hover:underline">
            {c.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Wire it into the article page**

In `app/news/[slug]/page.tsx`, add the import:
```tsx
import { RelatedContent } from "@/components/RelatedContent";
```
And add `<RelatedContent slug={frontmatter.slug} />` immediately after the closing `</section>` of the Sources block, before `</article>`.

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: build succeeds; article pages render the related block.

- [ ] **Step 4: Commit**

```bash
git add components/RelatedContent.tsx app/news/[slug]/page.tsx
git commit -m "feat: add related-content block to articles"
```

---

### Task 16: Download silo pages (data-driven, honest framing)

**Files:**
- Create: `lib/download-pages.ts`
- Create: `app/[downloadSlug]/page.tsx` (catch-all-style dynamic route restricted to known slugs)
- Test: `lib/download-pages.test.ts`

**Interfaces:**
- Consumes: `affiliateStores` + `getStore` (Task 4), `AffiliateLink`, `AffiliateDisclosure`, `EmailSignup`, `Countdown`, `siteConfig`, `breadcrumbJsonLd`.
- Produces:
  - `export interface DownloadPage { slug: string; h1: string; title: string; description: string; intent: "real" | "no_product"; storeIds: string[]; intro: string; warning?: string }`
  - `export const downloadPages: DownloadPage[]`
  - `export function getDownloadPage(slug: string): DownloadPage | undefined`
  - A dynamic route at `/gta-6-download-<x>` that renders each page. `intent: "no_product"` pages render the honest "no official version exists / beware scams" framing + official links; `intent: "real"` pages render normal store CTAs.

- [ ] **Step 1: Write the failing test**

`lib/download-pages.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { downloadPages, getDownloadPage } from "./download-pages";
import { getStore } from "@/affiliates.config";

describe("downloadPages", () => {
  it("every page has a unique slug starting with gta-6-download", () => {
    const slugs = downloadPages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of downloadPages) {
      expect(p.slug.startsWith("gta-6-download")).toBe(true);
    }
  });

  it("every referenced storeId resolves to a real store", () => {
    for (const p of downloadPages) {
      for (const id of p.storeIds) {
        expect(getStore(id), `store ${id} on ${p.slug}`).toBeDefined();
      }
    }
  });

  it("no_product pages carry a scam warning", () => {
    const noProduct = downloadPages.filter((p) => p.intent === "no_product");
    expect(noProduct.length).toBeGreaterThan(0);
    for (const p of noProduct) {
      expect(p.warning, `${p.slug} must warn`).toBeTruthy();
    }
  });

  it("getDownloadPage resolves known and rejects unknown", () => {
    expect(getDownloadPage(downloadPages[0].slug)?.slug).toBe(downloadPages[0].slug);
    expect(getDownloadPage("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- lib/download-pages.test.ts`
Expected: FAIL — cannot resolve `./download-pages`.

- [ ] **Step 3: Write `lib/download-pages.ts`**

```ts
export interface DownloadPage {
  slug: string;
  h1: string;
  title: string;
  description: string;
  /** "real" = a legitimate store path exists; "no_product" = no official version, honest framing. */
  intent: "real" | "no_product";
  storeIds: string[];
  intro: string;
  warning?: string;
}

const REAL_INTRO =
  "GTA 6 isn’t downloadable yet — it’s in the pre-order phase. The only safe way to get it is through an official store. Use the links below; we only point to official storefronts.";

const NO_PRODUCT_WARNING =
  "Important: there is no official GTA 6 version for this platform. Any site offering one is a scam or malware. Below are the official platforms GTA 6 is actually confirmed for.";

export const downloadPages: DownloadPage[] = [
  {
    slug: "gta-6-download-pc",
    h1: "GTA 6 Download for PC",
    title: "GTA 6 Download for PC — Official Stores & Status",
    description: "How to get GTA 6 on PC: official Rockstar, Steam, and Epic links, plus current status.",
    intent: "real",
    storeIds: ["rockstar", "steam", "epic"],
    intro: REAL_INTRO,
  },
  {
    slug: "gta-6-download-steam",
    h1: "GTA 6 on Steam",
    title: "GTA 6 Download on Steam — Status & Official Link",
    description: "Is GTA 6 on Steam? Current status and the official Steam store link.",
    intent: "real",
    storeIds: ["steam"],
    intro: REAL_INTRO,
  },
  {
    slug: "gta-6-download-epic-games",
    h1: "GTA 6 on Epic Games Store",
    title: "GTA 6 Download on Epic Games Store — Status & Link",
    description: "Is GTA 6 on the Epic Games Store? Current status and official link.",
    intent: "real",
    storeIds: ["epic"],
    intro: REAL_INTRO,
  },
  {
    slug: "gta-6-download-rockstar-games",
    h1: "GTA 6 on the Rockstar Store",
    title: "GTA 6 Download — Rockstar Store Status & Link",
    description: "Get GTA 6 from the official Rockstar Store. Current status and link.",
    intent: "real",
    storeIds: ["rockstar"],
    intro: REAL_INTRO,
  },
  {
    slug: "gta-6-download-ps5",
    h1: "GTA 6 for PlayStation 5",
    title: "GTA 6 Download for PS5 — Status & Official Link",
    description: "GTA 6 on PlayStation 5: current status and the official PS Store link.",
    intent: "real",
    storeIds: ["playstation"],
    intro: REAL_INTRO,
  },
  {
    slug: "gta-6-download-xbox",
    h1: "GTA 6 for Xbox Series X|S",
    title: "GTA 6 Download for Xbox — Status & Official Link",
    description: "GTA 6 on Xbox Series X|S: current status and the official Xbox store link.",
    intent: "real",
    storeIds: ["xbox"],
    intro: REAL_INTRO,
  },
  {
    slug: "gta-6-download-mobile",
    h1: "GTA 6 Mobile — Is There a Download?",
    title: "GTA 6 Mobile Download — The Truth (No Official Version)",
    description: "Is there a GTA 6 mobile download? No official mobile version exists. Avoid the scams.",
    intent: "no_product",
    storeIds: ["playstation", "xbox", "rockstar"],
    intro:
      "Searching for a GTA 6 mobile download? Here’s the honest answer and how to actually get the game when it launches.",
    warning: NO_PRODUCT_WARNING,
  },
  {
    slug: "gta-6-download-android",
    h1: "GTA 6 for Android — Is There an APK?",
    title: "GTA 6 Android Download — No Official APK Exists",
    description: "Is there a GTA 6 Android APK? No. Avoid fake APKs and malware. Here’s the real story.",
    intent: "no_product",
    storeIds: ["playstation", "xbox", "rockstar"],
    intro:
      "There is no official GTA 6 for Android. Any APK claiming to be GTA 6 is fake. Here’s how to get the real game.",
    warning: NO_PRODUCT_WARNING,
  },
  {
    slug: "gta-6-download-ios",
    h1: "GTA 6 for iPhone/iOS — Is It Available?",
    title: "GTA 6 iOS Download — No Official iPhone Version",
    description: "Is GTA 6 on iPhone/iOS? No official version exists. Avoid scam apps.",
    intent: "no_product",
    storeIds: ["playstation", "xbox", "rockstar"],
    intro:
      "There is no official GTA 6 for iPhone or iPad. Any App Store or sideload claiming otherwise is not legitimate.",
    warning: NO_PRODUCT_WARNING,
  },
  {
    slug: "gta-6-download-apk",
    h1: "GTA 6 APK — Real or Fake?",
    title: "GTA 6 APK Download — Why Every One Is Fake",
    description: "Looking for a GTA 6 APK? There is no official APK. Every one is a scam or malware.",
    intent: "no_product",
    storeIds: ["playstation", "xbox", "rockstar"],
    intro:
      "There is no official GTA 6 APK and there never has been. Sites offering one are distributing scams or malware.",
    warning: NO_PRODUCT_WARNING,
  },
];

export function getDownloadPage(slug: string): DownloadPage | undefined {
  return downloadPages.find((p) => p.slug === slug);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- lib/download-pages.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the dynamic route `app/[downloadSlug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { downloadPages, getDownloadPage } from "@/lib/download-pages";
import { getStore } from "@/affiliates.config";
import { AffiliateLink } from "@/components/AffiliateLink";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { EmailSignup } from "@/components/EmailSignup";
import { Countdown } from "@/components/Countdown";
import { siteConfig } from "@/site.config";
import { breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return downloadPages.map((p) => ({ downloadSlug: p.slug }));
}

export function generateMetadata({ params }: { params: { downloadSlug: string } }): Metadata {
  const page = getDownloadPage(params.downloadSlug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default function DownloadSiloPage({ params }: { params: { downloadSlug: string } }) {
  const page = getDownloadPage(params.downloadSlug);
  if (!page) notFound();

  const stores = page.storeIds.map((id) => getStore(id)).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: siteConfig.url },
              { name: page.h1, url: `${siteConfig.url}/${page.slug}` },
            ])
          ),
        }}
      />
      <h1 className="text-3xl font-bold">{page.h1}</h1>
      <p className="mt-3 text-neutral-700">{page.intro}</p>

      {page.warning && (
        <div className="my-5 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {page.warning}
        </div>
      )}

      <section className="my-6">
        <h2 className="mb-1 text-xl font-semibold">Release countdown</h2>
        <Countdown target={siteConfig.releaseDate} />
      </section>

      <section className="my-6">
        <h2 className="mb-3 text-xl font-semibold">
          {page.intent === "no_product" ? "Official platforms GTA 6 is confirmed for" : "Get it from an official store"}
        </h2>
        <AffiliateDisclosure />
        <div className="flex flex-wrap gap-3">
          {stores.map((store) => (
            <AffiliateLink key={store.id} store={store}>
              {store.name} ({store.platform})
            </AffiliateLink>
          ))}
        </div>
      </section>

      <section className="my-8 rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-2 text-xl font-semibold">Get notified at launch</h2>
        <EmailSignup />
      </section>
    </main>
  );
}
```

> Note: this dynamic route only matches slugs returned by `generateStaticParams`; any other
> top-level path that isn't a real route falls through to `not-found`. Because all v1 routes
> (`/news`, `/faq`, etc.) are explicit segments, Next.js matches those first; the `[downloadSlug]`
> route only catches the `gta-6-download-*` slugs we generate. If a future top-level static page
> collides, give this route a parent segment instead.

- [ ] **Step 6: Run the build**

Run: `npm run build`
Expected: build succeeds; all `gta-6-download-*` pages listed as static (SSG).

- [ ] **Step 7: Commit**

```bash
git add lib/download-pages.ts lib/download-pages.test.ts "app/[downloadSlug]/page.tsx"
git commit -m "feat: add download silo pages with honest framing for no-product terms"
```

---

### Task 17: Silo index pages + sitemap/nav integration

**Files:**
- Create: `app/downloads/page.tsx`, `app/installation/page.tsx`, `app/requirements/page.tsx`, `app/errors/page.tsx`, `app/guides/page.tsx`, `app/comparisons/page.tsx`
- Create: `components/SiloIndex.tsx`
- Modify: `app/sitemap.ts` (add silo paths + download-silo slugs)

**Interfaces:**
- Consumes: `postsByCategory`, `categories` (Task 14), `downloadPages` (Task 16).
- Produces: an index page per silo listing its posts; `<SiloIndex category={Category} downloadLinks?={boolean} />` reusable list; sitemap includes every new URL.

- [ ] **Step 1: Write `components/SiloIndex.tsx`**

```tsx
import Link from "next/link";
import { postsByCategory, type Category } from "@/lib/taxonomy";
import { downloadPages } from "@/lib/download-pages";

export function SiloIndex({
  category,
  showDownloadLinks = false,
}: {
  category: Category;
  showDownloadLinks?: boolean;
}) {
  const posts = postsByCategory(category);
  return (
    <div>
      {showDownloadLinks && (
        <ul className="mb-6 grid gap-2 sm:grid-cols-2">
          {downloadPages.map((d) => (
            <li key={d.slug}>
              <Link href={`/${d.slug}`} className="hover:underline">
                {d.h1}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {posts.length === 0 ? (
        <p className="text-neutral-500">No articles in this section yet.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/news/${p.slug}`} className="font-medium hover:underline">
                {p.frontmatter.title}
              </Link>
              <p className="text-sm text-neutral-500">{p.frontmatter.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the six silo index pages**

Each follows the same shape. `app/downloads/page.tsx` (the one with `showDownloadLinks`):
```tsx
import type { Metadata } from "next";
import { SiloIndex } from "@/components/SiloIndex";

export const metadata: Metadata = {
  title: "GTA 6 Downloads — All Platforms",
  description: "GTA 6 download pages and status for PC, PS5, Xbox, and more — official links only.",
  alternates: { canonical: "/downloads" },
};

export default function DownloadsSilo() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">GTA 6 Downloads</h1>
      <p className="mt-2 text-neutral-700">Official download status and links by platform.</p>
      <div className="mt-6">
        <SiloIndex category="downloads" showDownloadLinks />
      </div>
    </main>
  );
}
```

`app/installation/page.tsx`:
```tsx
import type { Metadata } from "next";
import { SiloIndex } from "@/components/SiloIndex";

export const metadata: Metadata = {
  title: "GTA 6 Installation Guides & Fixes",
  description: "How to install GTA 6 and fix common installation errors.",
  alternates: { canonical: "/installation" },
};

export default function InstallationSilo() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">GTA 6 Installation</h1>
      <div className="mt-6">
        <SiloIndex category="installation" />
      </div>
    </main>
  );
}
```

`app/requirements/page.tsx`:
```tsx
import type { Metadata } from "next";
import { SiloIndex } from "@/components/SiloIndex";

export const metadata: Metadata = {
  title: "GTA 6 System Requirements & Benchmarks",
  description: "GTA 6 PC requirements, GPU/CPU benchmarks, and settings guides.",
  alternates: { canonical: "/requirements" },
};

export default function RequirementsSilo() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">GTA 6 Requirements</h1>
      <div className="mt-6">
        <SiloIndex category="requirements" />
      </div>
    </main>
  );
}
```

`app/errors/page.tsx`:
```tsx
import type { Metadata } from "next";
import { SiloIndex } from "@/components/SiloIndex";

export const metadata: Metadata = {
  title: "GTA 6 Error Codes & Fixes",
  description: "Fixes for GTA 6 errors: launcher issues, crashes, black screens, and error codes.",
  alternates: { canonical: "/errors" },
};

export default function ErrorsSilo() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">GTA 6 Errors &amp; Fixes</h1>
      <div className="mt-6">
        <SiloIndex category="errors" />
      </div>
    </main>
  );
}
```

`app/guides/page.tsx`:
```tsx
import type { Metadata } from "next";
import { SiloIndex } from "@/components/SiloIndex";

export const metadata: Metadata = {
  title: "GTA 6 Guides",
  description: "GTA 6 guides: settings, controllers, FPS, and more.",
  alternates: { canonical: "/guides" },
};

export default function GuidesSilo() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">GTA 6 Guides</h1>
      <div className="mt-6">
        <SiloIndex category="guides" />
      </div>
    </main>
  );
}
```

`app/comparisons/page.tsx`:
```tsx
import type { Metadata } from "next";
import { SiloIndex } from "@/components/SiloIndex";

export const metadata: Metadata = {
  title: "GTA 6 Comparisons",
  description: "GTA 6 vs other games: GTA 5, Cyberpunk 2077, RDR2, and more.",
  alternates: { canonical: "/comparisons" },
};

export default function ComparisonsSilo() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">GTA 6 Comparisons</h1>
      <div className="mt-6">
        <SiloIndex category="comparisons" />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add silo + download paths to `app/sitemap.ts`**

Replace the `STATIC_PATHS` array in `app/sitemap.ts` with:
```ts
const STATIC_PATHS = [
  "",
  "/gta-6-download",
  "/news",
  "/where-to-buy",
  "/gta-6-release-date",
  "/gta-6-system-requirements",
  "/faq",
  "/about",
  "/contact",
  "/privacy",
  "/disclaimer",
  "/downloads",
  "/installation",
  "/requirements",
  "/errors",
  "/guides",
  "/comparisons",
];
```
And add the download-silo entries. Add this import at the top:
```ts
import { downloadPages } from "@/lib/download-pages";
```
And in the `sitemap()` function, before the `return`, add:
```ts
  const downloadEntries = downloadPages.map((d) => ({
    url: `${siteConfig.url}/${d.slug}`,
    lastModified: new Date(),
  }));
```
Then change the return to include them:
```ts
  return [...staticEntries, ...downloadEntries, ...postEntries];
```

- [ ] **Step 4: Run the build**

Run: `npm run build`
Expected: build succeeds; six silo index routes + all download slugs present; sitemap includes them.

- [ ] **Step 5: Commit**

```bash
git add app/downloads app/installation app/requirements app/errors app/guides app/comparisons components/SiloIndex.tsx app/sitemap.ts
git commit -m "feat: add silo index pages and sitemap integration"
```

---

### Task 18: Expanded JSON-LD schema (HowTo, VideoObject, SoftwareApplication, WebSite+SearchAction)

**Files:**
- Modify: `lib/seo.ts` (add four helpers)
- Modify: `lib/seo.test.ts` (add assertions)
- Modify: `app/layout.tsx` (emit WebSite+SearchAction)
- Modify: `app/[downloadSlug]/page.tsx` (emit SoftwareApplication on `real` pages)

**Interfaces:**
- Consumes: `siteConfig`.
- Produces:
  - `export function howToJsonLd(name: string, steps: Array<{ name: string; text: string }>): object`
  - `export function videoJsonLd(v: { name: string; description: string; thumbnailUrl: string; uploadDate: string; contentUrl: string }): object`
  - `export function softwareAppJsonLd(opts: { name: string; os: string; category?: string }): object`
  - `export function websiteSearchJsonLd(): object` — `WebSite` with `SearchAction`.

- [ ] **Step 1: Add the four helpers to `lib/seo.ts`**

Append to `lib/seo.ts`:
```ts
export function howToJsonLd(name: string, steps: Array<{ name: string; text: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function videoJsonLd(v: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.name,
    description: v.description,
    thumbnailUrl: v.thumbnailUrl,
    uploadDate: v.uploadDate,
    contentUrl: v.contentUrl,
  };
}

export function softwareAppJsonLd(opts: { name: string; os: string; category?: string }): object {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    operatingSystem: opts.os,
    applicationCategory: opts.category ?? "GameApplication",
  };
}

export function websiteSearchJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/news?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
```

- [ ] **Step 2: Add tests to `lib/seo.test.ts`**

Append a new describe block:
```ts
import { howToJsonLd, videoJsonLd, softwareAppJsonLd, websiteSearchJsonLd } from "./seo";

describe("expanded JSON-LD", () => {
  it("howTo lists ordered steps", () => {
    const ld = howToJsonLd("Install", [
      { name: "A", text: "do a" },
      { name: "B", text: "do b" },
    ]) as any;
    expect(ld["@type"]).toBe("HowTo");
    expect(ld.step[1].position).toBe(2);
  });

  it("video has VideoObject type and contentUrl", () => {
    const ld = videoJsonLd({
      name: "n", description: "d", thumbnailUrl: "https://x/t.jpg",
      uploadDate: "2026-01-01", contentUrl: "https://x/v.mp4",
    }) as any;
    expect(ld["@type"]).toBe("VideoObject");
    expect(ld.contentUrl).toBe("https://x/v.mp4");
  });

  it("software app defaults to GameApplication category", () => {
    const ld = softwareAppJsonLd({ name: "GTA 6", os: "Windows" }) as any;
    expect(ld.applicationCategory).toBe("GameApplication");
  });

  it("website search action targets the news search", () => {
    const ld = websiteSearchJsonLd() as any;
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.potentialAction["@type"]).toBe("SearchAction");
  });
});
```

> Note: the existing `import { ... } from "./seo"` at the top of the test file can be extended
> instead of adding a second import line — either is fine; duplicate named imports from the same
> module are a lint warning, not an error. Prefer merging into the top import.

- [ ] **Step 3: Run the seo tests**

Run: `npm test -- lib/seo.test.ts`
Expected: PASS (4 original + 4 new = 8).

- [ ] **Step 4: Emit WebSite+SearchAction in `app/layout.tsx`**

Add the import:
```tsx
import { organizationJsonLd, websiteSearchJsonLd } from "@/lib/seo";
```
And add a second JSON-LD script in `<body>` right after the organization one:
```tsx
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSearchJsonLd()) }}
        />
```

- [ ] **Step 5: Emit SoftwareApplication on `real` download pages**

In `app/[downloadSlug]/page.tsx`, add the import:
```tsx
import { breadcrumbJsonLd, softwareAppJsonLd } from "@/lib/seo";
```
(merge with the existing `breadcrumbJsonLd` import). After the breadcrumb `<script>`, add:
```tsx
      {page.intent === "real" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              softwareAppJsonLd({ name: "Grand Theft Auto VI", os: page.h1.includes("PC") ? "Windows" : "Console" })
            ),
          }}
        />
      )}
```

- [ ] **Step 6: Run the build**

Run: `npm test && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add lib/seo.ts lib/seo.test.ts app/layout.tsx "app/[downloadSlug]/page.tsx"
git commit -m "feat: add HowTo, VideoObject, SoftwareApplication, WebSite+SearchAction schema"
```

---

### Task 19: Topic-queue mode for the ingest pipeline (programmatic page drafting)

**Files:**
- Create: `scripts/topics.config.ts`
- Modify: `scripts/draft.ts` (add `draftFromTopic`)
- Modify: `scripts/ingest.ts` (run RSS mode then topic-queue mode)
- Test: `scripts/draft.test.ts` (add a `draftFromTopic` case)

**Interfaces:**
- Consumes: `AnthropicLike` + `DraftArticle` (Task 12), `feeds.config`/`fetchFeeds` (existing run).
- Produces:
  - `scripts/topics.config.ts`: `export interface Topic { title: string; category: string; brief: string }`; `export const topics: Topic[]` (seed list: GPU/CPU benchmark briefs, error-code briefs, comparison briefs).
  - `scripts/draft.ts`: `export async function draftFromTopic(topic: Topic, client: AnthropicLike, model: string): Promise<DraftArticle>` — drafts an original article body from the topic brief; same JSON contract as `draftArticle`.
  - `scripts/ingest.ts`: after the RSS pass, drafts any topics not already in `content/.seen.json` (keyed by a `topic:` prefix), writing **drafts only** with the topic's `category` in frontmatter.

- [ ] **Step 1: Write `scripts/topics.config.ts`**

```ts
export interface Topic {
  title: string;
  category: string;
  brief: string;
}

export const topics: Topic[] = [
  {
    title: "GTA 6 on the RTX 4060 — Expected Performance",
    category: "requirements",
    brief:
      "Analyze expected GTA 6 performance on an NVIDIA RTX 4060: likely settings, resolution, and FPS expectations based on the announced console target and comparable open-world titles. Be clear these are projections, not confirmed benchmarks.",
  },
  {
    title: "GTA 6 'Game Won't Launch' — Common Causes & Fixes",
    category: "errors",
    brief:
      "Write a troubleshooting guide for a GTA 6 launcher that won't start: driver updates, verifying files, DirectX, antivirus, admin rights. Generic-but-accurate PC troubleshooting framed for GTA 6.",
  },
  {
    title: "GTA 6 vs GTA 5 — What's Actually Different",
    category: "comparisons",
    brief:
      "Compare GTA 6 to GTA 5 across what Rockstar has officially confirmed or strongly signaled: setting, scope, platforms. Avoid inventing specs; flag rumors as rumors.",
  },
];
```

- [ ] **Step 2: Add the failing `draftFromTopic` test**

Append to `scripts/draft.test.ts`:
```ts
import { draftFromTopic } from "./draft";

describe("draftFromTopic", () => {
  const fakeJson = JSON.stringify({
    title: "GTA 6 on RTX 4060",
    slug: "gta-6-rtx-4060",
    description: "Projected performance.",
    body: "Analysis.",
    tags: ["gta6", "benchmark"],
  });
  const fakeClient = {
    messages: { create: async () => ({ content: [{ type: "text", text: fakeJson }] }) },
  };

  it("drafts a structured article from a topic brief", async () => {
    const draft = await draftFromTopic(
      { title: "GTA 6 on RTX 4060", category: "requirements", brief: "brief text" },
      fakeClient,
      "claude-opus-4-8"
    );
    expect(draft.slug).toBe("gta-6-rtx-4060");
    expect(draft.tags).toContain("benchmark");
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test -- scripts/draft.test.ts`
Expected: FAIL — `draftFromTopic` is not exported.

- [ ] **Step 4: Add `draftFromTopic` to `scripts/draft.ts`**

Add the import at the top:
```ts
import type { Topic } from "./topics.config";
```
And append this function (it reuses the same `slugify` already defined in the file):
```ts
const TOPIC_SYSTEM = `You are an editorial assistant for a GTA 6 site. Write an ORIGINAL, accurate
article from the given brief. Only state things that are officially confirmed or clearly framed as
projection/rumor. Never fabricate specs or benchmarks. Respond ONLY with JSON:
{"title": string, "slug": string, "description": string, "body": string (markdown), "tags": string[]}.`;

export async function draftFromTopic(
  topic: Topic,
  client: AnthropicLike,
  model: string
): Promise<DraftArticle> {
  const userPrompt = `Topic: ${topic.title}
Category: ${topic.category}
Brief: ${topic.brief}

Write the article (400-800 words). Output JSON only.`;

  const response = await client.messages.create({
    model,
    max_tokens: 16000,
    system: TOPIC_SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content.find((b) => b.type === "text" && b.text)?.text;
  if (!text) throw new Error(`draftFromTopic: model returned no text for "${topic.title}"`);

  let parsed: Partial<DraftArticle>;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`draftFromTopic: model output was not valid JSON for "${topic.title}"`);
  }

  return {
    title: parsed.title ?? topic.title,
    slug: parsed.slug ? slugify(parsed.slug) : slugify(parsed.title ?? topic.title),
    description: parsed.description ?? "",
    body: parsed.body ?? "",
    tags: Array.isArray(parsed.tags) ? parsed.tags : ["gta6"],
  };
}
```

- [ ] **Step 5: Run to verify the draft tests pass**

Run: `npm test -- scripts/draft.test.ts`
Expected: PASS (original 2 + new 1 = 3).

- [ ] **Step 6: Add topic-queue pass to `scripts/ingest.ts`**

Add imports near the top:
```ts
import { topics } from "./topics.config";
import { draftFromTopic } from "./draft";
```
Add this helper above `main()`:
```ts
function topicKey(title: string): string {
  return `topic:${title}`;
}

function toMdxWithCategory(mdx: string, category: string): string {
  // Insert a category line into the frontmatter block (between the leading --- markers).
  return mdx.replace(/^---\n/, `---\ncategory: "${category}"\n`);
}
```
Inside `main()`, after the RSS loop writes drafts and **before** `saveSeen(seen)`, add the topic pass:
```ts
  for (const topic of topics) {
    const key = topicKey(topic.title);
    if (seen.has(key)) continue;
    try {
      const draft = await draftFromTopic(topic, client, model);
      const mdx = toMdxWithCategory(
        toMdx(draft, { title: topic.title, link: "", contentSnippet: "", sourceFeed: "topic-queue" }, dateISO),
        topic.category
      );
      const file = path.join(DRAFTS_DIR, draftFilename(draft.slug, dateISO));
      fs.writeFileSync(file, mdx);
      seen.add(key);
      written++;
      console.log(`[ingest] wrote topic draft: ${path.basename(file)}`);
    } catch (err) {
      console.warn(`[ingest] topic draft failed for "${topic.title}": ${(err as Error).message}`);
    }
  }
```

> Note: for topic drafts the `sources` frontmatter is `[""]` from `toMdx`'s use of `item.link`.
> Since topic pages have no single source URL, change the writer call to provide a real source:
> in the topic pass above, the `link: ""` produces an empty source which the frontmatter schema
> (min 1 url) would reject at build time. **Fix:** pass the canonical homepage as the source —
> change `link: ""` to `link: siteConfig.url`. Add `import { siteConfig } from "@/site.config";`
> at the top of `ingest.ts`. (Editorial replaces it with real sources during review.)

- [ ] **Step 7: Apply the source fix from the note**

In `scripts/ingest.ts`, add `import { siteConfig } from "@/site.config";` and change the topic pass's
`link: ""` to `link: siteConfig.url`.

- [ ] **Step 8: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 9: Commit**

```bash
git add scripts/topics.config.ts scripts/draft.ts scripts/draft.test.ts scripts/ingest.ts
git commit -m "feat: add topic-queue mode for programmatic page drafting (drafts only)"
```

---

## Final Verification

After all tasks (v1 + v2):

- [ ] Run `npm test` — every test file passes (site.config, posts, affiliates, countdown, subscribe, seo, filter, draft, writeDraft, validate-content, taxonomy, download-pages).
- [ ] Run `npm run build` — `prebuild` validation passes; all routes build; static pages are static; `/news/[slug]` and `/[downloadSlug]` enumerated via `generateStaticParams`.
- [ ] Grep guard — the pipeline never writes to `content/posts/`: `grep -rn "content/posts" scripts/` shows only `validate-content.ts` (read). Both `ingest.ts` passes (RSS + topic) write only to `content/drafts/`.
- [ ] Grep guard — every affiliate link uses `sponsored nofollow`: `components/AffiliateLink.tsx` contains `rel="sponsored nofollow"`.
- [ ] **Honest-framing guard** — confirm every `intent: "no_product"` page in `lib/download-pages.ts` has a non-empty `warning` (enforced by the test in Task 16) and renders the scam warning. No page implies a download exists for mobile/android/ios/apk.
- [ ] **No file distribution** — grep the repo for any download/host of game files: `grep -rniE "\.(apk|exe|zip|rar|iso)\b" app lib components scripts content` returns no link/host of an actual game file (matches in copy that *warn about* such files are fine).
- [ ] Manual check — `npm run dev`: visit `/gta-6-download`, `/gta-6-download-pc`, `/gta-6-download-apk` (must show the honest "no APK exists" warning + official links), `/downloads`, `/requirements`, an article page (related block renders). Visit `/feed.xml`, `/sitemap.xml` (includes silos + download slugs), `/robots.txt`.
- [ ] Confirm `ANTHROPIC_API_KEY` is documented in `.env.example` and required by `ingest.ts` (aborts cleanly if unset).
- [ ] Read `docs/growth-playbook.md` — confirms link-building, social, publishing-cadence, and KPI work is captured as ops (not code).

