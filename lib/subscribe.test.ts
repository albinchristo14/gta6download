import { describe, it, expect } from "vitest";
import { validateEmail, subscribe } from "./subscribe";

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
  it("returns 400 for an invalid address without calling the provider", async () => {
    let called = false;
    const res = await subscribe({ email: "bad" }, { endpoint: "https://x.test", fetchImpl: async () => { called = true; return { ok: true, status: 200 }; } });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(called).toBe(false);
  });

  it("accepts and logs when no endpoint is configured", async () => {
    const res = await subscribe({ email: "me@example.com" }, { endpoint: "" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("forwards to the provider and reports a provider failure as 502", async () => {
    const sent: string[] = [];
    const ok = await subscribe({ email: "me@example.com" }, {
      endpoint: "https://provider.test/forms",
      fetchImpl: async (url) => { sent.push(url); return { ok: true, status: 200 }; },
    });
    expect(ok.status).toBe(200);
    expect(sent).toEqual(["https://provider.test/forms"]);

    const failing = await subscribe({ email: "me@example.com" }, {
      endpoint: "https://provider.test/forms",
      fetchImpl: async () => ({ ok: false, status: 403 }),
    });
    expect(failing.status).toBe(502);

    const thrown = await subscribe({ email: "me@example.com" }, {
      endpoint: "https://provider.test/forms",
      fetchImpl: async () => { throw new Error("network down"); },
    });
    expect(thrown.status).toBe(502);
    expect(thrown.body.ok).toBe(false);
  });
});
