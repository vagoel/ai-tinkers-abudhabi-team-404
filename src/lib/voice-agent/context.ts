/** Live web data via Exa, always through our server so EXA_KEY stays private. */
import { proxyUrl } from "./config";

export interface PageContents {
  url: string;
  text: string;
}

export interface WebSearchHit {
  title?: string;
  url?: string;
  snippet?: string;
  text?: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(proxyUrl(path), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/** Fetch a URL's readable contents through Exa. */
export async function getPageContents(url: string): Promise<PageContents> {
  return postJson<PageContents>("/api/exa/contents", { url });
}

/** Search the live web and return ranked results (optionally scraped). */
export async function searchWeb(
  query: string,
  numResults = 10
): Promise<WebSearchHit[]> {
  const data = await postJson<{ results: WebSearchHit[] }>(
    "/api/exa/search",
    { query, numResults }
  );
  return data.results ?? [];
}

/** Compact a list of search hits into a short, speakable summary for the agent. */
export function formatHitsForSpeech(hits: WebSearchHit[], max = 4): string {
  if (hits.length === 0) return "No results found.";
  return hits
    .slice(0, max)
    .map((h, i) => {
      const title = h.title ?? h.url ?? `Result ${i + 1}`;
      const body = (h.snippet ?? h.text ?? "").replace(/\s+/g, " ").trim();
      return `${i + 1}. ${title}: ${body.slice(0, 240)}`;
    })
    .join("\n");
}
