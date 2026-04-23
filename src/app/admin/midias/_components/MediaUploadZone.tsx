"use client";

import { useRef, useState } from "react";

interface UploadingFile {
  name: string;
  progress: number;
  done: boolean;
  error?: string;
}

interface Props {
  folder: string;
  onUploaded: (file: MediaFile) => void;
}

export interface MediaFile {
  id: string;
  filename: string;
  storage_path: string;
  url: string;
  type: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  title: string | null;
  description: string | null;
  folder: string;
  created_at: string;
  updated_at: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaUploadZone({ folder, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<UploadingFile[]>([]);

  async function uploadFile(file: File) {
    const entry: UploadingFile = { name: file.name, progress: 10, done: false };
    setQueue((prev) => [...prev, entry]);

    const updateEntry = (patch: Partial<UploadingFile>) =>
      setQueue((prev) =>
        prev.map((e) => (e.name === file.name ? { ...e, ...patch } : e))
      );

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      fd.append("title", file.name.replace(/\.[^.]+$/, ""));

      updateEntry({ progress: 40 });
      const res = await fetch("/api/admin/midias", { method: "POST", body: fd });
      updateEntry({ progress: 90 });
      const json = await res.json();

      if (!res.ok || json.error) throw new Error(json.error ?? "Erro no upload");
      updateEntry({ progress: 100, done: true });
      onUploaded(json.file);

      setTimeout(() => {
        setQueue((prev) => prev.filter((e) => e.name !== file.name));
      }, 2000);
    } catch (err) {
      updateEntry({ error: String(err), done: true });
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  const allDone = queue.length > 0 && queue.every((q) => q.done);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-[10px] p-10 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-[#ff1f1f] bg-[#ff1f1f]/5"
            : "border-[#1c2a3e] hover:border-[#526888] bg-[#0e1520]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,video/*,application/pdf,.doc,.docx,.txt"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke={dragging ? "#ff1f1f" : "#526888"} strokeWidth={1.4}
          strokeLinecap="round" strokeLinejoin="round"
          className="w-10 h-10 mx-auto mb-3">
          <path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        <p className={`text-[14px] font-semibold mb-1 ${dragging ? "text-[#ff1f1f]" : "text-[#d4d4da]"}`}>
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-[#526888] text-[12px]">Imagens, vídeos, PDFs e documentos</p>
      </div>

      {queue.length > 0 && (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[8px] divide-y divide-[#141d2c]">
          {queue.map((item) => (
            <div key={item.name} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[#d4d4da] text-[13px] truncate">{item.name}</p>
                {item.error ? (
                  <p className="text-[#ff1f1f] text-[11px] mt-0.5">{item.error}</p>
                ) : (
                  <div className="mt-1.5 h-[3px] bg-[#141d2c] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff1f1f] transition-all duration-300 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {item.done && !item.error && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="#22c55e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  className="w-4 h-4 shrink-0">
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {allDone && (
        <p className="text-[#22c55e] text-[12px] text-center">
          {queue.filter((q) => q.done && !q.error).length} arquivo(s) enviado(s) com sucesso
        </p>
      )}
    </div>
  );
}

export { formatBytes };
