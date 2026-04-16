"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PipelineAdvanceButton({
  companyId,
  nextStatus,
}: {
  companyId: string;
  nextStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAdvance() {
    setLoading(true);
    try {
      await fetch("/api/admin/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: companyId, pipelineStatus: nextStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAdvance}
      disabled={loading}
      className="text-[#526888] hover:text-[#22c55e] text-[11px] transition-colors disabled:opacity-50"
      title={`Avançar para ${nextStatus}`}
    >
      {loading ? "..." : "↑"}
    </button>
  );
}
