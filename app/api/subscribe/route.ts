import { NextResponse } from "next/server";
import { subscribe } from "@/lib/subscribe";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Expected a JSON body." }, { status: 400 });
  }

  const body = (payload ?? {}) as { email?: unknown; context?: unknown; website?: unknown };
  // Hidden field only a bot would fill in.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true, message: "You are on the list." });
  }

  const result = await subscribe(body, { context: body.context });
  return NextResponse.json(result.body, { status: result.status });
}
