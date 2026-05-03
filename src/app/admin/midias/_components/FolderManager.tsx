"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  folders: string[];
  onClose: () => void;
  onChanged: (folders: string[]) => void;
}

export default function FolderManager({ folders, onClose, onChanged }: Props) {
  const [list, setList]             = useState<string[]>(folders);
  const [newName, setNewName]       = useState("");
  const [creating, setCreating]     = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue]   = useState("");
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<"move" | "delete">("move");
  const [deleting, setDeleting]     = useState(false);
  const [error, setError]           = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setList(folders); }, [folders]);

  async function create() {
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/midias/pastas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erro ao criar pasta."); return; }
      setList(json.folders);
      onChanged(json.folders);
      setNewName("");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(idx: number) {
    setEditingIdx(idx);
    setEditValue(list[idx]);
    setError("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function saveRename() {
    if (editingIdx === null) return;
    const oldName = list[editingIdx];
    const newVal  = editValue.trim();
    if (!newVal || newVal === oldName) { setEditingIdx(null); return; }
    setSaving(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/midias/pastas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName: newVal }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erro ao renomear."); return; }
      setList(json.folders);
      onChanged(json.folders);
      setEditingIdx(null);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/midias/pastas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deleteTarget, action: deleteAction }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erro ao excluir."); return; }
      setList(json.folders);
      onChanged(json.folders);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0e1520] border border-[#1c2a3e] rounded-[12px] w-full max-w-[480px] flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141d2c]">
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] leading-none">
            Gerenciar Pastas
          </h2>
          <button onClick={onClose} className="text-[#526888] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <p className="text-[#ff1f1f] text-[12px] mb-3 bg-[#ff1f1f]/10 border border-[#ff1f1f]/20 rounded-[6px] px-3 py-2">
              {error}
            </p>
          )}

          <ul className="space-y-1.5">
            {list.map((folder, idx) => (
              <li key={folder} className="flex items-center gap-2 bg-[#141d2c] border border-[#1c2a3e] rounded-[8px] px-3 h-[42px]">
                {editingIdx === idx ? (
                  <>
                    <input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") setEditingIdx(null); }}
                      className="flex-1 bg-transparent text-[13px] text-white outline-none"
                    />
                    <button
                      onClick={saveRename}
                      disabled={saving}
                      className="text-[#4ade80] hover:text-green-400 text-[12px] font-semibold disabled:opacity-50"
                    >
                      {saving ? "…" : "Salvar"}
                    </button>
                    <button onClick={() => setEditingIdx(null)} className="text-[#526888] hover:text-white text-[12px]">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#526888] shrink-0">
                      <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
                    </svg>
                    <span className="flex-1 text-[13px] text-[#d4d4da]">{folder}</span>
                    {folder !== "geral" && (
                      <>
                        <button
                          onClick={() => startEdit(idx)}
                          className="text-[#526888] hover:text-white transition-colors p-1"
                          title="Renomear"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setDeleteTarget(folder); setDeleteAction("move"); setError(""); }}
                          className="text-[#526888] hover:text-[#ff1f1f] transition-colors p-1"
                          title="Excluir"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </>
                    )}
                    {folder === "geral" && (
                      <span className="text-[11px] text-[#526888] italic">padrão</span>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Criar nova */}
        <div className="px-6 py-4 border-t border-[#141d2c]">
          <p className="text-[#7a9ab5] text-[11px] uppercase tracking-wider mb-2">Nova pasta</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="nome-da-pasta"
              className="flex-1 bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[13px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#526888]"
            />
            <button
              onClick={create}
              disabled={creating || !newName.trim()}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold px-5 h-[38px] rounded-[6px] transition-colors"
            >
              {creating ? "…" : "Criar"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal confirmação de exclusão */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0e1520] border border-[#1c2a3e] rounded-[12px] w-full max-w-[400px] p-6">
            <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[20px] mb-1">
              Excluir pasta "{deleteTarget}"
            </h3>
            <p className="text-[#7a9ab5] text-[13px] mb-5">
              O que fazer com os arquivos desta pasta?
            </p>

            <div className="space-y-2 mb-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="deleteAction"
                  value="move"
                  checked={deleteAction === "move"}
                  onChange={() => setDeleteAction("move")}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-[13px] text-[#d4d4da] font-medium">Mover para "geral"</p>
                  <p className="text-[11px] text-[#526888]">Os arquivos são mantidos e movidos para a pasta padrão</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="deleteAction"
                  value="delete"
                  checked={deleteAction === "delete"}
                  onChange={() => setDeleteAction("delete")}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-[13px] text-[#ff1f1f] font-medium">Excluir todos os arquivos</p>
                  <p className="text-[11px] text-[#526888]">Remove permanentemente todos os arquivos desta pasta</p>
                </div>
              </label>
            </div>

            {error && (
              <p className="text-[#ff1f1f] text-[12px] mb-3">{error}</p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-[38px] px-5 rounded-[6px] text-[13px] text-[#7a9ab5] hover:text-white bg-[#141d2c] border border-[#1c2a3e] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="h-[38px] px-5 rounded-[6px] text-[13px] font-semibold bg-[#ff1f1f] hover:bg-[#cc0000] text-white disabled:opacity-50 transition-colors"
              >
                {deleting ? "Excluindo…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
