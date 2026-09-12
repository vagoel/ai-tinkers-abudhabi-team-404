"use client";

import dynamic from "next/dynamic";
import type { VoiceWidgetProps } from "./VoiceWidget";

// page-agent and WebRTC are browser-only, so never render on the server.
const VoiceWidget = dynamic(() => import("./VoiceWidget"), { ssr: false });

export default function VoiceWidgetMount(props: VoiceWidgetProps) {
  return <VoiceWidget {...props} />;
}
