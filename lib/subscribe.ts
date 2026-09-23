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

export interface SubscribeOptions {
  apiKey?: string;
  audienceId?: string;
  /** Recorded in the dev fallback only: Resend has no per-contact metadata, so the source page cannot travel with the address. */
  context?: unknown;
  fetchImpl?: FetchLike;
}

/**
 * Validates an address and adds it to a Resend audience. Resend creates-or-reuses the
 * contact for that address, so repeat signups are harmless.
 *
 * With no key or audience the signup is accepted and logged rather than stored, which keeps
 * local dev usable; the Pages Function refuses earlier so production never says "you are on
 * the list" about a list that does not exist. `fetchImpl` is injectable for tests.
 */
export async function subscribe(
  input: unknown,
  opts: SubscribeOptions = {},
): Promise<SubscribeResult> {
  const email = typeof input === "object" && input !== null ? (input as { email?: unknown }).email : input;
  const normalized = validateEmail(email);

  if (!normalized) {
    return { status: 400, body: { ok: false, message: "Please enter a valid email address." } };
  }

  const { apiKey, audienceId } = opts;
  if (!apiKey || !audienceId) {
    console.log(
      `[subscribe] accepted ${normalized} from ${String(opts.context ?? "unknown")} (no Resend key or audience configured)`,
    );
    return {
      status: 200,
      body: { ok: true, message: "You are on the list. We will email you when a real download exists." },
    };
  }

  // Resend has no metadata field on a contact, so `context` cannot travel with the address.
  const doFetch: FetchLike =
    opts.fetchImpl ??
    ((url, init) => fetch(url, init as RequestInit).then((r) => ({ ok: r.ok, status: r.status })));

  try {
    const res = await doFetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ email: normalized }),
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
  opts: SubscribeOptions = {},
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

  const result = await subscribe(body, { ...opts, context: body.context });
  return json(result.body, result.status);
}
