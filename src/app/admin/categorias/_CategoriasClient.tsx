"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
}

const inputCls = "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full";

export default function CategoriasClient({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [categories, setCategories] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true); setError(null);
    const res = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setNewName("");
    startTransition(() => router.refresh());
    setCategories((prev) => [...prev, { ...data, _count: { articles: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setLoading(true); setError(null);
    const res = await fetch("/api/admin/categorias", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setEditingId(null);
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: data.name, slug: data.slug } : c).sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir categoria "${name}"? Artigos vinculados perderão a categoria.`)) return;
    setError(null);
    const res = await fetch("/api/admin/categorias", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="max-w-[640px]">
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-4 text-[#ff6b6b] text-[13px]">{error}</div>
      )}

      {/* New category */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 mb-6">
        <p className="text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-[1px] mb-3">Nova Categoria</p>
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder="Nome da categoria"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={loading || !newName.trim()}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[38px] px-5 rounded-[6px] transition-colors whitespace-nowrap"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Categories list */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
        <div className="bg-[#141d2c] px-4 py-2.5 grid grid-cols-[1fr_80px_80px] gap-4">
          <p className="text-[#253750] text-[11px] font-semibold tracking-[0.5px] uppercase">Nome</p>
          <p className="text-[#253750] text-[11px] font-semibold tracking-[0.5px] uppercase">Artigos</p>
          <p className="text-[#253750] text-[11px] font-semibold tracking-[0.5px] uppercase">Ações</p>
        </div>

        {categories.length === 0 && (
          <p className="text-[#253750] text-[13px] px-4 py-8 text-center">Nenhuma categoria cadastrada.</p>
        )}

        {categories.map((cat, i) => (
          <div key={cat.id}>
            {i > 0 && <div className="bg-[#141d2c] h-px" />}
            <div className="px-4 py-3 grid grid-cols-[1fr_80px_80px] gap-4 items-center">
              {editingId === cat.id ? (
                <>
                  <input
                    className={inputCls}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                    autoFocus
                  />
                  <span />
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      disabled={loading}
                      className="bg-[#ff1f1f] text-white text-[11px] font-semibold h-[28px] px-2 rounded transition-colors"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] text-[11px] h-[28px] px-2 rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[#d4d4da] text-[14px]">{cat.name}</p>
                    <p className="text-[#253750] text-[11px]">{cat.slug}</p>
                  </div>
                  <p className="text-[#7a9ab5] text-[13px]">{cat._count.articles}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[11px] h-[28px] px-2 rounded transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="bg-[#141d2c] border border-[#1c2a3e] hover:border-red-800 text-[#253750] hover:text-red-400 text-[11px] h-[28px] px-2 rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
