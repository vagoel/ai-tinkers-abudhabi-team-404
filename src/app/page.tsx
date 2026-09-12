"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

const CHROME_WEB_STORE_URL = process.env.NEXT_PUBLIC_CHROME_WEB_STORE_URL?.trim() ?? "";

export default function Home() {
  // Read the browser origin without a set-state-in-effect (SSR snapshot = "").
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const [copied, setCopied] = useState(false);

  const snippet = origin ? `<script src="${origin}/voice-widget.js"></script>` : "";

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
          AI Tinkerers Abu Dhabi
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Talk to any website.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          VoiceLayer adds a voice-first accessibility layer to any web page with
          one click. Speak to navigate, fill forms, and ask questions — the
          agent both <span className="text-zinc-200">acts on the page</span> and{" "}
          <span className="text-zinc-200">knows live web data</span>.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/demo"
            className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-zinc-950 shadow-lg transition hover:bg-cyan-400"
          >
            Try the live demo →
          </Link>
          <a
            href="#add"
            className="rounded-full border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 transition hover:border-zinc-500"
          >
            Get the Chrome extension
          </a>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <Pill
            title="OpenAI"
            body="GPT-Live voice with OpenAI intelligence. Speech in, speech out, and tool selection."
          />
          <Pill
            title="page-agent"
            body="The hands. Reads the live DOM and performs clicks, typing and navigation."
          />
          <Pill
            title="Exa"
            body="The knowledge. Searches and retrieves live web information on demand."
          />
        </div>

        <section id="add" className="mt-20 scroll-mt-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Add it to Chrome
          </h2>
          <p className="mt-2 text-zinc-400">
            Install the extension, pin VoiceLayer, then click its toolbar icon on
            any page to add or remove the GPT-Live assistant.
          </p>

          <div className="mt-6">
            <a
              href={CHROME_WEB_STORE_URL || "/voicelayer-chrome-extension.zip"}
              download={CHROME_WEB_STORE_URL ? undefined : "voicelayer-chrome-extension.zip"}
              target={CHROME_WEB_STORE_URL ? "_blank" : undefined}
              rel={CHROME_WEB_STORE_URL ? "noreferrer" : undefined}
              className="inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-6 py-3 font-semibold text-zinc-950 shadow-lg transition hover:brightness-110"
            >
              {CHROME_WEB_STORE_URL ? "Add to Chrome" : "Download Chrome extension"}
            </a>

            {!CHROME_WEB_STORE_URL && (
              <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm leading-7 text-zinc-400">
                <p className="font-medium text-zinc-200">Install this local build:</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Download and unzip the extension.</li>
                  <li>Open <code className="text-cyan-200">chrome://extensions</code>.</li>
                  <li>Enable Developer mode and select Load unpacked.</li>
                  <li>Choose the unzipped <code className="text-cyan-200">chrome-extension</code> folder.</li>
                </ol>
                <p className="mt-3 text-zinc-500">
                  Direct installation becomes available after publishing it in the Chrome Web Store.
                </p>
              </div>
            )}
          </div>

          <div className="mt-10">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-300">
                Or paste this into your own site
              </h3>
              <button
                onClick={copySnippet}
                className="rounded-md border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-500"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-cyan-100">
              <code>{snippet || "Loading…"}</code>
            </pre>
          </div>
        </section>

        <footer className="mt-24 border-t border-zinc-800 pt-8 text-sm text-zinc-500">
          Built for the{" "}
          <a
            href="https://abu-dhabi.aitinkerers.org/p/agents-everywhere-bots-channels-more-global-hackathon"
            className="text-zinc-400 underline hover:text-zinc-200"
          >
            AI Tinkerers Abu Dhabi Agents Everywhere Hackathon
          </a>{" "}
          with OpenAI, Exa, and page-agent.
        </footer>
      </div>
    </main>
  );
}

function Pill({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h3 className="font-semibold text-cyan-300">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
    </div>
  );
}
