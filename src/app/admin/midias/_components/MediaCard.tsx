"use client";

import type { MediaFile } from "./MediaUploadZone";
import { formatBytes } from "./MediaUploadZone";

interface Props {
  file: MediaFile;
  selected: boolean;
  checked: boolean;
  onSelect: () => void;
  onCheck: (checked: boolean) => void;
}

function FileIcon({ type, mime }: { type: string; mime: string }) {
  if (type === "pdf") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a0a0a]">
        <span className="text-[#ff1f1f] text-[11px] font-bold tracking-wider">PDF</span>
      </div>
    );
  }
  if (type === "video") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0f1a]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="#7a9ab5" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
          className="w-8 h-8">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
        </svg>
      </div>
    );
  }
  if (type === "document") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0f1a]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="#7a9ab5" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
          className="w-8 h-8">
          <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
    );
  }
  // fallback for other
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0f1a]">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="#526888" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
        className="w-8 h-8">
        <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    </div>
  );
}

export default function MediaCard({ file, selected, checked, onSelect, onCheck }: Props) {
  return (
    <div
      className={`relative rounded-[8px] overflow-hidden cursor-pointer group border-2 transition-all duration-150 ${
        selected
          ? "border-[#ff1f1f]"
          : checked
          ? "border-[#526888]"
          : "border-transparent hover:border-[#1c2a3e]"
      }`}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-[#0a0f1a] relative overflow-hidden">
        {file.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.alt_text ?? file.filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <FileIcon type={file.type} mime={file.mime_type} />
        )}

        {/* Checkbox — top-left */}
        <div
          className={`absolute top-1.5 left-1.5 transition-opacity ${checked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          onClick={(e) => { e.stopPropagation(); onCheck(!checked); }}
        >
          <div className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-colors ${
            checked ? "bg-[#ff1f1f] border-[#ff1f1f]" : "bg-black/60 border-white/40"
          }`}>
            {checked && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                className="w-[10px] h-[10px]">
                <path d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
        </div>

        {/* Type badge */}
        {file.type !== "image" && (
          <div className="absolute bottom-1 right-1">
            <span className="bg-black/70 text-[#7a9ab5] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
              {file.type}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-[#0e1520] px-2 py-1.5">
        <p className="text-[#d4d4da] text-[11px] truncate leading-tight">
          {file.title ?? file.filename}
        </p>
        <p className="text-[#526888] text-[10px] mt-0.5">{formatBytes(file.size_bytes)}</p>
      </div>
    </div>
  );
}
