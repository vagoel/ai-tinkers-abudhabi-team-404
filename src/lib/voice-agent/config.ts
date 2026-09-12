/** Shared public runtime configuration for the demo and injectable widget. */

export interface PageAgentLLM {
  model: string;
  baseURL: string;
  apiKey: string;
}

export interface VoiceAgentConfig {
  /** Absolute origin hosting the server proxies. Empty means same origin. */
  proxyBase: string;
  /** OpenAI-compatible endpoint used by page-agent. */
  pageAgent: PageAgentLLM;
  /** Show page-agent's animated automation cursor; DOM bounding boxes stay hidden. */
  enablePageAgentOverlay: boolean;
  language: "en-US";
}

const defaults: VoiceAgentConfig = {
  proxyBase: "",
  pageAgent: {
    model: "gpt-5.6-terra",
    baseURL: "/api/openai",
    apiKey: "server-proxy",
  },
  enablePageAgentOverlay: true,
  language: "en-US",
};

let current: VoiceAgentConfig = { ...defaults, pageAgent: { ...defaults.pageAgent } };

export function configureVoiceAgent(patch: Partial<VoiceAgentConfig>): void {
  current = {
    ...current,
    ...patch,
    pageAgent: { ...current.pageAgent, ...(patch.pageAgent ?? {}) },
  };
  if (!patch.pageAgent?.baseURL) current.pageAgent.baseURL = proxyUrl("/api/openai");
}

export function getVoiceAgentConfig(): VoiceAgentConfig {
  return current;
}

export function proxyUrl(path: string): string {
  const base = current.proxyBase.replace(/\/$/, "");
  return `${base}${path}`;
}
