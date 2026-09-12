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
  type TranscriptRole,
} from "@/lib/voice-agent/live";

export interface VoiceWidgetProps {
  /** Overrides NEXT_PUBLIC_PROXY_BASE when provided. */
  proxyBase?: string;
  /** Overrides the disabled-by-default page-agent overlay feature flag. */
  enablePageAgentOverlay?: boolean;
}

type TranscriptEntry = { role: TranscriptRole; text: string };

export default function VoiceWidget({ proxyBase, enablePageAgentOverlay }: VoiceWidgetProps) {
  const [status, setStatus] = useState<LiveStatus>("disconnected");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [grounding, setGrounding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<OpenAILiveSession | null>(null);
  const clientTools = useMemo(() => buildClientTools(), []);

  useEffect(() => {
    configureVoiceAgent({
      proxyBase: proxyBase ?? process.env.NEXT_PUBLIC_PROXY_BASE ?? "",
      enablePageAgentOverlay:
        enablePageAgentOverlay ?? process.env.NEXT_PUBLIC_PAGE_AGENT_OVERLAY === "true",
    });
  }, [enablePageAgentOverlay, proxyBase]);

  useEffect(() => () => sessionRef.current?.disconnect(), []);

  async function connect() {
    if (status !== "disconnected") return;
    setError(null);
    const session = new OpenAILiveSession(clientTools, {
      onStatus: setStatus,
      onSpeaking: setIsSpeaking,
      onError: setError,
      onTranscript: (role, text) => {
        setTranscript((previous) => [...previous, { role, text }].slice(-8));
      },
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
  const statusLabel = grounding
    ? "Reading this page…"
    : connected
      ? isSpeaking
        ? "Speaking"
        : "Listening"
      : connecting
        ? "Connecting…"
        : "Tap to talk";

  return (
    <div className="fixed bottom-5 right-5 z-[2147483000] flex flex-col items-end gap-3 font-sans">
      {(transcript.length > 0 || error) && connected && (
        <div className="max-h-72 w-80 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900/95 p-4 text-sm text-zinc-100 shadow-2xl backdrop-blur">
          {error && (
            <p className="mb-2 rounded-lg bg-red-500/15 px-3 py-2 text-red-300">{error}</p>
          )}
          <ul className="flex flex-col gap-2">
            {transcript.map((entry, index) => (
              <li
                key={`${entry.role}-${index}`}
                className={
                  entry.role === "user"
                    ? "self-end rounded-2xl rounded-br-sm bg-cyan-500/20 px-3 py-2 text-cyan-50"
                    : "self-start rounded-2xl rounded-bl-sm bg-white/5 px-3 py-2 text-zinc-200"
                }
              >
                {entry.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && !connected && (
        <p className="max-w-xs rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300 shadow-lg">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <span className="rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-medium text-zinc-300 shadow-lg backdrop-blur">
          {statusLabel}
        </span>
        <button
          type="button"
          onClick={connected ? disconnect : connect}
          disabled={connecting}
          aria-label={connected ? "End voice session" : "Start voice session"}
          className={[
            "relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-transform active:scale-95 disabled:cursor-wait disabled:opacity-70",
            connected ? "bg-red-500 hover:bg-red-400" : "bg-cyan-500 hover:bg-cyan-400",
          ].join(" ")}
        >
          {connected && (
            <span
              className={[
                "absolute inset-0 rounded-full",
                isSpeaking ? "animate-ping bg-red-400/40" : "animate-pulse bg-red-400/20",
              ].join(" ")}
            />
          )}
          <MicIcon muted={connected} />
        </button>
      </div>
    </div>
  );
}

function MicIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="relative h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      {muted && <line x1="3" y1="3" x2="21" y2="21" className="text-white" />}
    </svg>
  );
}
