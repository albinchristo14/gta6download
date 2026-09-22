import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { feeds as feedUrls, keywords } from "./feeds.config";
import { topics } from "./topics.config";
import { fetchAllFeeds, type FeedItem } from "./fetchFeeds";
import { isRelevant, dedupe, dedupeByTitle, canonicalLink } from "./filter";
import { draftArticle, draftFromTopic, draftFromPseoRow, type AnthropicLike } from "./draft";
import { writeDraft, sourceLinksFor } from "./writeDraft";
import { pseoFamilies, loadRows, bodySlugFor } from "../lib/pseo";
import { getPublishedPosts } from "../lib/posts";

const CONTENT_DIR = path.join(process.cwd(), "content");
const SEEN_PATH = path.join(CONTENT_DIR, ".seen.json");
const DRAFTS_DIR = path.join(CONTENT_DIR, "drafts");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");

const DEFAULT_MODEL = "claude-opus-4-8";

export interface IngestOptions {
  dryRun: boolean;
  limit: number;
  skipFeeds: boolean;
  skipTopics: boolean;
  skipPseo: boolean;
}

export interface IngestResult {
  fetched: number;
  relevant: number;
  draftsWritten: string[];
  skipped: number;
  failures: string[];
}

function parseArgs(argv: string[]): IngestOptions {
  const has = (flag: string) => argv.includes(`--${flag}`);
  const limitFlag = argv.find((a) => a.startsWith("--limit="));
  return {
    dryRun: has("dry-run"),
    limit: limitFlag ? Number(limitFlag.split("=")[1]) : Number(process.env.INGEST_LIMIT ?? 10),
    skipFeeds: has("skip-feeds"),
    skipTopics: has("skip-topics"),
    skipPseo: has("skip-pseo"),
  };
}

function loadSeen(): Set<string> {
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(SEEN_PATH, "utf8"));
    return new Set(Array.isArray(raw) ? (raw as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>): void {
  fs.mkdirSync(path.dirname(SEEN_PATH), { recursive: true });
  const tmp = `${SEEN_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify([...seen].sort(), null, 2));
  fs.renameSync(tmp, SEEN_PATH);
}

/** A 429 or a transient 5xx is normal; a second failure means skip the item and carry on. */
async function withRetry<T>(label: string, work: () => Promise<T>, failures: string[]): Promise<T | null> {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await work();
    } catch (err) {
      const message = (err as Error).message;
      if (attempt === 2) {
        failures.push(`${label}: ${message}`);
        console.warn(`[ingest] failed after retry — ${label}: ${message}`);
        return null;
      }
      console.warn(`[ingest] ${label} attempt ${attempt} failed (${message}), retrying`);
    }
  }
  return null;
}

function publishedSlugs(): Set<string> {
  try {
    return new Set(getPublishedPosts().map((post) => post.slug));
  } catch (err) {
    // A broken post fails the build elsewhere; here it only means "re-check next run".
    console.warn(`[ingest] could not read published slugs: ${(err as Error).message}`);
    return new Set();
  }
}

export interface IngestDeps {
  client: AnthropicLike;
  model: string;
  options: IngestOptions;
  fetchItems?: (urls: string[]) => Promise<FeedItem[]>;
}

export async function runIngest(deps: IngestDeps): Promise<IngestResult> {
  const { client, model, options } = deps;
  const seen = loadSeen();
  const result: IngestResult = {
    fetched: 0,
    relevant: 0,
    draftsWritten: [],
    skipped: 0,
    failures: [],
  };

  const commit = (key: string, write: () => string) => {
    if (seen.has(key)) {
      result.skipped += 1;
      return;
    }
    if (options.dryRun) {
      console.log(`[ingest] dry run — would draft ${key}`);
      result.draftsWritten.push(key);
      return;
    }
    const file = write();
    seen.add(key);
    console.log(`[ingest] wrote ${path.relative(process.cwd(), file)}`);
    result.draftsWritten.push(file);
  };

  const budgetLeft = () => result.draftsWritten.length < options.limit;

  // Pass 1 — news that broke.
  if (!options.skipFeeds) {
    const fetchItems = deps.fetchItems ?? ((urls: string[]) => fetchAllFeeds(urls));
    const items = await fetchItems(feedUrls);
    result.fetched = items.length;
    const fresh = dedupeByTitle(dedupe(items.filter((i) => isRelevant(i, keywords)), seen));
    result.relevant = fresh.length;
    console.log(
      `[ingest] ${items.length} items fetched, ${result.relevant} relevant and not seen before`,
    );

    for (const item of fresh) {
      if (!budgetLeft()) break;
      const draft = await withRetry(
        item.link,
        () => draftArticle(item, client, model),
        result.failures,
      );
      if (!draft) continue;
      const key = canonicalLink(item.link);
      commit(key, () =>
        writeDraft(
          DRAFTS_DIR,
          POSTS_DIR,
          draft,
          sourceLinksFor(item),
          new Date().toISOString().slice(0, 10),
        ),
      );
    }
  }

  // Pass 2 — the standing editorial queue.
  if (!options.skipTopics) {
    const have = publishedSlugs();
    for (const topic of topics) {
      if (!budgetLeft()) break;
      if (have.has(topic.slug)) {
        result.skipped += 1;
        continue;
      }
      const draft = await withRetry(
        `topic:${topic.slug}`,
        () => draftFromTopic(topic, client, model),
        result.failures,
      );
      if (!draft) continue;
      commit(`topic:${topic.slug}`, () =>
        writeDraft(DRAFTS_DIR, POSTS_DIR, draft, topic.sources, new Date().toISOString().slice(0, 10)),
      );
    }
  }

  // Pass 3 — programmatic rows that have no page yet. Drafting is not publishing: the
  // route stays noindex until a human moves the file into content/posts/.
  if (!options.skipPseo) {
    const have = publishedSlugs();
    for (const family of pseoFamilies) {
      for (const row of loadRows(family)) {
        if (!budgetLeft()) break;
        const slug = bodySlugFor(family, row);
        if (have.has(slug)) {
          result.skipped += 1;
          continue;
        }
        const draft = await withRetry(
          `pseo:${slug}`,
          () => draftFromPseoRow(family, row, client, model),
          result.failures,
        );
        if (!draft) continue;
        commit(`pseo:${slug}`, () =>
          writeDraft(
            DRAFTS_DIR,
            POSTS_DIR,
            draft,
            ["https://www.rockstargames.com/VI/"],
            new Date().toISOString().slice(0, 10),
          ),
        );
      }
    }
  }

  if (!options.dryRun) saveSeen(seen);
  return result;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey && !options.dryRun) {
    console.error(
      "[ingest] ANTHROPIC_API_KEY is not set. Nothing was written. Re-run with --dry-run to see the queue.",
    );
    process.exitCode = 1;
    return;
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.DRAFT_MODEL ?? DEFAULT_MODEL;
  console.log(`[ingest] model=${model} limit=${options.limit} dryRun=${options.dryRun}`);

  const result = await runIngest({ client, model, options });

  console.log(
    `[ingest] done — ${result.draftsWritten.length} draft(s), ${result.skipped} skipped, ${result.failures.length} failed.`,
  );
  if (!options.dryRun && result.draftsWritten.length > 0) {
    console.log("[ingest] drafts are NOT published. Review each file, then move it to content/posts/.");
  }
  if (result.failures.length > 0) process.exitCode = 1;
}

if (process.argv[1] && /[\\/]ingest\.(?:ts|mts|js|mjs|cjs)$/.test(process.argv[1])) {
  main().catch((err) => {
    console.error(`[ingest] aborted: ${(err as Error).stack ?? err}`);
    process.exitCode = 1;
  });
}
