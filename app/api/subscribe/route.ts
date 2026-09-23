import { subscribeRequest } from "@/lib/subscribe";

/** Local dev only: `output: "export"` drops route handlers, so Pages runs the Function. */
export async function POST(request: Request) {
  return subscribeRequest(request, { endpoint: process.env.EMAIL_PROVIDER_ENDPOINT });
}
