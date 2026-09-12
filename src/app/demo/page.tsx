import type { Metadata } from "next";
import DemoDashboard from "./DemoDashboard";

export const metadata: Metadata = {
  title: "Atlas Operations — Network Control",
  description: "Supply-chain exception management and production continuity.",
};

export default function DemoPage() {
  return <DemoDashboard />;
}
