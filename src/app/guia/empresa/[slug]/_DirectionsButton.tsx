"use client";

interface Props {
  companyId: string;
  mapsUrl:   string;
  label?:    string;
}

export default function DirectionsButton({ companyId, mapsUrl, label = "Como Chegar" }: Props) {
  function handleClick() {
    /* Track directions interaction */
    fetch("/api/guia/interaction", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: companyId, type: "DIRECTIONS" }),
    }).catch(() => {});
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-5 rounded-[8px] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
      {label}
    </button>
  );
}
