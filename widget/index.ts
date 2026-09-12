/**
 * Injectable voice widget — the "add to any website" build.
 *
 * This is the framework-agnostic sibling of src/components/VoiceWidget.tsx.
 * It shares the same OpenAI GPT-Live session and tools (page-agent + Exa) via
 * src/lib/voice-agent, but renders a self-contained,
 * inline-styled mic button so it survives on any host page's CSS.
 *
 * Config resolution order (proxy base):
 *   1. window.__VOICE_WIDGET__ set by the loader/bookmarklet
 *   2. data-* attributes on the injected <script> tag
 *   3. build-time defaults baked in by scripts/build-widget.mjs
 * The proxy base defaults to the origin that served this script.
 */
import { configureVoiceAgent } from "../src/lib/voice-agent/config";
import {
  buildClientTools,
  groundFromCurrentPage,
} from "../src/lib/voice-agent/clientTools";
import {
  OpenAILiveSession,
  type LiveStatus,
} from "../src/lib/voice-agent/live";

// Injected at build time by esbuild (see scripts/build-widget.mjs).
declare const __PROXY_BASE__: string;
declare const __PAGE_AGENT_OVERLAY__: boolean;

type WidgetGlobal = { proxyBase?: string; pageAgentOverlay?: boolean };
declare global {
  interface Window {
    __VOICE_WIDGET__?: WidgetGlobal;
    __voiceWidgetMounted__?: boolean;
    __voiceWidgetUnmount__?: () => void;
  }
}

function scriptOrigin(): string {
  const el = document.currentScript as HTMLScriptElement | null;
  try {
    if (el?.src) return new URL(el.src).origin;
  } catch {
    /* ignore */
  }
  return "";
}

function resolveConfig() {
  const el = document.currentScript as HTMLScriptElement | null;
  const g = window.__VOICE_WIDGET__ ?? {};
  const proxyBase =
    g.proxyBase || el?.dataset.proxyBase || __PROXY_BASE__ || scriptOrigin();
  const pageAgentOverlay =
    g.pageAgentOverlay ??
    (el?.dataset.pageAgentOverlay === undefined
      ? __PAGE_AGENT_OVERLAY__
      : el.dataset.pageAgentOverlay === "true");
  return { proxyBase, pageAgentOverlay };
}

// --- minimal inline-styled UI ----------------------------------------------

type UIState = "idle" | "connecting" | "connected";

function createUI() {
  const root = document.createElement("div");
  root.setAttribute("data-voice-widget", "");
  Object.assign(root.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "2147483000",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  } as CSSStyleDeclaration);

  const label = document.createElement("span");
  Object.assign(label.style, {
    padding: "5px 12px",
    borderRadius: "999px",
    background: "rgba(24,24,27,0.92)",
    color: "#e4e4e7",
    fontSize: "12px",
    fontWeight: "500",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
  } as CSSStyleDeclaration);
  label.textContent = "Tap to talk";

  const btn = document.createElement("button");
  Object.assign(btn.style, {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    background: "#06b6d4",
    boxShadow: "0 10px 30px rgba(6,182,212,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform .1s ease, background .2s ease",
  } as CSSStyleDeclaration);
  btn.setAttribute("aria-label", "Start voice session");
  btn.innerHTML = micSvg();

  root.appendChild(label);
  root.appendChild(btn);
  document.body.appendChild(root);

  return {
    root,
    btn,
    setState(state: UIState, speaking = false) {
      label.style.color = "#e4e4e7";
      label.style.background = "rgba(24,24,27,0.92)";
      label.removeAttribute("title");
      if (state === "connected") {
        btn.style.background = speaking ? "#ef4444" : "#f97316";
        label.textContent = speaking ? "Speaking" : "Listening";
        btn.setAttribute("aria-label", "End voice session");
      } else if (state === "connecting") {
        btn.style.background = "#0891b2";
        label.textContent = "Connecting…";
      } else {
        btn.style.background = "#06b6d4";
        label.textContent = "Tap to talk";
        btn.setAttribute("aria-label", "Start voice session");
      }
    },
    setLabel(text: string) {
      label.textContent = text;
    },
    setError(message: string) {
      label.textContent = message.length > 52 ? `${message.slice(0, 49)}…` : message;
      label.title = message;
      label.style.color = "#fecaca";
      label.style.background = "rgba(127,29,29,0.94)";
    },
  };
}

function micSvg(): string {
  return `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`;
}

// --- lifecycle --------------------------------------------------------------

async function mount() {
  if (window.__voiceWidgetMounted__) return;
  window.__voiceWidgetMounted__ = true;

  const cfg = resolveConfig();
  configureVoiceAgent({
    proxyBase: cfg.proxyBase,
    enablePageAgentOverlay: cfg.pageAgentOverlay,
  });

  const ui = createUI();
  let session: OpenAILiveSession | null = null;
  let status: LiveStatus = "disconnected";

  function stop() {
    session?.disconnect();
    session = null;
    ui.setState("idle");
  }

  function unmount() {
    stop();
    ui.root.remove();
    window.__voiceWidgetMounted__ = false;
    window.removeEventListener("voicelayer:unmount", unmount);
    if (window.__voiceWidgetUnmount__ === unmount) {
      delete window.__voiceWidgetUnmount__;
    }
  }

  window.__voiceWidgetUnmount__ = unmount;
  window.addEventListener("voicelayer:unmount", unmount);

  async function start() {
    if (status !== "disconnected") return;
    session = new OpenAILiveSession(buildClientTools(), {
      onStatus: (next) => {
        status = next;
        ui.setState(next === "disconnected" ? "idle" : next);
        if (next === "disconnected") session = null;
      },
      onSpeaking: (speaking) => {
        if (status === "connected") ui.setState("connected", speaking);
      },
      onError: (message) => {
        console.error("[voice-widget]", message);
        ui.setError(message);
      },
    });
    try {
      await session.connect();
      ui.setLabel("Reading this page…");
      const context = await groundFromCurrentPage();
      if (context) session.sendContext(context);
      ui.setState("connected");
    } catch (e) {
      console.error("[voice-widget] start failed", e);
      ui.setState("idle");
      ui.setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Microphone permission is blocked."
          : e instanceof Error
            ? e.message
            : "The voice session could not start."
      );
    }
  }

  ui.btn.addEventListener("click", () => {
    if (session) stop();
    else void start();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => void mount());
} else {
  void mount();
}
