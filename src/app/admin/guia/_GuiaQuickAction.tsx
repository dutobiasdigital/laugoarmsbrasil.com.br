"use client";
import { useState } from "react";

// pipelineStatus values: REGISTERED | EMAIL_VERIFIED | COMPLETE | ACTIVE | SUSPENDED
const PENDING_STATES = ["REGISTERED", "EMAIL_VERIFIED", "COMPLETE"];

export default function GuiaQuickAction({ id, status: initial }: { id: string; status: string }) {
  const [status, setStatus] = useState(initial);
  const [busy, setBusy]     = useState(false);

  async function update(newStatus: string) {
    setBusy(true);
    try {
      await fetch("/api/admin/guia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setStatus(newStatus);
    } finally { setBusy(false); }
  }

  const isPending = PENDING_STATES.includes(status);

  return (
    <div className={`flex gap-1 items-center ${busy ? "opacity-50 pointer-events-none" : ""}`}>
      {isPending    && <button onClick={() => update("ACTIVE")}    className="bg-[#0f381f] hover:bg-[#0f4a25] border border-[#22c55e]/30 text-[#22c55e] text-[11px] h-[26px] px-2.5 rounded-[4px] transition-colors whitespace-nowrap">✓ Aprovar</button>}
      {status === "ACTIVE"    && <button onClick={() => update("SUSPENDED")} className="bg-[#1a1a0a] hover:bg-[#252506] border border-[#facc15]/20 text-[#facc15] text-[11px] h-[26px] px-2 rounded-[4px] transition-colors" title="Suspender">⏸</button>}
      {status === "SUSPENDED" && <button onClick={() => update("ACTIVE")}    className="bg-[#141d2c] hover:bg-[#1c2a3e] border border-[#526888]/30 text-[#526888] text-[11px] h-[26px] px-2 rounded-[4px] transition-colors" title="Reativar">▶</button>}
    </div>
  );
}
