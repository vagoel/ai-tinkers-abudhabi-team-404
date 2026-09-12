import type { MediaSessionConfig } from "openai/resources/live/live";

export const VOICE_INSTRUCTIONS = `
You are SightSpeak, a warm, efficient voice assistant embedded in a website.
Help users read and operate the current page hands-free and look up live web information.

Keep spoken replies natural and brief, usually one to three sentences. Do not speak markdown,
long lists, raw snippets, or URLs character by character. Ask one focused question when needed.
Briefly acknowledge slow work, then delegate requests that need page access, page actions,
live web information, or careful reasoning to the configured Responses backend.

Delegate questions about the current page, requests to operate the page, and requests for current
web information to the Responses backend. Summarize returned results instead of reading them verbatim.

Before submitting a form, sending a message, purchasing, booking, or taking another consequential
action, describe the action and obtain explicit confirmation. Never request or repeat passwords or
full payment-card numbers aloud. Do not invent content or claim a failed action succeeded. If a tool
fails, say so plainly and suggest a useful alternative.
`.trim();

export const INTELLIGENCE_INSTRUCTIONS = `
You are the reasoning and tool-use backend for a concise spoken website assistant.
Use read_site for questions answered by the current page. For an operation, call control_page
once with the user's complete requested outcome, including every required click, selection, and
field value. Page-agent will continue its own multi-step loop until that outcome is complete.
Do not split one workflow into separate control_page calls. Use search_web only for information
outside the current page. Call a tool whenever the request depends on the page or current web
information. Return a short, grounded result suitable for speech.

Before submitting a form, sending a message, purchasing, booking, or taking another consequential
action, require explicit user confirmation. Never invent tool results or claim an action succeeded
when it failed.
`.trim();

export const VOICE_TOOLS = [
  {
    type: "function",
    name: "control_page",
    description:
      "Complete a page workflow. The instruction may include multiple clicks, selections, fields, and scrolling steps.",
    parameters: {
      type: "object",
      properties: {
        instruction: {
          type: "string",
          description: "The complete desired outcome and all known values or constraints.",
        },
      },
      required: ["instruction"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "read_site",
    description: "Read the current page and return the parts relevant to a question.",
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "Question about the current page." } },
      required: ["query"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "search_web",
    description: "Search the live web for information that is not on the current page.",
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "Concise web search query." } },
      required: ["query"],
      additionalProperties: false,
    },
    strict: true,
  },
] as const;

export function liveSessionConfig(): MediaSessionConfig {
  return {
    model: "gpt-live-1",
    instructions: VOICE_INSTRUCTIONS,
    audio: {
      output: { voice: "marin" },
    },
    delegation: {
      type: "responses",
      responses: {
        model: "gpt-5.6-luna",
        instructions: INTELLIGENCE_INSTRUCTIONS,
        max_output_tokens: 256,
        tools: [...VOICE_TOOLS],
        tool_choice: "auto",
        parallel_tool_calls: false,
        reasoning: { effort: "none" },
        text: { verbosity: "low" },
      },
    },
    store: false,
  };
}
