"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PipelineCardProps {
  companyId: string;
  tradeName: string;
  segment: string;
  createdAt: string;
  listingType: string;
  listingBg: string;
  listingText: string;
  nextStatus?: string;
}

export default function PipelineCard({
  companyId,
  tradeName,
  segment,
  createdAt,
  listingType,
  listingBg,
  listingText,
  nextStatus,
}: PipelineCardProps) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAdvance() {
    if (!nextStatus) return;
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
    <div className="bg-[#0e1520] border border-[#141d2c] rounded-[8px] p-3 flex flex-col gap-2">
      <div>
        <p className="text-[#d4d4da] text-[12px] font-semibold leading-tight">{tradeName}</p>
        <p className="text-[#526888] text-[10px] mt-0.5">{segment}</p>
        <p className="text-[#526888] text-[10px]">{createdAt}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center h-[16px] px-1.5 rounded text-[9px] font-bold ${listingBg} ${listingText}`}>
          {listingType}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/anunciantes/${companyId}`}
            className="text-[#526888] hover:text-[#7a9ab5] text-[11px] transition-colors"
          >
            Editar
          </Link>
          {nextStatus && (
            <button
              onClick={handleAdvance}
              disabled={loading}
              className="text-[#526888] hover:text-[#22c55e] text-[11px] transition-colors disabled:opacity-40"
              title={`Avançar para ${nextStatus}`}
            >
              {loading ? "..." : "→"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
