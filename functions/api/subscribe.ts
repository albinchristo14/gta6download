import { subscribeRequest } from "../../lib/subscribe";

interface PagesContext {
  request: Request;
  env: Record<string, string | undefined>;
}

/**
 * Production `/api/subscribe`. Cloudflare Pages routes POSTs here by file path, so this
 * has to mirror the app route's URL exactly.
 *
 * Unlike the dev route, a missing endpoint is a 503 rather than the silent 200 in
 * `subscribe`: accepting addresses we cannot store would tell people they are on a list
 * that does not exist.
 */
export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  const endpoint = env?.EMAIL_PROVIDER_ENDPOINT;
  if (!endpoint) {
    return new Response(
      JSON.stringify({ ok: false, message: "Signup is not accepting addresses right now. Try again shortly." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
  return subscribeRequest(request, { endpoint });
}
