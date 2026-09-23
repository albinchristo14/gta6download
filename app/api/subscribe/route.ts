import { subscribeRequest } from "@/lib/subscribe";

/** Local dev only: `output: "export"` drops route handlers, so Pages runs the Function. */
export async function POST(request: Request) {
  return subscribeRequest(request, {
    apiKey: process.env.RESEND_API_KEY,
    audienceId: process.env.RESEND_AUDIENCE_ID,
  });
}
