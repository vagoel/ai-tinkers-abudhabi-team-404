import OpenAI from "openai";
import { corsHeaders, preflight } from "@/lib/server/http";
import { liveSessionConfig } from "@/lib/server/openaiConfig";

export const runtime = "nodejs";

export function OPTIONS() {
  return preflight();
}

export async function POST(req: Request) {
  const apiKey = process.env.OPEN_AI_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPEN_AI_KEY is not set" },
      { status: 503, headers: corsHeaders }
    );
  }

  let sdp: unknown;
  try {
    const body = (await req.json()) as { sdp?: unknown };
    sdp = body.sdp;
  } catch {
    return Response.json(
      { error: "A JSON body with an SDP offer is required" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (typeof sdp !== "string" || !sdp.trim() || sdp.length > 100_000) {
    return Response.json(
      { error: "A valid SDP offer is required" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const client = new OpenAI({ apiKey, maxRetries: 0 });
    const result = await client.live.create({
      session: liveSessionConfig(),
      transport: { type: "webrtc", sdp },
    });
    return Response.json(result, { status: 201, headers: corsHeaders });
  } catch (error) {
    const status = error instanceof OpenAI.APIError ? error.status : undefined;
    console.error("OpenAI GPT-Live session failed", status ?? "network error");
    return Response.json(
      { error: `OpenAI GPT-Live session failed${status ? ` (${status})` : ""}` },
      { status: status && status >= 400 && status < 500 ? status : 502, headers: corsHeaders }
    );
  }
}
