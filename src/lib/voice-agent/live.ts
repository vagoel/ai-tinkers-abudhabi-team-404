import { proxyUrl } from "./config";
import type { ClientToolMap } from "./clientTools";

export type LiveStatus = "disconnected" | "connecting" | "connected";
export type TranscriptRole = "user" | "agent";

export interface LiveCallbacks {
  onStatus?: (status: LiveStatus) => void;
  onSpeaking?: (speaking: boolean) => void;
  onTranscript?: (role: TranscriptRole, text: string) => void;
  onError?: (message: string) => void;
}

interface FunctionCallItem {
  type?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
}

interface NestedResponseEvent {
  type?: string;
  item?: FunctionCallItem;
}

interface LiveEvent {
  type?: string;
  delta?: string;
  event?: NestedResponseEvent;
  error?: { message?: string };
}

interface LiveSessionResponse {
  session?: { id?: string };
  transport?: { type?: string; sdp?: string };
  error?: string;
}

const CONNECTION_TIMEOUT_MS = 15_000;
const TRANSCRIPT_GAP_MS = 700;

export class OpenAILiveSession {
  private peer: RTCPeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private microphone: MediaStream | null = null;
  private audio: HTMLAudioElement | null = null;
  private handledCalls = new Set<string>();
  private status: LiveStatus = "disconnected";
  private startedResolve: (() => void) | null = null;
  private startedReject: ((reason: Error) => void) | null = null;
  private transcriptBuffers: Record<TranscriptRole, string> = { user: "", agent: "" };
  private transcriptTimers: Partial<Record<TranscriptRole, ReturnType<typeof setTimeout>>> = {};
  private speakingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly tools: ClientToolMap,
    private readonly callbacks: LiveCallbacks = {}
  ) {}

  get connected(): boolean {
    return this.status === "connected";
  }

  async connect(): Promise<void> {
    if (this.status !== "disconnected") return;
    this.setStatus("connecting");

    try {
      const peer = new RTCPeerConnection();
      this.peer = peer;

      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.setAttribute("playsinline", "");
      audio.style.display = "none";
      document.body.appendChild(audio);
      this.audio = audio;
      peer.addEventListener("track", (event) => {
        audio.srcObject = event.streams[0] ?? new MediaStream([event.track]);
        void audio.play().catch((error: unknown) => {
          // Chrome can transiently abort play() while the remote WebRTC track is
          // attaching. That does not mean the Live session failed.
          if (error instanceof DOMException && error.name === "AbortError") return;
          this.callbacks.onError?.("Audio playback is blocked. Allow sound for this site.");
        });
      });

      this.microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of this.microphone.getAudioTracks()) {
        peer.addTrack(track, this.microphone);
      }

      const channel = peer.createDataChannel("oai-events");
      this.channel = channel;
      channel.addEventListener("message", (event) => this.handleMessage(event));
      channel.addEventListener("close", () => this.cleanup());

      const opened = this.waitForChannelOpen(channel);
      const started = this.waitForSessionStarted();
      void opened.catch(() => undefined);
      void started.catch(() => undefined);

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await this.waitForIceGathering(peer);
      const sdp = peer.localDescription?.sdp;
      if (!sdp) throw new Error("The browser did not create a voice connection offer.");

      const response = await fetch(proxyUrl("/api/openai/live"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sdp }),
      });
      const result = (await response.json()) as LiveSessionResponse;
      if (!response.ok) {
        throw new Error(result.error || `OpenAI GPT-Live failed (${response.status})`);
      }
      if (result.transport?.type !== "webrtc" || !result.transport.sdp) {
        throw new Error("OpenAI GPT-Live returned an invalid WebRTC answer.");
      }

      await peer.setRemoteDescription({ type: "answer", sdp: result.transport.sdp });
      await Promise.all([opened, started]);
      this.setStatus("connected");
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone permission is required to talk."
          : error instanceof Error
            ? error.message
            : "Could not start the GPT-Live voice session.";
      this.callbacks.onError?.(message);
      this.cleanup();
      throw error;
    }
  }

  sendContext(text: string): void {
    const content = text.trim();
    if (!content) return;
    this.send({
      type: "session.thinking.append",
      event_id: this.eventId("page_context"),
      delegation_id: null,
      content: content.slice(0, 2_000),
    });
  }

  disconnect(): void {
    if (this.channel?.readyState === "open") {
      this.send({ type: "session.close", event_id: this.eventId("close") });
    }
    this.cleanup();
  }

  private waitForChannelOpen(channel: RTCDataChannel): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Timed out opening the GPT-Live event channel.")),
        CONNECTION_TIMEOUT_MS
      );
      channel.addEventListener(
        "open",
        () => {
          clearTimeout(timeout);
          resolve();
        },
        { once: true }
      );
      channel.addEventListener(
        "error",
        () => {
          clearTimeout(timeout);
          reject(new Error("The GPT-Live event channel failed."));
        },
        { once: true }
      );
    });
  }

  private waitForSessionStarted(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.startedResolve = null;
        this.startedReject = null;
        reject(new Error("Timed out waiting for GPT-Live to start."));
      }, CONNECTION_TIMEOUT_MS);
      this.startedResolve = () => {
        clearTimeout(timeout);
        this.startedResolve = null;
        this.startedReject = null;
        resolve();
      };
      this.startedReject = (error) => {
        clearTimeout(timeout);
        this.startedResolve = null;
        this.startedReject = null;
        reject(error);
      };
    });
  }

  private waitForIceGathering(peer: RTCPeerConnection): Promise<void> {
    if (peer.iceGatheringState === "complete") return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        peer.removeEventListener("icegatheringstatechange", onStateChange);
        reject(new Error("Timed out preparing the voice connection."));
      }, 10_000);
      const onStateChange = () => {
        if (peer.iceGatheringState !== "complete") return;
        clearTimeout(timeout);
        peer.removeEventListener("icegatheringstatechange", onStateChange);
        resolve();
      };
      peer.addEventListener("icegatheringstatechange", onStateChange);
      onStateChange();
    });
  }

  private setStatus(status: LiveStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.callbacks.onStatus?.(status);
  }

  private send(event: unknown): void {
    if (this.channel?.readyState === "open") {
      this.channel.send(JSON.stringify(event));
    }
  }

  private handleMessage(message: MessageEvent): void {
    if (typeof message.data !== "string") return;
    let event: LiveEvent;
    try {
      event = JSON.parse(message.data) as LiveEvent;
    } catch {
      return;
    }

    switch (event.type) {
      case "session.started":
        this.startedResolve?.();
        break;
      case "session.closed":
        this.cleanup();
        break;
      case "session.input_transcript.delta":
        if (event.delta) {
          this.setSpeaking(false);
          this.appendTranscript("user", event.delta);
        }
        break;
      case "session.output_transcript.delta":
        if (event.delta) {
          this.setSpeaking(true);
          this.appendTranscript("agent", event.delta);
        }
        break;
      case "response.event":
        if (event.event?.type === "response.output_item.done") {
          const item = event.event.item;
          if (item?.type === "function_call") void this.executeTool(item);
        }
        break;
      case "error": {
        const error = new Error(event.error?.message || "OpenAI GPT-Live reported an error.");
        this.callbacks.onError?.(error.message);
        this.startedReject?.(error);
        break;
      }
    }
  }

  private appendTranscript(role: TranscriptRole, delta: string): void {
    const otherRole: TranscriptRole = role === "user" ? "agent" : "user";
    this.flushTranscript(otherRole);
    this.transcriptBuffers[role] += delta;
    const currentTimer = this.transcriptTimers[role];
    if (currentTimer) clearTimeout(currentTimer);
    this.transcriptTimers[role] = setTimeout(
      () => this.flushTranscript(role),
      TRANSCRIPT_GAP_MS
    );
  }

  private flushTranscript(role: TranscriptRole): void {
    const timer = this.transcriptTimers[role];
    if (timer) clearTimeout(timer);
    delete this.transcriptTimers[role];
    const text = this.transcriptBuffers[role].trim();
    this.transcriptBuffers[role] = "";
    if (text) this.callbacks.onTranscript?.(role, text);
  }

  private setSpeaking(speaking: boolean): void {
    if (this.speakingTimer) clearTimeout(this.speakingTimer);
    this.callbacks.onSpeaking?.(speaking);
    if (speaking) {
      this.speakingTimer = setTimeout(() => {
        this.speakingTimer = null;
        this.callbacks.onSpeaking?.(false);
      }, 1_000);
    } else {
      this.speakingTimer = null;
    }
  }

  private async executeTool(item: FunctionCallItem): Promise<void> {
    const callId = item.call_id;
    if (!callId || this.handledCalls.has(callId)) return;
    this.handledCalls.add(callId);

    let output: string;
    try {
      const tool = item.name ? this.tools[item.name] : undefined;
      if (!tool) throw new Error(`Unknown tool: ${item.name || "unnamed"}`);
      const args = item.arguments
        ? (JSON.parse(item.arguments) as Record<string, unknown>)
        : {};
      output = String((await tool(args)) ?? "Done.");
    } catch (error) {
      output = `Tool failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    this.send({
      type: "response.item.create",
      event_id: this.eventId("tool_result"),
      item: { type: "function_call_output", call_id: callId, output },
    });
    this.send({ type: "response.create", event_id: this.eventId("continue") });
  }

  private eventId(prefix: string): string {
    const suffix =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return `${prefix}_${suffix}`;
  }

  private cleanup(): void {
    this.startedReject?.(new Error("The GPT-Live session disconnected before it started."));
    this.startedResolve = null;
    this.startedReject = null;
    this.flushTranscript("user");
    this.flushTranscript("agent");
    if (this.speakingTimer) clearTimeout(this.speakingTimer);
    this.speakingTimer = null;
    this.callbacks.onSpeaking?.(false);

    const channel = this.channel;
    const peer = this.peer;
    this.channel = null;
    this.peer = null;
    channel?.close();
    peer?.close();
    this.microphone?.getTracks().forEach((track) => track.stop());
    if (this.audio) {
      this.audio.srcObject = null;
      this.audio.remove();
    }
    this.microphone = null;
    this.audio = null;
    this.handledCalls.clear();
    this.setStatus("disconnected");
  }
}
