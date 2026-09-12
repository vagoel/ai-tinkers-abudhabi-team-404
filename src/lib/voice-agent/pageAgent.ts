/**
 * Thin wrapper around Alibaba's page-agent. page-agent is the "hands" of the
 * system: it reads the live DOM and performs clicks / typing / scrolling /
 * navigation via an OpenAI planning loop. OpenAI GPT-Live delegation decides when to call
 * it (see clientTools.ts), while the API key remains behind our server proxy.
 *
 * We run it headless: instead of the full `PageAgent` (which mounts a chat
 * panel), we build `PageAgentCore` + `PageController` directly. The animated
 * automation cursor stays visible, while indexed-element boxes remain hidden.
 *
 * page-agent touches `window`/`document`, so it is imported dynamically and
 * only ever instantiated in the browser.
 */
import { getVoiceAgentConfig } from "./config";
import type { PageAgentCore } from "@page-agent/core";
import { z } from "zod/v4";

let agentPromise: Promise<PageAgentCore> | null = null;

const HIDE_BOUNDING_BOXES_STYLE_ID = "sightspeak-hide-page-agent-bounding-boxes";

function hideBoundingBoxes() {
  document.getElementById(HIDE_BOUNDING_BOXES_STYLE_ID)?.remove();

  const style = document.createElement("style");
  style.id = HIDE_BOUNDING_BOXES_STYLE_ID;
  style.textContent = "#playwright-highlight-container{display:none!important}";
  document.head.appendChild(style);
}

const batchActionSchema = z.object({
  type: z.enum(["click", "input_text", "select_option"]),
  index: z.int().min(0),
  text: z.string().optional(),
});

async function createAgent(): Promise<PageAgentCore> {
  if (typeof window === "undefined") {
    throw new Error("page-agent can only run in the browser");
  }
  const { PageAgentCore, tool } = await import("@page-agent/core");
  const { PageController } = await import("@page-agent/page-controller");
  const cfg = getVoiceAgentConfig();
  hideBoundingBoxes();

  const batchActions = tool({
    description:
      "Perform 2-8 independent actions on controls that are all indexed in the current browser state. Prefer this for filling several visible fields or operating several static controls. Use the normal single action tools when one action reveals or replaces the next control.",
    inputSchema: z.object({ actions: z.array(batchActionSchema).min(2).max(8) }),
    execute: async function ({ actions }, { signal }) {
      const messages: string[] = [];

      for (const action of actions) {
        signal.throwIfAborted();
        const result =
          action.type === "click"
            ? await this.pageController.clickElement(action.index)
            : action.type === "input_text"
              ? await this.pageController.inputText(action.index, action.text ?? "")
              : await this.pageController.selectOption(action.index, action.text ?? "");
        messages.push(result.message);
        if (!result.success) break;
      }

      return messages.join("\n");
    },
  });

  const pageController = new PageController({
    enableMask: cfg.enablePageAgentOverlay,
    highlightOpacity: 0,
    highlightLabelOpacity: 0,
  });

  const agent = new PageAgentCore({
    model: cfg.pageAgent.model,
    baseURL: cfg.pageAgent.baseURL,
    apiKey: cfg.pageAgent.apiKey,
    language: cfg.language,
    pageController,
    stepDelay: 0,
    maxRetries: 1,
    maxSteps: 20,
    instructions: {
      system:
        "Complete the entire requested workflow before calling done. Prefer batchActions when two or more currently indexed controls can be operated without discovering new UI. Continue with normal actions after the page changes.",
    },
    customTools: { batchActions },
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
