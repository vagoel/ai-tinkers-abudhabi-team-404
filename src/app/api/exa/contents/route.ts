import { getExaContents } from "@/lib/server/exaClient";
import { json, preflight } from "@/lib/server/http";

export const runtime = "nodejs";

export function OPTIONS() {
  return preflight();
}

export async function POST(req: Request) {
  let body: { url?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url || !/^https?:\/\//i.test(url)) return json({ error: "A valid HTTP URL is required" }, 400);

  try {
    return json(await getExaContents(url));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Exa contents failed" }, 502);
  }
}
