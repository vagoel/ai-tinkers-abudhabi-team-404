"use client";

import { useMemo, useState } from "react";
import VoiceWidgetMount from "@/components/VoiceWidgetMount";

type Shipment = {
  id: string;
  material: string;
  supplier: string;
  lane: string;
  eta: string;
  delay: string;
  coverage: string;
  lineStop: string;
  impact: string;
  risk: number;
  status: "Critical" | "Watch" | "Stable";
  signal: string;
};

type RouteOption = {
  id: string;
  name: string;
  path: string;
  arrival: string;
  buffer: string;
  cost: number;
  compliance: "Verified" | "Pending";
  capacity: "Confirmed" | "Limited" | "Waitlist";
  risk: "Low" | "Medium" | "High";
};

const shipments: Shipment[] = [
  {
    id: "AX-2048",
    material: "Polycarbonate resin M47",
    supplier: "Ningbo Advanced Materials",
    lane: "Ningbo → Abu Dhabi",
    eta: "16 Sep · 22:30",
    delay: "+42h",
    coverage: "18 hours",
    lineStop: "Thu 14 Sep · 14:00",
    impact: "AED 4.6M / day",
    risk: 96,
    status: "Critical",
    signal: "Ningbo terminal dwell reached 31 hours; ocean connection missed.",
  },
  {
    id: "AX-1982",
    material: "Precision servo assemblies",
    supplier: "Rhein Motion GmbH",
    lane: "Munich → Dubai",
    eta: "14 Sep · 18:10",
    delay: "+18h",
    coverage: "2.8 days",
    lineStop: "Sat 16 Sep · 09:00",
    impact: "AED 2.1M / day",
    risk: 78,
    status: "Critical",
    signal: "Frankfurt cargo backlog is holding two booked pallets.",
  },
  {
    id: "AX-2011",
    material: "Food-grade packaging film",
    supplier: "Vardhan Flexibles",
    lane: "Mumbai → Al Ain",
    eta: "15 Sep · 07:45",
    delay: "+11h",
    coverage: "4.5 days",
    lineStop: "Mon 18 Sep · 06:00",
    impact: "AED 980K / day",
    risk: 64,
    status: "Watch",
    signal: "Monsoon handling restrictions may add another six hours.",
  },
  {
    id: "AX-1937",
    material: "Medical valve housings",
    supplier: "Osaka Polymer Works",
    lane: "Kobe → Khalifa Port",
    eta: "17 Sep · 13:20",
    delay: "+9h",
    coverage: "6.2 days",
    lineStop: "Wed 20 Sep · 16:00",
    impact: "AED 1.8M / day",
    risk: 51,
    status: "Watch",
    signal: "Carrier schedule changed; production buffer remains healthy.",
  },
  {
    id: "AX-2074",
    material: "Aluminium coil 6061",
    supplier: "Gulf Metals Processing",
    lane: "Sohar → Mussafah",
    eta: "13 Sep · 15:00",
    delay: "On time",
    coverage: "8.1 days",
    lineStop: "Thu 21 Sep · 11:00",
    impact: "AED 740K / day",
    risk: 22,
    status: "Stable",
    signal: "Truck and border slots are confirmed.",
  },
];

const routeOptions: RouteOption[] = [
  {
    id: "pacific-air",
    name: "Pacific Air Priority",
    path: "NGB → HKG → AUH",
    arrival: "14 Sep · 06:40",
    buffer: "7h 20m before line stop",
    cost: 14760,
    compliance: "Verified",
    capacity: "Confirmed",
    risk: "Low",
  },
  {
    id: "direct-charter",
    name: "Falcon Direct Charter",
    path: "NGB → AUH",
    arrival: "13 Sep · 23:10",
    buffer: "14h 50m before line stop",
    cost: 22400,
    compliance: "Verified",
    capacity: "Confirmed",
    risk: "Low",
  },
  {
    id: "rail-air",
    name: "Eastern Rail + Air",
    path: "Ningbo → PVG → DXB",
    arrival: "14 Sep · 11:50",
    buffer: "2h 10m before line stop",
    cost: 12980,
    compliance: "Verified",
    capacity: "Limited",
    risk: "Medium",
  },
  {
    id: "ocean-priority",
    name: "Ocean Priority Recovery",
    path: "Ningbo → Jebel Ali",
    arrival: "16 Sep · 04:30",
    buffer: "38h 30m after line stop",
    cost: 6200,
    compliance: "Pending",
    capacity: "Waitlist",
    risk: "High",
  },
];

const signals = [
  { label: "Ningbo terminal dwell", value: "31h", trend: "+9h", tone: "red" },
  { label: "North Asia air capacity", value: "Tight", trend: "+18%", tone: "amber" },
  { label: "AUH customs clearance", value: "2.1h", trend: "Normal", tone: "green" },
  { label: "Weather corridor", value: "Clear", trend: "No alerts", tone: "green" },
] as const;

const owners = ["Maya Chen", "Omar Al Mansoori", "Leila Haddad", "Daniel Weber"];

function money(value: number) {
  return `AED ${value.toLocaleString("en-US")}`;
}

export default function DemoDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [routeId, setRouteId] = useState("");
  const [owner, setOwner] = useState("");
  const [brief, setBrief] = useState("");
  const [prepared, setPrepared] = useState(false);
  const [formError, setFormError] = useState("");

  const selected = useMemo(
    () => shipments.find((shipment) => shipment.id === selectedId) ?? null,
    [selectedId]
  );
  const selectedRoute = useMemo(
    () => routeOptions.find((route) => route.id === routeId) ?? null,
    [routeId]
  );

  function openShipment(id: string) {
    setSelectedId(id);
    setRouteId("");
    setOwner("");
    setBrief("");
    setPrepared(false);
    setFormError("");
  }

  function prepareReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !selectedRoute || !owner || brief.trim().length < 20) {
      setFormError("Select a route and owner, then add a complete decision brief.");
      return;
    }
    setFormError("");
    setPrepared(true);
  }

  function resetScenario() {
    setSelectedId(null);
    setRouteId("");
    setOwner("");
    setBrief("");
    setPrepared(false);
    setFormError("");
  }

  return (
    <main className="min-h-screen bg-[#f3f5f7] text-[#152234]">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[228px] flex-col bg-[#0c1826] text-white lg:flex">
          <div className="flex h-[76px] items-center gap-3 border-b border-white/8 px-6">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d9ff57] text-[#0c1826] shadow-[0_0_30px_rgba(217,255,87,.16)]">
              <LogoMark />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-[0.12em]">ATLAS</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Operations</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-6" aria-label="Main navigation">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Workspace</p>
            <div className="mt-3 space-y-1.5">
              <NavItem icon="grid" label="Network control" active />
              <NavItem icon="box" label="Shipments" badge="24" />
              <NavItem icon="pulse" label="Risk signals" badge="5" />
              <NavItem icon="route" label="Route plans" />
              <NavItem icon="factory" label="Production" />
            </div>
            <p className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Manage</p>
            <div className="mt-3 space-y-1.5">
              <NavItem icon="users" label="Team" />
              <NavItem icon="chart" label="Reports" />
              <NavItem icon="settings" label="Settings" />
            </div>
          </nav>

          <div className="m-4 rounded-2xl border border-white/8 bg-white/[.035] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <span className="h-2 w-2 rounded-full bg-[#d9ff57] shadow-[0_0_10px_#d9ff57]" />
              Network connected
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">18 data feeds · Updated 11:14 GST</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 lg:ml-[228px]">
          <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#dde2e7] bg-[#f8fafb]/95 px-5 backdrop-blur md:px-8">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Global network <span className="text-slate-300">/</span> Control tower
              </div>
              <h1 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#102033]">Exception command center</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-[#dce2e7] bg-white px-3 py-2 text-xs text-slate-500 shadow-sm sm:flex">
                <Icon name="calendar" className="h-4 w-4" /> 12 Sep 2026 · 11:14 GST
              </div>
              <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#dce2e7] bg-white text-slate-500 shadow-sm" aria-label="Notifications">
                <Icon name="bell" className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
              </button>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#17283d] text-xs font-semibold text-white">MC</div>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] space-y-5 p-4 pb-28 md:p-6 lg:p-7">
            <section className="grid gap-4 xl:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]" aria-label="Network summary">
              <div className="relative overflow-hidden rounded-2xl bg-[#142338] p-5 text-white shadow-[0_12px_35px_rgba(15,28,46,.13)]">
                <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[30px] border-[#d9ff57]/10" />
                <div className="relative flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400">Production exposure</p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">AED 8.4M</p>
                    <p className="mt-1 text-xs text-slate-400">Daily value at risk across 5 exceptions</p>
                  </div>
                  <span className="rounded-full bg-red-400/12 px-2.5 py-1 text-[10px] font-semibold text-red-300">2 critical</span>
                </div>
                <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#d9ff57] to-amber-400" />
                </div>
              </div>
              <MetricCard label="Open exceptions" value="24" detail="5 need action today" icon="alert" accent="red" />
              <MetricCard label="OTIF forecast" value="91.8%" detail="−2.4 pts vs plan" icon="trend" accent="amber" />
              <MetricCard label="Protected value" value="AED 12.7M" detail="Across 8 recovery plans" icon="shield" accent="green" />
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(370px,.85fr)]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-[#dfe4e8] bg-white shadow-[0_8px_25px_rgba(19,34,53,.05)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7eaed] px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Material exceptions</h2>
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">5 active</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">Ranked by production continuity risk</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 rounded-lg border border-[#dde2e7] px-3 py-2 text-xs font-medium text-slate-600">
                        <Icon name="filter" className="h-3.5 w-3.5" /> Filters
                      </button>
                      <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#dde2e7] text-slate-500" aria-label="More actions">
                        <Icon name="more" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#e7eaed] bg-[#fafbfc] text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                          <th className="px-5 py-3">Shipment / material</th>
                          <th className="px-3 py-3">Lane</th>
                          <th className="px-3 py-3">Coverage</th>
                          <th className="px-3 py-3">Line stop</th>
                          <th className="px-3 py-3">Impact</th>
                          <th className="px-3 py-3">Risk</th>
                          <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipments.map((shipment) => {
                          const isSelected = shipment.id === selectedId;
                          const isPrepared = prepared && isSelected;
                          return (
                            <tr key={shipment.id} className={`border-b border-[#edf0f2] transition last:border-0 ${isSelected ? "bg-[#f8fbe9]" : "hover:bg-[#fafbfc]"}`}>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[10px] font-bold ${shipment.risk >= 90 ? "bg-red-50 text-red-600" : shipment.risk >= 60 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{shipment.id.slice(-2)}</div>
                                  <div>
                                    <p className="text-xs font-semibold text-[#17263a]">{shipment.material}</p>
                                    <p className="mt-1 text-[10px] text-slate-400">{shipment.id} · {shipment.supplier}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-4">
                                <p className="text-xs font-medium text-slate-700">{shipment.lane}</p>
                                <p className={`mt-1 text-[10px] font-semibold ${shipment.delay === "On time" ? "text-emerald-600" : "text-red-500"}`}>{shipment.delay} · ETA {shipment.eta}</p>
                              </td>
                              <td className="px-3 py-4"><p className={`text-xs font-semibold ${shipment.risk >= 90 ? "text-red-600" : "text-slate-700"}`}>{shipment.coverage}</p></td>
                              <td className="px-3 py-4 text-xs text-slate-600">{shipment.lineStop}</td>
                              <td className="px-3 py-4 text-xs font-semibold text-slate-700">{shipment.impact}</td>
                              <td className="px-3 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-bold ${shipment.risk >= 90 ? "text-red-600" : shipment.risk >= 60 ? "text-amber-600" : "text-emerald-600"}`}>{shipment.risk}</span>
                                  <div className="h-1.5 w-10 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${shipment.risk >= 90 ? "bg-red-500" : shipment.risk >= 60 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${shipment.risk}%` }} /></div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => openShipment(shipment.id)}
                                  aria-label={`Investigate shipment ${shipment.id}, ${shipment.material}, risk ${shipment.risk}, ${shipment.coverage} inventory coverage, production stops ${shipment.lineStop}, impact ${shipment.impact}`}
                                  className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${isPrepared ? "bg-emerald-100 text-emerald-700" : isSelected ? "bg-[#17283d] text-white" : "border border-[#dfe4e8] bg-white text-slate-600 hover:border-slate-400"}`}
                                >
                                  {isPrepared ? "Plan ready" : isSelected ? "Selected" : "Investigate"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-[1.1fr_.9fr]">
                  <div className="rounded-2xl border border-[#dfe4e8] bg-white p-5 shadow-[0_8px_25px_rgba(19,34,53,.05)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-[15px] font-semibold">Network risk signals</h2>
                        <p className="mt-1 text-xs text-slate-400">Control-tower feed · 11:14 GST</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> All feeds healthy</span>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {signals.map((signal) => (
                        <div key={signal.label} className="rounded-xl border border-[#e5e9ec] bg-[#fafbfc] p-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[10px] font-medium text-slate-500">{signal.label}</p>
                            <span className={`h-2 w-2 rounded-full ${signal.tone === "red" ? "bg-red-500" : signal.tone === "amber" ? "bg-amber-400" : "bg-emerald-500"}`} />
                          </div>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-lg font-semibold tracking-[-0.03em] text-[#17263a]">{signal.value}</span>
                            <span className={`text-[10px] font-semibold ${signal.tone === "red" ? "text-red-500" : signal.tone === "amber" ? "text-amber-600" : "text-emerald-600"}`}>{signal.trend}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#dfe4e8] bg-white p-5 shadow-[0_8px_25px_rgba(19,34,53,.05)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-[15px] font-semibold">Production outlook</h2>
                        <p className="mt-1 text-xs text-slate-400">Next 7 days · capacity at risk</p>
                      </div>
                      <Icon name="more" className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-5 flex h-[112px] items-end gap-2" aria-label="Production risk chart">
                      {[38, 56, 86, 68, 43, 29, 20].map((height, index) => (
                        <div key={index} className="flex flex-1 flex-col items-center gap-2">
                          <div className="flex h-20 w-full items-end rounded-md bg-slate-50">
                            <div className={`w-full rounded-md ${index === 2 ? "bg-red-500" : index === 3 ? "bg-amber-400" : "bg-[#213b56]"}`} style={{ height: `${height}%` }} />
                          </div>
                          <span className="text-[9px] font-medium text-slate-400">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="xl:sticky xl:top-[96px] xl:self-start" aria-label="Recovery workspace">
                {!selected ? (
                  <div className="overflow-hidden rounded-2xl border border-[#dfe4e8] bg-white shadow-[0_12px_32px_rgba(19,34,53,.08)]">
                    <div className="border-b border-[#e7eaed] bg-[#142338] px-5 py-5 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d9ff57]">Recovery workspace</p>
                      <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">Build a continuity plan</h2>
                    </div>
                    <div className="grid min-h-[505px] place-items-center p-8 text-center">
                      <div>
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f1f4f6] text-[#223a55]"><Icon name="route" className="h-6 w-6" /></div>
                        <h3 className="mt-4 text-sm font-semibold">Select a material exception</h3>
                        <p className="mx-auto mt-2 max-w-[240px] text-xs leading-5 text-slate-400">Review the production risk, compare recovery routes, and prepare a decision for approval.</p>
                        <div className="mx-auto mt-6 flex max-w-[250px] items-center justify-center gap-2 rounded-xl border border-[#e3e8eb] bg-[#fafbfc] px-3 py-3 text-[11px] text-slate-500">
                          <span className="h-2 w-2 rounded-full bg-red-500" /> Highest risk requires action today
                        </div>
                      </div>
                    </div>
                  </div>
                ) : prepared && selectedRoute ? (
                  <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_12px_32px_rgba(19,34,53,.08)]">
                    <div className="bg-[#123c35] px-5 py-6 text-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Ready for approval</p>
                          <h2 className="mt-2 text-xl font-semibold">Production protected</h2>
                        </div>
                        <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-300 text-[#123c35]"><Icon name="check" className="h-5 w-5" /></div>
                      </div>
                      <p className="mt-4 text-xs leading-5 text-emerald-100/70">Recovery plan RP-0912-04 has been prepared. No carrier booking or external message has been sent.</p>
                    </div>
                    <div className="space-y-4 p-5">
                      <SummaryRow label="Shipment" value={`${selected.id} · ${selected.material}`} />
                      <SummaryRow label="Selected route" value={`${selectedRoute.name} · ${selectedRoute.path}`} />
                      <div className="grid grid-cols-2 gap-3">
                        <SummaryTile label="Arrival" value={selectedRoute.arrival} detail={selectedRoute.buffer} />
                        <SummaryTile label="Recovery cost" value={money(selectedRoute.cost)} detail="Within AED 15,000 limit" />
                      </div>
                      <SummaryRow label="Owner" value={owner} />
                      <div className="rounded-xl border border-[#e1e7e5] bg-[#f6faf8] p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Decision brief</p>
                        <p className="mt-2 text-xs leading-5 text-slate-600">{brief}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <CheckPill label="Compliance" /><CheckPill label="Capacity" /><CheckPill label="Budget" />
                      </div>
                      <button type="button" onClick={resetScenario} className="w-full rounded-xl border border-[#dfe4e8] py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">Reset workspace</button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-[#dfe4e8] bg-white shadow-[0_12px_32px_rgba(19,34,53,.08)]">
                    <div className="border-b border-[#e7eaed] bg-[#142338] px-5 py-4 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d9ff57]">Recovery workspace</p>
                          <h2 className="mt-1 text-lg font-semibold">{selected.id}</h2>
                          <p className="mt-1 text-[11px] text-slate-400">{selected.material}</p>
                        </div>
                        <span className="rounded-full bg-red-400/15 px-2.5 py-1 text-[10px] font-semibold text-red-300">Risk {selected.risk}</span>
                      </div>
                    </div>

                    <form onSubmit={prepareReview} className="space-y-4 p-5" aria-label={`Prepare recovery plan for ${selected.id}`}>
                      <div className="grid grid-cols-2 gap-3">
                        <SummaryTile label="Inventory coverage" value={selected.coverage} detail={`Line stop ${selected.lineStop}`} danger={selected.risk >= 90} />
                        <SummaryTile label="Financial impact" value={selected.impact} detail="Estimated daily exposure" />
                      </div>
                      <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-500">Active disruption</p>
                        <p className="mt-1.5 text-[11px] leading-5 text-red-800">{selected.signal}</p>
                      </div>

                      <label className="block" htmlFor="reroute-option">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Recovery route</span>
                        <select id="reroute-option" name="reroute-option" value={routeId} onChange={(event) => setRouteId(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dce2e7] bg-white px-3 py-3 text-xs font-medium text-slate-700 outline-none focus:border-[#809b24] focus:ring-2 focus:ring-[#d9ff57]/30">
                          <option value="">Select a route option</option>
                          {routeOptions.map((route) => (
                            <option key={route.id} value={route.id}>{route.name} — {route.arrival} — {money(route.cost)} — compliance {route.compliance.toLowerCase()} — capacity {route.capacity.toLowerCase()}</option>
                          ))}
                        </select>
                      </label>

                      {selectedRoute && (
                        <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#e1e6e9] bg-[#fafbfc] p-3">
                          <MiniFact label="Timing" value={selectedRoute.buffer} />
                          <MiniFact label="Compliance" value={selectedRoute.compliance} good={selectedRoute.compliance === "Verified"} />
                          <MiniFact label="Route risk" value={selectedRoute.risk} good={selectedRoute.risk === "Low"} />
                        </div>
                      )}

                      <label className="block" htmlFor="plan-owner">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Plan owner</span>
                        <select id="plan-owner" name="plan-owner" value={owner} onChange={(event) => setOwner(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dce2e7] bg-white px-3 py-3 text-xs font-medium text-slate-700 outline-none focus:border-[#809b24] focus:ring-2 focus:ring-[#d9ff57]/30">
                          <option value="">Assign an owner</option>
                          {owners.map((person) => <option key={person}>{person}</option>)}
                        </select>
                      </label>

                      <label className="block" htmlFor="decision-brief">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Decision brief</span>
                        <textarea id="decision-brief" name="decision-brief" rows={3} value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Summarize the risk, selected route, timing, cost, and decision rationale." className="mt-2 w-full resize-none rounded-xl border border-[#dce2e7] bg-white px-3 py-3 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-300 focus:border-[#809b24] focus:ring-2 focus:ring-[#d9ff57]/30" />
                      </label>

                      {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-600">{formError}</p>}

                      <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d9ff57] px-4 py-3.5 text-xs font-bold text-[#132135] shadow-[0_8px_18px_rgba(178,211,53,.22)] transition hover:bg-[#e2ff7b] active:translate-y-px">
                        <Icon name="spark" className="h-4 w-4" /> Prepare for approval
                      </button>
                      <p className="text-center text-[9px] leading-4 text-slate-400">Creates an internal review package only</p>
                    </form>
                  </div>
                )}
              </aside>
            </section>
          </div>
        </section>
      </div>

      <VoiceWidgetMount />
    </main>
  );
}

function MetricCard({ label, value, detail, icon, accent }: { label: string; value: string; detail: string; icon: IconName; accent: "red" | "amber" | "green" }) {
  const tones = { red: "bg-red-50 text-red-600", amber: "bg-amber-50 text-amber-600", green: "bg-emerald-50 text-emerald-600" };
  return (
    <div className="rounded-2xl border border-[#dfe4e8] bg-white p-5 shadow-[0_8px_25px_rgba(19,34,53,.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#17263a]">{value}</p>
          <p className="mt-1 text-[10px] text-slate-400">{detail}</p>
        </div>
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${tones[accent]}`}><Icon name={icon} className="h-4 w-4" /></div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, badge }: { icon: IconName; label: string; active?: boolean; badge?: string }) {
  return (
    <button type="button" className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${active ? "bg-white/[.08] text-white" : "text-slate-400 hover:bg-white/[.04] hover:text-slate-200"}`}>
      <Icon name={icon} className={`h-4 w-4 ${active ? "text-[#d9ff57]" : "text-slate-500"}`} />
      <span className="flex-1">{label}</span>
      {badge && <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${active ? "bg-[#d9ff57] text-[#0c1826]" : "bg-white/[.06] text-slate-500"}`}>{badge}</span>}
    </button>
  );
}

function SummaryTile({ label, value, detail, danger }: { label: string; value: string; detail: string; danger?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${danger ? "border-red-100 bg-red-50/50" : "border-[#e3e7ea] bg-[#fafbfc]"}`}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <p className={`mt-1.5 text-xs font-semibold ${danger ? "text-red-600" : "text-slate-700"}`}>{value}</p>
      <p className="mt-1 text-[9px] leading-4 text-slate-400">{detail}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#edf0f2] pb-3">
      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <span className="max-w-[65%] text-right text-xs font-semibold leading-5 text-slate-700">{value}</span>
    </div>
  );
}

function MiniFact({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return <div><p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p><p className={`mt-1 text-[9px] font-semibold leading-4 ${good ? "text-emerald-600" : "text-slate-600"}`}>{value}</p></div>;
}

function CheckPill({ label }: { label: string }) {
  return <div className="rounded-lg bg-emerald-50 px-2 py-2 text-[9px] font-semibold text-emerald-700"><span className="mr-1">✓</span>{label}</div>;
}

function LogoMark() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17.5 12 4l8 13.5" /><path d="M7.2 12.5h9.6M5.8 17.5h12.4" /></svg>;
}

type IconName = "grid" | "box" | "pulse" | "route" | "factory" | "users" | "chart" | "settings" | "calendar" | "bell" | "alert" | "trend" | "shield" | "filter" | "more" | "check" | "spark";

function Icon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    box: <><path d="m3 6 9-4 9 4-9 4-9-4Z" /><path d="m3 6 9 4 9-4v12l-9 4-9-4V6Z" /><path d="M12 10v12" /></>,
    pulse: <path d="M3 12h4l2-7 4 14 2-7h6" />,
    route: <><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h2a4 4 0 0 0 4-4V9a4 4 0 0 1 4-4" /></>,
    factory: <><path d="M3 21V9l6 3V8l6 3V5h6v16H3Z" /><path d="M7 17h1m3 0h1m3 0h1" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><path d="M4 20V10m6 10V4m6 16v-7m4 7H2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    alert: <><path d="M10.3 3.7 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 3h.01" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    filter: <path d="M4 5h16M7 12h10m-7 7h4" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    spark: <><path d="m12 3-1.2 4.1A5.4 5.4 0 0 1 7.1 10L3 11.2l4.1 1.2a5.4 5.4 0 0 1 3.7 3.7L12 20.2l1.2-4.1a5.4 5.4 0 0 1 3.7-3.7l4.1-1.2-4.1-1.2a5.4 5.4 0 0 1-3.7-3.7L12 3Z" /></>,
  };
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
