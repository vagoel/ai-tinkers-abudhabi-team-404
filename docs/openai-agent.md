# OpenAI GPT-Live voice-agent configuration

The OpenAI GPT-Live session is configured in `src/lib/server/openaiConfig.ts` so its frontend prompt, backend prompt, and function schemas are versioned with the application.

The voice session uses the exact `gpt-live-1` model with the `marin` voice. Its Responses delegation uses `gpt-5.6-terra` by default; set `OPENAI_INTELLIGENCE_MODEL` to use another compatible Responses model. Page-agent also uses `gpt-5.6-terra` through the server proxy; set `OPENAI_PAGE_AGENT_MODEL` to override it with a compatible Chat Completions model.

The Responses backend exposes three browser-owned functions:

| Name | Required argument | Purpose |
| --- | --- | --- |
| `control_page` | `instruction` | Perform one concrete action on the current page |
| `read_site` | `query` | Retrieve relevant text from the current page |
| `search_web` | `query` | Search live web information through Exa |

Function calls arrive as nested GPT-Live `response.event` messages. Results are returned as `response.item.create` function outputs, followed by `response.create` so the assistant continues and speaks the result.
