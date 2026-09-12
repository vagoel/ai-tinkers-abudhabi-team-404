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
    background: "linear-gradient(145deg, #22d3ee, #14b8a6)",
    boxShadow: "0 10px 30px rgba(6,182,212,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    isolation: "isolate",
    overflow: "visible",
    transition: "transform .1s ease, background .25s ease, box-shadow .25s ease",
  } as CSSStyleDeclaration);
  btn.setAttribute("aria-label", "Start voice session");

  const halos = ["-8px", "-3px"].map((inset) => {
    const halo = document.createElement("span");
    Object.assign(halo.style, {
      position: "absolute",
      inset,
      zIndex: "1",
      borderRadius: "999px",
      border: "1px solid rgba(103,232,249,0.65)",
      opacity: "0",
      pointerEvents: "none",
    } as CSSStyleDeclaration);
    return halo;
  });

  const wave = document.createElement("span");
  Object.assign(wave.style, {
    position: "relative",
    zIndex: "2",
    height: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    pointerEvents: "none",
  } as CSSStyleDeclaration);

  const baseScales = [0.28, 0.48, 0.72, 1, 0.72, 0.48, 0.28];
  const barAnimations = baseScales.map((baseScale, index) => {
    const bar = document.createElement("span");
    Object.assign(bar.style, {
      width: "3px",
      height: "24px",
      borderRadius: "999px",
      background: "rgba(255,255,255,0.96)",
      boxShadow: "0 0 7px rgba(255,255,255,0.35)",
      transform: `scaleY(${baseScale})`,
      transformOrigin: "center",
    } as CSSStyleDeclaration);
    wave.appendChild(bar);
    const animation = bar.animate(
      [
        { transform: `scaleY(${Math.max(0.22, baseScale * 0.55)})`, opacity: 0.65 },
        { transform: "scaleY(1)", opacity: 1, offset: 0.45 },
        { transform: `scaleY(${Math.max(0.38, baseScale * 0.72)})`, opacity: 0.82, offset: 0.7 },
        { transform: `scaleY(${Math.max(0.22, baseScale * 0.55)})`, opacity: 0.65 },
      ],
      {
        duration: 1050,
        delay: index * -110,
        easing: "ease-in-out",
        iterations: Infinity,
      }
    );
    animation.cancel();
    return animation;
  });

  const haloAnimations = halos.map((halo, index) => {
    const animation = halo.animate(
      [
        { opacity: 0, transform: "scale(0.82)" },
        { opacity: 0.38, offset: 0.45 },
        { opacity: 0, transform: "scale(1.42)" },
      ],
      {
        duration: 1800,
        delay: index * -900,
        easing: "ease-out",
        iterations: Infinity,
      }
    );
    animation.cancel();
    return animation;
  });

  function setWave(active: boolean, speaking = false) {
    const rate = speaking ? 1.75 : 1;
    for (const animation of [...barAnimations, ...haloAnimations]) {
      if (active) {
        animation.playbackRate = rate;
        animation.play();
      } else {
        animation.cancel();
      }
    }
  }

  btn.append(...halos, wave);

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
        btn.style.background = speaking
          ? "linear-gradient(145deg, #8b5cf6, #d946ef 52%, #22d3ee)"
          : "linear-gradient(145deg, #22d3ee, #3b82f6 52%, #8b5cf6)";
        btn.style.boxShadow = speaking
          ? "0 12px 36px rgba(217,70,239,0.5)"
          : "0 12px 36px rgba(59,130,246,0.45)";
        label.textContent = speaking ? "Speaking" : "Listening";
        btn.setAttribute("aria-label", "End voice session");
        setWave(true, speaking);
      } else if (state === "connecting") {
        btn.style.background = "linear-gradient(145deg, #38bdf8, #4f46e5)";
        label.textContent = "Connecting…";
        setWave(true);
      } else {
        btn.style.background = "linear-gradient(145deg, #22d3ee, #14b8a6)";
        btn.style.boxShadow = "0 10px 30px rgba(6,182,212,0.5)";
        label.textContent = "Tap to talk";
        btn.setAttribute("aria-label", "Start voice session");
        setWave(false);
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
      setWave(false);
    },
  };
}

function friendlyStartError(error: unknown): string {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Microphone permission is blocked.";
  }
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/failed to fetch|content security policy|security policy/i.test(message)) {
    return "This site blocks the bookmark. Use the SightSpeak Chrome extension.";
  }
  return message || "The voice session could not start.";
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

  function onPageWorking(event: Event) {
    if (status !== "connected") return;
    ui.setLabel(
      (event as CustomEvent<boolean>).detail ? "Working on the page…" : "Listening"
    );
  }
  window.addEventListener("sightspeak:page-working", onPageWorking);

  function stop() {
    session?.disconnect();
    session = null;
    ui.setState("idle");
  }

  function unmount() {
    stop();
    ui.root.remove();
    window.__voiceWidgetMounted__ = false;
    window.removeEventListener("sightspeak:unmount", unmount);
    window.removeEventListener("sightspeak:page-working", onPageWorking);
    if (window.__voiceWidgetUnmount__ === unmount) {
      delete window.__voiceWidgetUnmount__;
    }
  }

  window.__voiceWidgetUnmount__ = unmount;
  window.addEventListener("sightspeak:unmount", unmount);

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
        ui.setError(friendlyStartError(message));
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
      ui.setError(friendlyStartError(e));
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
