# OpenAI GPT-Live voice-agent configuration

The OpenAI GPT-Live session is configured in `src/lib/server/openaiConfig.ts` so its frontend prompt, backend prompt, and function schemas are versioned with the application.

The voice session uses the exact `gpt-live-1` model with the `marin` voice. Both text-model paths use `gpt-5.6-luna` with reasoning effort set to `none`: Responses delegation selects the browser tools, and page-agent uses Luna through the server proxy to plan DOM actions.

The Responses backend exposes three browser-owned functions:

| Name | Required argument | Purpose |
| --- | --- | --- |
| `control_page` | `instruction` | Perform one concrete action on the current page |
| `read_site` | `query` | Retrieve relevant text from the current page |
| `search_web` | `query` | Search live web information through Exa |

Function calls arrive as nested GPT-Live `response.event` messages. Results are returned as `response.item.create` function outputs, followed by `response.create` so the assistant continues and speaks the result.
