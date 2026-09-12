// Bundles the injectable voice widget into public/voice-widget.js (IIFE).
// Build-time public proxy config is baked in from env, and can
// still be overridden at runtime via window.__VOICE_WIDGET__ or data-* attrs.
import { build } from "esbuild";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Minimal .env loader so the bundle can bake in defaults without extra deps.
function loadEnv(file) {
  const path = resolve(root, file);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv(".env.local");
loadEnv(".env");

const proxyBase = process.env.NEXT_PUBLIC_PROXY_BASE ?? "";
const pageAgentOverlay = process.env.NEXT_PUBLIC_PAGE_AGENT_OVERLAY === "true";

await build({
  entryPoints: [resolve(root, "widget/index.ts")],
  outfile: resolve(root, "public/voice-widget.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  sourcemap: false,
  legalComments: "none",
  define: {
    __PROXY_BASE__: JSON.stringify(proxyBase),
    __PAGE_AGENT_OVERLAY__: JSON.stringify(pageAgentOverlay),
    "process.env.NODE_ENV": '"production"',
  },
  logLevel: "info",
});

// Some bundled dependency prompt strings contain end-of-line spaces. Normalize
// the generated artifact so Git whitespace checks remain useful.
const outputPath = resolve(root, "public/voice-widget.js");
writeFileSync(outputPath, readFileSync(outputPath, "utf8").replace(/[ \t]+(?=\r?$)/gm, ""));

console.log(
  `\nBuilt public/voice-widget.js (proxyBase=${proxyBase || "<script origin>"}, pageAgentOverlay=${pageAgentOverlay})`
);
