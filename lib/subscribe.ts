export interface SubscribeResult {
  status: number;
  body: { ok: boolean; message: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Returns the normalized address, or null when the input is not a usable email. */
export function validateEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length > 254) return null;
  const [local, ...domainParts] = trimmed.split("@");
  const domain = domainParts.join("@");
  if (local.length > 64 || domain.length > 253) return null;
  return EMAIL_RE.test(trimmed) ? trimmed : null;
}

type FetchLike = (url: string, init?: Record<string, unknown>) => Promise<{ ok: boolean; status: number }>;

/**
 * Validates an address and forwards it to the configured email provider.
 * With no endpoint configured the signup is accepted and logged, so the site works
 * before ConvertKit/Buttondown are connected. `fetchImpl` is injectable for tests.
 */
export async function subscribe(
  input: unknown,
  opts: {
    endpoint?: string;
    context?: unknown;
    fetchImpl?: FetchLike;
  } = {},
): Promise<SubscribeResult> {
  const email = typeof input === "object" && input !== null ? (input as { email?: unknown }).email : input;
  const normalized = validateEmail(email);

  if (!normalized) {
    return { status: 400, body: { ok: false, message: "Please enter a valid email address." } };
  }

  const endpoint = opts.endpoint ?? process.env.EMAIL_PROVIDER_ENDPOINT;
  if (!endpoint) {
    console.log(`[subscribe] accepted ${normalized} (no provider endpoint configured)`);
    return {
      status: 200,
      body: { ok: true, message: "You are on the list. We will email you when a real download exists." },
    };
  }

  const doFetch: FetchLike =
    opts.fetchImpl ?? ((url, init) => fetch(url, init as RequestInit).then((r) => ({ ok: r.ok, status: r.status })));

  try {
    const res = await doFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized, context: opts.context ?? "" }),
    });
    if (!res.ok) {
      return { status: 502, body: { ok: false, message: "The signup service rejected the request." } };
    }
    return {
      status: 200,
      body: { ok: true, message: "You are on the list. We will email you when a real download exists." },
    };
  } catch {
    return { status: 502, body: { ok: false, message: "The signup service is unreachable. Try again shortly." } };
  }
}

/** A bot that filled the honeypot is told it succeeded, so it never learns it was blocked. */
const HONEYPOT_ACCEPT = { ok: true, message: "You are on the list." };

function json(body: { ok: boolean; message: string }, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * The whole `/api/subscribe` contract in one place: JSON parsing, the honeypot,
 * validation and the provider call. The Next route handler (local dev) and the
 * Cloudflare Pages Function (production) are both thin wrappers over this, so the
 * shape the browser depends on cannot drift between the two runtimes.
 */
export async function subscribeRequest(
  request: Request,
  opts: { endpoint?: string; fetchImpl?: FetchLike } = {},
): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Expected a JSON body." }, 400);
  }

  const body = (payload ?? {}) as { email?: unknown; context?: unknown; website?: unknown };
  if (typeof body.website === "string" && body.website.length > 0) {
    return json(HONEYPOT_ACCEPT, 200);
  }

  const result = await subscribe(body, { endpoint: opts.endpoint, context: body.context, fetchImpl: opts.fetchImpl });
  return json(result.body, result.status);
}
