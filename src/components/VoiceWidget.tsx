"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildClientTools,
  groundFromCurrentPage,
} from "@/lib/voice-agent/clientTools";
import { configureVoiceAgent } from "@/lib/voice-agent/config";
import {
  OpenAILiveSession,
  type LiveStatus,
} from "@/lib/voice-agent/live";

export interface VoiceWidgetProps {
  /** Overrides NEXT_PUBLIC_PROXY_BASE when provided. */
  proxyBase?: string;
  /** Overrides the enabled-by-default page-agent cursor and overlay. */
  enablePageAgentOverlay?: boolean;
}

export default function VoiceWidget({ proxyBase, enablePageAgentOverlay }: VoiceWidgetProps) {
  const [status, setStatus] = useState<LiveStatus>("disconnected");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [grounding, setGrounding] = useState(false);
  const [pageWorking, setPageWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<OpenAILiveSession | null>(null);
  const clientTools = useMemo(() => buildClientTools(), []);

  useEffect(() => {
    configureVoiceAgent({
      proxyBase: proxyBase ?? process.env.NEXT_PUBLIC_PROXY_BASE ?? "",
      enablePageAgentOverlay:
        enablePageAgentOverlay ?? process.env.NEXT_PUBLIC_PAGE_AGENT_OVERLAY !== "false",
    });
  }, [enablePageAgentOverlay, proxyBase]);

  useEffect(() => () => sessionRef.current?.disconnect(), []);

  useEffect(() => {
    const onPageWorking = (event: Event) => {
      setPageWorking(Boolean((event as CustomEvent<boolean>).detail));
    };
    window.addEventListener("sightspeak:page-working", onPageWorking);
    return () => window.removeEventListener("sightspeak:page-working", onPageWorking);
  }, []);

  async function connect() {
    if (status !== "disconnected") return;
    setError(null);
    const session = new OpenAILiveSession(clientTools, {
      onStatus: setStatus,
      onSpeaking: setIsSpeaking,
      onError: setError,
    });
    sessionRef.current = session;

    try {
      await session.connect();
      setGrounding(true);
      const context = await groundFromCurrentPage();
      if (context) session.sendContext(context);
    } catch {
      sessionRef.current = null;
    } finally {
      setGrounding(false);
    }
  }

  function disconnect() {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
  }

  const connected = status === "connected";
  const connecting = status === "connecting";
  let statusLabel = "Tap to talk";
  if (connecting) statusLabel = "Connecting…";
  if (connected) statusLabel = isSpeaking ? "Speaking" : "Listening";
  if (pageWorking) statusLabel = "Working on the page…";
  if (grounding) statusLabel = "Reading this page…";
  if (error) statusLabel = error;

  return (
    <div className="fixed bottom-5 right-5 z-[2147483000] flex items-center gap-3 font-sans">
      <div className="flex items-center gap-3">
        <span
          className={[
            "max-w-72 rounded-full px-3 py-1 text-xs font-medium shadow-lg backdrop-blur",
            error ? "bg-red-950/95 text-red-200" : "bg-zinc-900/90 text-zinc-300",
          ].join(" ")}
          title={error ?? undefined}
        >
          {statusLabel}
        </span>
        <button
          type="button"
          onClick={connected ? disconnect : connect}
          disabled={connecting}
          aria-label={connected ? "End voice session" : "Start voice session"}
          className={[
            "relative isolate flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-all active:scale-95 disabled:cursor-wait",
            connected
              ? isSpeaking
                ? "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400"
                : "bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500"
              : connecting
                ? "bg-gradient-to-br from-sky-400 to-indigo-600"
                : "bg-gradient-to-br from-cyan-400 to-teal-500 hover:brightness-110",
          ].join(" ")}
        >
          <WhisperWave active={connected || connecting} speaking={isSpeaking} />
        </button>
      </div>
    </div>
  );
}

function WhisperWave({ active, speaking }: { active: boolean; speaking: boolean }) {
  return (
    <span
      className="sightspeak-whisper-wave"
      data-active={active}
      data-speaking={speaking}
      aria-hidden="true"
    >
      <span className="sightspeak-whisper-halo sightspeak-whisper-halo-outer" />
      <span className="sightspeak-whisper-halo sightspeak-whisper-halo-inner" />
      <span className="sightspeak-whisper-bars">
        {Array.from({ length: 7 }, (_, index) => (
          <span
            key={index}
            className="sightspeak-whisper-bar"
            style={{ animationDelay: `${index * -0.11}s` }}
          />
        ))}
      </span>
    </span>
  );
}
