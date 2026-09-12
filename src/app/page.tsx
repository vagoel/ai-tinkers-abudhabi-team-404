"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const CHROME_WEB_STORE_URL = process.env.NEXT_PUBLIC_CHROME_WEB_STORE_URL?.trim() ?? "";

function buildBookmarklet(origin: string): string {
  const inner = `if(window.__voiceWidgetMounted__){window.dispatchEvent(new Event('sightspeak:unmount'));return;}window.__VOICE_WIDGET__={proxyBase:'${origin}'};var s=document.createElement('script');s.src='${origin}/voice-widget.js?t='+Date.now();document.body.appendChild(s);`;
  return `javascript:(function(){${inner}})();`;
}

export default function Home() {
  // Read the browser origin without a set-state-in-effect (SSR snapshot = "").
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const [copied, setCopied] = useState(false);
  const bookmarklet = origin ? buildBookmarklet(origin) : "#";
  const bookmarkletRef = useRef<HTMLAnchorElement>(null);

  // React sanitizes javascript: href values. Setting the generated URL on the
  // element keeps the dragged bookmark intact without executing it on this page.
  useEffect(() => {
    if (bookmarkletRef.current && origin) {
      bookmarkletRef.current.setAttribute("href", bookmarklet);
    }
  }, [bookmarklet, origin]);

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
          SightSpeak
          <span className="mt-2 block text-zinc-300">Talk to any website.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          SightSpeak adds a voice-first accessibility assistant to any web page with
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
            Add SightSpeak to Chrome
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
            Add SightSpeak to Chrome
          </h2>
          <p className="mt-2 text-zinc-400">
            Choose the quick bookmark option or install the downloadable Chrome
            extension.
          </p>

          <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Option 1 · Quickest
            </p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-100">
              Drag SightSpeak to your bookmarks bar
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Drag the button below to your bookmarks bar. On a compatible
              website, click the bookmark to add SightSpeak and click it again
              to remove it.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <a
                ref={bookmarkletRef}
                href="#"
                onClick={(event) => event.preventDefault()}
                draggable
                className="cursor-grab select-none rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-5 py-3 font-semibold text-zinc-950 shadow-lg transition hover:brightness-110 active:cursor-grabbing"
                title="Drag SightSpeak to your bookmarks bar"
              >
                🎙 SightSpeak
              </a>
              <span className="text-sm text-zinc-500">← drag me to the bookmarks bar</span>
            </div>

            <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm leading-6 text-amber-100/70">
              Some protected sites, including ChatGPT, block bookmarklets from
              connecting to external services. If you see a Content Security
              Policy error, use the Chrome extension below.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-zinc-900/50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
              Option 2 · Works on protected sites
            </p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-100">
              Install the downloadable extension
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              We plan to publish SightSpeak in the Chrome Web Store. Store review
              and approval take time, so for now you can download the extension,
              extract it, and load it into Chrome manually.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-200/70">
              SightSpeak starts ON and automatically shows the voice button on
              supported tabs. Click its toolbar icon to turn it OFF or ON across
              the browser.
            </p>

            <a
              href={CHROME_WEB_STORE_URL || "/sightspeak-chrome-extension.zip"}
              download={CHROME_WEB_STORE_URL ? undefined : "sightspeak-chrome-extension.zip"}
              target={CHROME_WEB_STORE_URL ? "_blank" : undefined}
              rel={CHROME_WEB_STORE_URL ? "noreferrer" : undefined}
              className="mt-5 inline-flex rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3 font-semibold text-zinc-100 shadow-lg transition hover:border-zinc-500 hover:bg-zinc-700"
            >
              {CHROME_WEB_STORE_URL ? "Add to Chrome" : "Download Chrome extension"}
            </a>

            {!CHROME_WEB_STORE_URL && (
              <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 text-sm leading-7 text-zinc-400">
                <p className="font-medium text-zinc-200">Install the downloaded build:</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Download the ZIP file and extract it.</li>
                  <li>
                    Open{" "}
                    <a
                      href="chrome://extensions"
                      className="font-medium text-cyan-300 underline decoration-cyan-500/50 underline-offset-2 hover:text-cyan-200"
                    >
                      chrome://extensions
                    </a>
                    .
                  </li>
                  <li>Enable Developer mode and select Load unpacked.</li>
                  <li>Choose the unzipped <code className="text-cyan-200">chrome-extension</code> folder.</li>
                  <li>Pin SightSpeak; the <strong className="text-cyan-200">ON</strong> badge confirms automatic injection.</li>
                </ol>
              </div>
            )}
          </div>

          <div className="mt-12">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-300">
                Building a website? Embed SightSpeak directly
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
