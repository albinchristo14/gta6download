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
  it("refuses to claim a signup succeeded when no provider is configured", async () => {
    const res = await onRequestPost({ request: post({ email: "me@example.com" }), env: {} });
    expect(res.status).toBe(503);
    expect((await res.json()).ok).toBe(false);
  });

  it("sends the address to the endpoint held in Pages env", async () => {
    const bodies: string[] = [];
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      bodies.push(String(init.body));
      return new Response("{}", { status: 200 });
    });

    const res = await onRequestPost({
      request: post({ email: "me@example.com", context: "gpu" }),
      env: { EMAIL_PROVIDER_ENDPOINT: "https://provider.invalid/forms" },
    });

    expect(res.status).toBe(200);
    expect(bodies).toEqual(['{"email":"me@example.com","context":"gpu"}']);
  });
});
