import { describe, it, expect } from "vitest";
import { validateEmail, subscribe, subscribeRequest } from "./subscribe";

const RESEND = { apiKey: "re_test_key", audienceId: "aud_123" };
const CONTACTS_URL = "https://api.resend.com/audiences/aud_123/contacts";

describe("validateEmail", () => {
  it("normalizes case and whitespace", () => {
    expect(validateEmail("  Alex.Player@Example.COM ")).toBe("alex.player@example.com");
  });

  it("rejects malformed or non-string input", () => {
    for (const bad of ["", "   ", "no-at-sign", "a@b", "a@@b.com", "a b@c.com", {}, null, undefined, 42]) {
      expect(validateEmail(bad)).toBeNull();
    }
  });

  it("rejects absurdly long addresses", () => {
    expect(validateEmail(`${"a".repeat(300)}@example.com`)).toBeNull();
  });
});

describe("subscribe", () => {
  it("returns 400 for an invalid address without calling Resend", async () => {
    let called = false;
    const res = await subscribe({ email: "bad" }, {
      ...RESEND,
      fetchImpl: async () => { called = true; return { ok: true, status: 201 }; },
    });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(called).toBe(false);
  });

  it("accepts and logs locally unless both the key and the audience are set", async () => {
    let called = false;
    const fetchImpl = async () => { called = true; return { ok: true, status: 201 }; };
    for (const partial of [{}, { apiKey: RESEND.apiKey }, { audienceId: RESEND.audienceId }]) {
      const res = await subscribe({ email: "me@example.com" }, { ...partial, fetchImpl });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    }
    expect(called).toBe(false);
  });

  it("adds the normalized address to the audience with the key as a bearer token", async () => {
    const calls: Array<{ url: string; init: Record<string, unknown> }> = [];
    const res = await subscribe({ email: " Me@Example.com " }, {
      ...RESEND,
      fetchImpl: async (url, init) => {
        calls.push({ url, init: init ?? {} });
        return { ok: true, status: 201 };
      },
    });

    expect(res.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(CONTACTS_URL);
    expect(calls[0].init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer re_test_key" },
      body: '{"email":"me@example.com"}',
    });
  });

  it("reports a Resend rejection or an unreachable Resend as 502", async () => {
    const rejected = await subscribe({ email: "me@example.com" }, {
      ...RESEND,
      fetchImpl: async () => ({ ok: false, status: 401 }),
    });
    expect(rejected.status).toBe(502);
    expect(rejected.body.ok).toBe(false);

    const thrown = await subscribe({ email: "me@example.com" }, {
      ...RESEND,
      fetchImpl: async () => { throw new Error("network down"); },
    });
    expect(thrown.status).toBe(502);
    expect(thrown.body.ok).toBe(false);
  });
});

describe("subscribeRequest", () => {
  const post = (body: unknown) =>
    new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

  it("answers 400 when the body is not JSON", async () => {
    const res = await subscribeRequest(post("{"), RESEND);
    expect(res.status).toBe(400);
  });

  it("accepts a filled honeypot without reaching Resend", async () => {
    let called = false;
    const res = await subscribeRequest(post({ email: "me@example.com", website: "https://spam.test" }), {
      ...RESEND,
      fetchImpl: async () => {
        called = true;
        return { ok: true, status: 201 };
      },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(called).toBe(false);
  });

  it("rejects a bad address and forwards a good one, normalized", async () => {
    const sent: unknown[] = [];
    const fetchImpl = async (_url: string, init?: Record<string, unknown>) => {
      sent.push(JSON.parse(String(init?.body)));
      return { ok: true, status: 201 };
    };

    const bad = await subscribeRequest(post({ email: "nope" }), { ...RESEND, fetchImpl });
    expect(bad.status).toBe(400);

    const good = await subscribeRequest(post({ email: "Me@Example.com", context: "faq" }), {
      ...RESEND,
      fetchImpl,
    });
    expect(good.status).toBe(200);
    expect(sent).toEqual([{ email: "me@example.com" }]);
  });
});
