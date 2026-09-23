import { describe, it, expect, vi, afterEach } from "vitest";
import { onRequestPost } from "./subscribe";

const post = (body: unknown) =>
  new Request("http://localhost/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

afterEach(() => vi.unstubAllGlobals());

describe("Pages /api/subscribe", () => {
  it("refuses to claim a signup succeeded unless Resend is fully configured", async () => {
    for (const env of [{}, { RESEND_API_KEY: "re_live" }, { RESEND_AUDIENCE_ID: "aud_1" }]) {
      const res = await onRequestPost({ request: post({ email: "me@example.com" }), env });
      expect(res.status).toBe(503);
      expect((await res.json()).ok).toBe(false);
    }
  });

  it("adds the address to the audience named in Pages env", async () => {
    const seen: Array<{ url: string; auth: string | null; body: string }> = [];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      seen.push({ url, auth: new Headers(init.headers).get("authorization"), body: String(init.body) });
      return new Response('{"object":"contact","id":"contact_1"}', { status: 201 });
    });

    const res = await onRequestPost({
      request: post({ email: "me@example.com", context: "gpu" }),
      env: { RESEND_API_KEY: "re_live_key", RESEND_AUDIENCE_ID: "aud_1" },
    });

    expect(res.status).toBe(200);
    expect(seen).toEqual([
      {
        url: "https://api.resend.com/audiences/aud_1/contacts",
        auth: "Bearer re_live_key",
        body: '{"email":"me@example.com"}',
      },
    ]);
  });
});
