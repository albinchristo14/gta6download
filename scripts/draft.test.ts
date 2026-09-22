import { describe, it, expect } from "vitest";
import { draftArticle, draftFromTopic, draftFromPseoRow, parseModelJson } from "./draft";
import { pseoFamilies } from "../lib/pseo";
import type { AnthropicLike } from "./draft";

const gpu = pseoFamilies.find((f) => f.id === "gpu")!;

function fakeClient(text: string): AnthropicLike & { calls: unknown[] } {
  const calls: unknown[] = [];
  return {
    calls,
    messages: {
      create: async (args: unknown) => {
        calls.push(args);
        return { content: [{ type: "text", text }] };
      },
    },
  };
}

const draftJson = JSON.stringify({
  title: "GTA 6 pre-load opens on 12 November",
  slug: "gta-6-preload-12-november",
  description: "What the reported pre-load window means for a pre-order.",
  body: "## What changed\nOriginal analysis.\n\n## Sources\n- https://example.com/src",
  tags: ["gta 6", "preload"],
});

const feedItem = {
  title: "Rockstar confirms pre-load window",
  link: "https://example.com/src",
  contentSnippet: "Rockstar says pre-loading begins the week before launch.",
  sourceFeed: "https://example.com/feed",
};

describe("parseModelJson", () => {
  it("reads a bare object", () => {
    expect(parseModelJson('{"title":"T"}').title).toBe("T");
  });

  it("reads a fenced object with preamble, which models do constantly", () => {
    expect(parseModelJson('Sure!\n```json\n{"title":"T"}\n```').title).toBe("T");
  });

  it("throws when there is no object at all", () => {
    expect(() => parseModelJson("no json here")).toThrow(/no JSON object/);
  });
});

describe("draftArticle", () => {
  it("returns a structured draft parsed from the model JSON", async () => {
    const draft = await draftArticle(feedItem, fakeClient(draftJson), "claude-opus-4-8");
    expect(draft.slug).toBe("gta-6-preload-12-november");
    expect(draft.tags).toContain("preload");
    expect(draft.body).toContain("## Sources");
  });

  it("forces a kebab-case slug even when the model ignores the contract", async () => {
    const messy = draftJson.replace("gta-6-preload-12-november", "GTA 6 Preload!!! Nov");
    const draft = await draftArticle(feedItem, fakeClient(messy), "m");
    expect(draft.slug).toBe("gta-6-preload-nov");
  });

  it("carries the honest-framing and no-download rules into the system prompt", async () => {
    const client = fakeClient(draftJson);
    await draftArticle(feedItem, client, "claude-opus-4-8");
    const args = client.calls[0] as { system: string };
    expect(args.system).toContain("No PC version");
    expect(args.system).toContain("Never write anything that implies a download exists");
  });

  it("tells a primary-source item apart from third-party coverage", async () => {
    const client = fakeClient(draftJson);
    await draftArticle({ ...feedItem, fromPrimarySource: true }, client, "m");
    const args = client.calls[0] as { messages: [{ content: string }] };
    expect(args.messages[0].content).toContain("primary Rockstar announcement");
  });

  it("throws rather than inventing an empty article", async () => {
    const empty = fakeClient(JSON.stringify({ title: "T", body: "  " }));
    await expect(draftArticle(feedItem, empty, "m")).rejects.toThrow(/empty body/);
  });

  it("throws when the model returns no text block", async () => {
    const noText: AnthropicLike = { messages: { create: async () => ({ content: [] }) } };
    await expect(draftArticle(feedItem, noText, "m")).rejects.toThrow(/no text block/);
  });
});

describe("draftFromTopic", () => {
  it("keeps the queue's slug instead of whatever the model proposes", async () => {
    const draft = await draftFromTopic(
      {
        slug: "does-gta-6-need-an-internet-connection",
        title: "Does GTA 6 Need an Always-Online Connection?",
        category: "downloads",
        brief: "answer honestly",
        sources: ["https://www.rockstargames.com/VI/"],
      },
      fakeClient(draftJson),
      "m",
    );
    expect(draft.slug).toBe("does-gta-6-need-an-internet-connection");
    expect(draft.category).toBe("downloads");
  });
});

describe("draftFromPseoRow", () => {
  it("namespaces the slug so the generated page can find the body", async () => {
    const draft = await draftFromPseoRow(gpu, { slug: "rtx-4060", name: "RTX 4060", vramGb: 8 }, fakeClient(draftJson), "m");
    expect(draft.slug).toBe("gpu-rtx-4060");
    expect(draft.category).toBe("requirements");
  });

  it("passes the structured data through instead of letting the model invent specs", async () => {
    const client = fakeClient(draftJson);
    await draftFromPseoRow(gpu, { slug: "rtx-4060", name: "RTX 4060", vramGb: 8 }, client, "m");
    const args = client.calls[0] as { messages: [{ content: string }] };
    expect(args.messages[0].content).toContain("vramGb: 8");
    expect(args.messages[0].content).toContain("do not add numbers we do not have");
  });
});
