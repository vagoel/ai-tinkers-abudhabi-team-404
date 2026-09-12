/**
 * The bridge between OpenAI GPT-Live's Responses delegation and the current page.
 *
 * The delegated OpenAI intelligence model invokes three browser-owned tools:
 *   - control_page: do things (navigate/click/fill) via page-agent
 *   - search_web:   pull live web data via Exa
 *   - read_site:    answer questions from the current page (scraped on connect)
 *
 * Both the demo app and injectable widget share this implementation.
 */
import { runPageCommand } from "./pageAgent";
import { searchWeb, formatHitsForSpeech } from "./context";

export type ClientToolFn = (
  params: Record<string, unknown>
) => Promise<string | number | void> | string | number | void;
export type ClientToolMap = Record<string, ClientToolFn>;

// --- current-page grounding -------------------------------------------------

let siteContext = "";

export function setSiteContext(markdown: string): void {
  siteContext = markdown ?? "";
}

export function getSiteContext(): string {
  return siteContext;
}

/** Return the paragraphs of the scraped page most relevant to `query`. */
function relevantSlice(query: string, max = 1600): string {
  const text = siteContext;
  if (!text) return "The page content has not been loaded yet.";
  const q = query.trim().toLowerCase();
  if (!q) return text.slice(0, max);

  const terms = q.split(/\W+/).filter((t) => t.length > 2);
  const paragraphs = text.split(/\n{2,}/);
  const scored = paragraphs
    .map((p) => {
      const lower = p.toLowerCase();
      const score = terms.reduce(
        (s, t) => s + (lower.includes(t) ? 1 : 0),
        0
      );
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const picked = (scored.length ? scored.map((x) => x.p) : paragraphs).join(
    "\n\n"
  );
  return picked.slice(0, max);
}

/** Extract clean, readable text from the page we're already running inside. */
function readablePageText(): string {
  const title = document.title ? `# ${document.title}\n\n` : "";
  const body = document.body?.innerText ?? "";
  return (title + body)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Read the current page's DOM and store it as grounding context.
 * We read the live DOM directly because the widget is
 * already inside the page — this is instant, free, and works on localhost and
 * on any injected site. Exa is used for off-page live data (search_web).
 * Returns a short contextual update for OpenAI GPT-Live, or null.
 */
export async function groundFromCurrentPage(): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }
  try {
    const text = readablePageText();
    setSiteContext(text);
    const preview = text.replace(/\s+/g, " ").slice(0, 1500);
    return `The user is on ${window.location.href}. Page content (excerpt): ${preview}`;
  } catch (err) {
    console.warn("[voice-agent] grounding failed:", err);
    return null;
  }
}

// --- the tools --------------------------------------------------------------

export function buildClientTools(): ClientToolMap {
  return {
    control_page: async ({ instruction }) => {
      const text = String(instruction ?? "").trim();
      if (!text) return "No instruction was provided.";
      const result = await runPageCommand(text);
      // Page actions can reveal or change content, so keep read_site current.
      await groundFromCurrentPage();
      return result;
    },

    search_web: async ({ query }) => {
      const q = String(query ?? "").trim();
      if (!q) return "No search query was provided.";
      const hits = await searchWeb(q);
      return formatHitsForSpeech(hits);
    },

    read_site: async ({ query }) => {
      return relevantSlice(String(query ?? ""));
    },
  };
}
