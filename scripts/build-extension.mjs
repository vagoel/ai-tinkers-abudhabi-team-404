import { build } from "esbuild";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  const path = resolve(root, file);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv(".env.local");
loadEnv(".env");

const configuredProxy =
  process.env.EXTENSION_PROXY_BASE ||
  process.env.NEXT_PUBLIC_PROXY_BASE ||
  "http://localhost:3000";
const pageAgentOverlay = process.env.NEXT_PUBLIC_PAGE_AGENT_OVERLAY === "true";

let proxyOrigin;
try {
  const url = new URL(configuredProxy);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  proxyOrigin = url.origin;
} catch {
  throw new Error("EXTENSION_PROXY_BASE must be an absolute HTTP or HTTPS URL.");
}

const distRoot = resolve(root, "dist");
const extensionRoot = resolve(distRoot, "chrome-extension");
const zipPath = resolve(distRoot, "voicelayer-chrome-extension.zip");
const publicZipPath = resolve(root, "public", "voicelayer-chrome-extension.zip");

rmSync(extensionRoot, { recursive: true, force: true });
rmSync(zipPath, { force: true });
mkdirSync(extensionRoot, { recursive: true });

const chromeSafePageController = {
  name: "chrome-safe-page-controller",
  setup(buildContext) {
    buildContext.onLoad(
      { filter: /@page-agent\/page-controller\/dist\/lib\/page-controller\.js$/ },
      ({ path }) => {
        const source = readFileSync(path, "utf8");
        const methodStart = source.indexOf("\tasync executeJavascript(script, signal) {");
        const methodEnd = source.indexOf("\n\t/**\n\t* Show the visual mask overlay.", methodStart);
        if (methodStart < 0 || methodEnd < 0) {
          throw new Error("Could not disable page-agent's JavaScript executor for Chrome.");
        }
        const replacement = [
          "\tasync executeJavascript() {",
          "\t\treturn {",
          "\t\t\tsuccess: false,",
          "\t\t\tmessage: 'Arbitrary JavaScript execution is disabled in the Chrome extension.'",
          "\t\t};",
          "\t}",
        ].join("\n");
        return {
          contents: `${source.slice(0, methodStart)}${replacement}${source.slice(methodEnd)}`,
          loader: "js",
        };
      }
    );
  },
};

await build({
  entryPoints: [resolve(root, "widget/index.ts")],
  outfile: resolve(extensionRoot, "voice-widget.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome120"],
  minify: true,
  sourcemap: false,
  legalComments: "none",
  plugins: [chromeSafePageController],
  define: {
    __PROXY_BASE__: JSON.stringify(proxyOrigin),
    __PAGE_AGENT_OVERLAY__: JSON.stringify(pageAgentOverlay),
    "process.env.NODE_ENV": '"production"',
  },
  logLevel: "info",
});

const widgetPath = resolve(extensionRoot, "voice-widget.js");
writeFileSync(
  widgetPath,
  readFileSync(widgetPath, "utf8").replace(/[ \t]+(?=\r?$)/gm, "")
);

const hostPermission = `${proxyOrigin}/*`;
const manifest = readFileSync(resolve(root, "extension", "manifest.template.json"), "utf8")
  .replace("__VOICE_PROXY_HOST_PERMISSION__", hostPermission);
writeFileSync(resolve(extensionRoot, "manifest.json"), manifest);

const worker = readFileSync(resolve(root, "extension", "service-worker.template.js"), "utf8")
  .replace(JSON.stringify("__VOICE_PROXY_BASE__"), JSON.stringify(proxyOrigin));
writeFileSync(resolve(extensionRoot, "service-worker.js"), worker);
copyFileSync(resolve(root, "extension", "README.md"), resolve(extensionRoot, "README.md"));

const archive = spawnSync("zip", ["-qr", zipPath, "chrome-extension"], {
  cwd: distRoot,
  stdio: "inherit",
});
if (archive.status !== 0) throw new Error("Could not create the Chrome extension ZIP archive.");
copyFileSync(zipPath, publicZipPath);

console.log(`\nBuilt Chrome extension for ${proxyOrigin} (pageAgentOverlay=${pageAgentOverlay})`);
console.log(`Folder: ${extensionRoot}`);
console.log(`ZIP: ${zipPath}`);
