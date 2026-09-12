import { searchExa } from "@/lib/server/exaClient";
import { json, preflight } from "@/lib/server/http";

export const runtime = "nodejs";

export function OPTIONS() {
  return preflight();
}

export async function POST(req: Request) {
  let body: { query?: unknown; numResults?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) return json({ error: "Missing 'query'" }, 400);
  const numResults = typeof body.numResults === "number" ? body.numResults : 8;

  try {
    return json({ results: await searchExa(query, numResults) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Exa search failed" }, 502);
  }
}
