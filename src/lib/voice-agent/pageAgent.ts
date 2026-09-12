/**
 * Thin wrapper around Alibaba's page-agent. page-agent is the "hands" of the
 * system: it reads the live DOM and performs clicks / typing / scrolling /
 * navigation via an OpenAI planning loop. OpenAI GPT-Live delegation decides when to call
 * it (see clientTools.ts), while the API key remains behind our server proxy.
 *
 * We run it headless: instead of the full `PageAgent` (which mounts a chat
 * panel), we build `PageAgentCore` + `PageController` directly. Its visual DOM
 * highlights and automation mask are controlled by a disabled-by-default flag.
 *
 * page-agent touches `window`/`document`, so it is imported dynamically and
 * only ever instantiated in the browser.
 */
import { getVoiceAgentConfig } from "./config";
import type { PageAgentCore } from "@page-agent/core";

let agentPromise: Promise<PageAgentCore> | null = null;

const HIDE_OVERLAY_STYLE_ID = "voicelayer-hide-page-agent-overlay";

function setOverlayVisibility(enabled: boolean) {
  document.getElementById(HIDE_OVERLAY_STYLE_ID)?.remove();
  if (enabled) return;

  const style = document.createElement("style");
  style.id = HIDE_OVERLAY_STYLE_ID;
  style.textContent = "#playwright-highlight-container{display:none!important}";
  document.head.appendChild(style);
}

async function createAgent(): Promise<PageAgentCore> {
  if (typeof window === "undefined") {
    throw new Error("page-agent can only run in the browser");
  }
  const { PageAgentCore } = await import("@page-agent/core");
  const { PageController } = await import("@page-agent/page-controller");
  const cfg = getVoiceAgentConfig();
  setOverlayVisibility(cfg.enablePageAgentOverlay);

  const pageController = new PageController({
    enableMask: cfg.enablePageAgentOverlay,
    highlightOpacity: cfg.enablePageAgentOverlay ? 0.25 : 0,
    highlightLabelOpacity: cfg.enablePageAgentOverlay ? 0.9 : 0,
  });

  const agent = new PageAgentCore({
    model: cfg.pageAgent.model,
    baseURL: cfg.pageAgent.baseURL,
    apiKey: cfg.pageAgent.apiKey,
    language: cfg.language,
    pageController,
  });
  return agent;
}

/** Lazily create (once) and return the shared page-agent instance. */
export function getPageAgent(): Promise<PageAgentCore> {
  if (!agentPromise) agentPromise = createAgent();
  return agentPromise;
}

/**
 * Run a natural-language instruction against the current page.
 * Returns a short, speakable summary of the outcome for the voice agent.
 */
export async function runPageCommand(instruction: string): Promise<string> {
  const agent = await getPageAgent();
  const result = await agent.execute(instruction);
  if (result.success) {
    return result.data?.trim() || "Done.";
  }
  return `I couldn't finish that. ${result.data?.trim() ?? ""}`.trim();
}
