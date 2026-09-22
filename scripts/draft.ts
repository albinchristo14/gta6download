import type { FeedItem } from "./fetchFeeds";
import type { PseoFamily, PseoRow } from "../lib/pseo";
import { bodySlugFor } from "../lib/pseo";

export interface DraftArticle {
  title: string;
  slug: string;
  description: string;
  body: string;
  tags: string[];
  category?: "downloads" | "installation" | "requirements" | "errors" | "news" | "guides" | "comparisons";
}

/** The subset of the Anthropic client we actually use, so tests can inject a fake. */
export interface AnthropicLike {
  messages: {
    // Method syntax, not a property: keeps a real Anthropic client structurally assignable.
    create(args: unknown): Promise<{ content: Array<{ type: string; text?: string }> }>;
  };
}

const SHARED_RULES = `You write for gta6download.store, an independent GTA 6 information site.

NON-NEGOTIABLE EDITORIAL RULES
1. GTA 6 releases 19 November 2026 on PlayStation 5 and Xbox Series X|S. No PC version,
   mobile version or APK has been announced, and no game file exists to download.
2. Never write anything that implies a download exists. Never mention a free download,
   hack, mod menu, trainer, leak, cracked build or save-file tool as something available.
   Where a reader might be looking for one, say plainly that it does not exist and warn
   that sites offering it are scams or malware.
3. Distinguish sharply between what Rockstar has confirmed, what a named outlet reported,
   and what is a projection. Label projections as projections and give the reasoning.
4. Write original prose. Do not reproduce the source text; a reader must not be able to
   map your sentences onto the source's. Paraphrase, add context, add analysis.
5. UK English, no hype adjectives, no emoji. Markdown only: ## headings, paragraphs,
   lists and tables. No raw HTML, no JSX, no images.
6. Close the body with a "## Sources" section listing the URLs you relied on.`;

const OUTPUT_CONTRACT = `Respond with ONLY a JSON object, no prose and no code fences, shaped exactly:
{"title": string, "slug": string, "description": string, "body": string, "tags": string[]}
- title: under 70 characters, states the fact rather than teasing it
- slug: kebab-case, no dates
- description: under 160 characters, used as the meta description
- body: 400-800 words of markdown, including the "## Sources" section
- tags: 3-6 short lowercase tags`;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Models wrap JSON in fences or preamble often enough that a bare JSON.parse is a bug. */
export function parseModelJson(text: string): Partial<DraftArticle> {
  const unfenced = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("model output contained no JSON object");
  }
  return JSON.parse(unfenced.slice(start, end + 1)) as Partial<DraftArticle>;
}

function toDraft(raw: Partial<DraftArticle>, fallbackTitle: string, forcedSlug?: string): DraftArticle {
  const title = (raw.title ?? fallbackTitle).trim();
  const body = (raw.body ?? "").trim();
  if (!body) throw new Error("model returned an empty body");

  return {
    title,
    slug: forcedSlug ?? slugify(raw.slug || title),
    description: (raw.description ?? "").trim() || `${title}.`,
    body,
    tags: Array.isArray(raw.tags) && raw.tags.length ? raw.tags.map((t) => t.toLowerCase()) : ["gta 6"],
    ...(raw.category ? { category: raw.category } : {}),
  };
}

async function complete(
  client: AnthropicLike,
  model: string,
  system: string,
  prompt: string,
  link: string,
): Promise<Partial<DraftArticle>> {
  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content.find((block) => block.type === "text")?.text;
  if (!text) throw new Error(`model returned no text block for ${link}`);
  return parseModelJson(text);
}

export async function draftArticle(
  item: FeedItem,
  client: AnthropicLike,
  model: string,
): Promise<DraftArticle> {
  const prompt = `Rewrite this GTA 6 news item as an original article with added analysis.

Source headline: ${item.title}
Source outlet: ${new URL(item.link).hostname}
Source URL: ${item.link}
${item.fromPrimarySource ? "This IS a primary Rockstar announcement — report it as confirmed." : "This is third-party coverage — attribute it as reported, not confirmed."}
Source text:
"""
${item.contentSnippet}
"""

Open with the fact itself, then explain what changes for someone who has pre-ordered or is
waiting for a download. Include one short section on what is still unknown. Cite the source
URL under "## Sources".`;

  const raw = await complete(client, model, `${SHARED_RULES}\n\n${OUTPUT_CONTRACT}`, prompt, item.link);
  return toDraft(raw, item.title);
}

export interface TopicRequest {
  slug: string;
  title: string;
  brief: string;
  sources: string[];
  category: DraftArticle["category"];
}

/** Task queue entry: a page we decided to write, rather than a story that broke. */
export async function draftFromTopic(
  topic: TopicRequest,
  client: AnthropicLike,
  model: string,
): Promise<DraftArticle> {
  const prompt = `Write an original page for this approved editorial topic.

Working title: ${topic.title}
Target slug: ${topic.slug}
Brief: ${topic.brief}
Reference URLs you may cite (verify the claim against them, do not invent others):
${topic.sources.map((s) => `- ${s}`).join("\n")}

Answer the search intent in the first paragraph. State what is confirmed versus projected.
Cite only the reference URLs above under "## Sources".`;

  const raw = await complete(client, model, `${SHARED_RULES}\n\n${OUTPUT_CONTRACT}`, prompt, topic.slug);
  const draft = toDraft(raw, topic.title, slugify(topic.slug));
  return { ...draft, category: topic.category };
}

export async function draftFromPseoRow(
  family: PseoFamily,
  row: PseoRow,
  client: AnthropicLike,
  model: string,
): Promise<DraftArticle> {
  const facts = Object.entries(row)
    .filter(([key]) => key !== "slug" && key !== "name")
    .map(([key, value]) => `- ${key}: ${String(value)}`)
    .join("\n");

  const prompt = `Write the page for one ${family.label.toLowerCase()} entry in our GTA 6 library.

Entry: ${row.name}
Structured data we hold (this is the only factual input — do not add numbers we do not have):
${facts}

Explain what this means for GTA 6 specifically. If the data cannot support a performance
claim, say so and explain why instead of guessing. Where a figure is a projection, label it.
${family.id === "gpu" || family.id === "cpu" ? "There is no PC version, so every hardware statement is conditional on one being announced." : ""}`;

  const raw = await complete(client, model, `${SHARED_RULES}\n\n${OUTPUT_CONTRACT}`, prompt, row.slug);
  const draft = toDraft(raw, row.name, bodySlugFor(family, row));
  return { ...draft, category: family.bodyCategory };
}
