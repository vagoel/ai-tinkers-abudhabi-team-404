const EXA_BASE_URL = "https://api.exa.ai";

function exaHeaders(): Record<string, string> {
  const key = process.env.EXA_KEY;
  if (!key) throw new Error("EXA_KEY is not set");
  return { "x-api-key": key, "content-type": "application/json" };
}

export interface ExaHit {
  title?: string;
  url?: string;
  snippet?: string;
  text?: string;
}

interface RawExaHit {
  title?: string;
  url?: string;
  text?: string;
  highlights?: string[];
  summary?: string;
}

async function exaPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${EXA_BASE_URL}${path}`, {
    method: "POST",
    headers: exaHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Exa request failed (${response.status}): ${detail}`);
  }
  return (await response.json()) as T;
}

export async function searchExa(query: string, numResults = 8): Promise<ExaHit[]> {
  const data = await exaPost<{ results?: RawExaHit[] }>("/search", {
    query,
    type: "auto",
    numResults: Math.min(10, Math.max(1, numResults)),
    contents: { text: true },
  });
  return (data.results ?? []).map((hit) => ({
    title: hit.title,
    url: hit.url,
    snippet: hit.summary ?? hit.highlights?.join(" ") ?? hit.text?.slice(0, 1200),
    text: hit.text,
  }));
}

export async function getExaContents(url: string): Promise<{ url: string; text: string }> {
  const data = await exaPost<{ results?: RawExaHit[] }>("/contents", {
    urls: [url],
    text: true,
  });
  return { url, text: data.results?.[0]?.text ?? "" };
}
