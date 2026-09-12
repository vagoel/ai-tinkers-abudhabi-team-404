import { corsHeaders, json, preflight } from "@/lib/server/http";

export const runtime = "nodejs";

export function OPTIONS() {
  return preflight();
}

export async function POST(req: Request) {
  const apiKey = process.env.OPEN_AI_KEY;
  if (!apiKey) return json({ error: "OPEN_AI_KEY is not set" }, 503);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!Array.isArray(body.messages)) return json({ error: "Missing 'messages'" }, 400);

  // page-agent speaks the OpenAI Chat Completions protocol. Force the trusted
  // server-side model rather than allowing arbitrary models through this proxy.
  body.model = "gpt-5.6-luna";
  if (typeof body.max_tokens === "number" && body.max_completion_tokens === undefined) {
    body.max_completion_tokens = body.max_tokens;
    delete body.max_tokens;
  }
  body.reasoning_effort = "none";

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("OpenAI page-agent request failed", error);
    return json({ error: "Could not reach OpenAI" }, 502);
  }
}
