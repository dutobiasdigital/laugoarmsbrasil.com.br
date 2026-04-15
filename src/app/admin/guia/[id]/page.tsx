"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, STATES, PLAN_LABELS, STATUS_LABELS } from "@/lib/guia";

const inputCls  = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls  = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";
const areaCls   = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full resize-none";

interface Listing {
  id: string; slug: string; name: string; category: string;
  plan: string; status: string;
  description: string | null; logoUrl: string | null;
  phone: string | null; whatsapp: string | null; email: string | null;
  website: string | null; instagram: string | null;
  address: string | null; city: string; state: string; zip: string | null;
  hours: string | null; featured: boolean; notes: string | null;
  viewsCount: number; clicksCount: number; planExpiresAt: string | null;
}

export default function EditarGuiaPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [listing, setListing]   = useState<Listing | null>(null);
  const [form, setForm]         = useState<Partial<Listing>>({});
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg]           = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/guia?id=${id}`)
      .then(r => r.json())
      .then((d: Listing) => {
        setListing(d);
        setForm(d);
      })
      .finally(() => setLoading(false));
    setLoading(true);
  }, [id]);

  function set<K extends keyof Listing>(key: K, value: Listing[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/guia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      setMsg({ type: "success", text: "Salvo com sucesso!" });
      setListing({ ...listing!, ...form });
    } catch (e: unknown) {
      setMsg({ type: "error", text: (e as Error).message });
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/guia", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Erro ao excluir.");
      router.push("/admin/guia");
    } catch (e: unknown) {
      setMsg({ type: "error", text: (e as Error).message });
      setDelConfirm(false);
    }
    setDeleting(false);
  }

  if (loading || !listing) {
    return <div className="text-[#526888] text-[14px] py-20 text-center">Carregando...</div>;
  }

  const pl = PLAN_LABELS[listing.plan];
  const sl = STATUS_LABELS[listing.status];

  return (
    <div className="max-w-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/guia" className="text-[#526888] text-[13px] hover:text-white transition-colors mb-2 flex items-center gap-1">
            ← Guia Comercial
          </Link>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">{listing.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] ${pl.color}`}>{pl.label}</span>
            <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] ${sl.color}`}>{sl.label}</span>
            <span className="text-[#253750] text-[12px]">{listing.viewsCount} views</span>
          </div>
        </div>
        <Link href={`/guia/empresa/${listing.slug}`} target="_blank"
          className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[13px] h-[36px] px-4 flex items-center rounded-[6px] transition-colors gap-2">
          ↗ Ver perfil
        </Link>
      </div>

      {msg && (
        <div className={`rounded-[8px] px-4 py-3 mb-6 text-[13px] ${
          msg.type === "success" ? "bg-[#0f381f] text-[#22c55e]" : "bg-[#2d0a0a] border border-[#ff1f1f]/30 text-[#ff6b6b]"
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-8">

        {/* Status & Plano */}
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Status & Plano</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status ?? ""} onChange={e => set("status", e.target.value)} className={selectCls}>
                {Object.entries(STATUS_LABELS).map(([v, s]) => (
                  <option key={v} value={v}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Plano</label>
              <select value={form.plan ?? ""} onChange={e => set("plan", e.target.value)} className={selectCls}>
                {Object.entries(PLAN_LABELS).map(([v, p]) => (
                  <option key={v} value={v}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Plano expira em</label>
              <input type="date" value={form.planExpiresAt ? form.planExpiresAt.slice(0, 10) : ""}
                onChange={e => set("planExpiresAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
                className={inputCls} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured ?? false}
                  onChange={e => set("featured", e.target.checked)}
                  className="w-4 h-4 rounded" />
                <span className="text-[#d4d4da] text-[13px]">★ Destaque</span>
              </label>
            </div>
          </div>
        </section>

        {/* Dados da empresa */}
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Dados da empresa</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nome *</label>
              <input required value={form.name ?? ""} onChange={e => set("name", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Categoria</label>
              <select value={form.category ?? ""} onChange={e => set("category", e.target.value)} className={selectCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input value={form.slug ?? ""} onChange={e => set("slug", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>URL do logo</label>
              <input value={form.logoUrl ?? ""} onChange={e => set("logoUrl", e.target.value || null)}
                placeholder="https://..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Horário de funcionamento</label>
              <input value={form.hours ?? ""} onChange={e => set("hours", e.target.value || null)}
                placeholder="Seg–Sex 9h–18h" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Descrição</label>
              <textarea rows={4} value={form.description ?? ""} onChange={e => set("description", e.target.value || null)}
                className={areaCls} />
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Localização</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className={labelCls}>Endereço completo</label>
              <input value={form.address ?? ""} onChange={e => set("address", e.target.value || null)}
                placeholder="Rua, número, bairro" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cidade *</label>
              <input required value={form.city ?? ""} onChange={e => set("city", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado *</label>
              <select required value={form.state ?? ""} onChange={e => set("state", e.target.value)} className={selectCls}>
                <option value="">—</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>CEP</label>
              <input value={form.zip ?? ""} onChange={e => set("zip", e.target.value || null)}
                placeholder="00000-000" className={inputCls} />
            </div>
          </div>
        </section>

        {/* Contatos */}
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Contatos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { key: "phone",     label: "Telefone",   ph: "(00) 0000-0000" },
              { key: "whatsapp",  label: "WhatsApp",   ph: "5511999999999" },
              { key: "email",     label: "E-mail",     ph: "contato@empresa.com.br" },
              { key: "website",   label: "Site",       ph: "https://..." },
              { key: "instagram", label: "Instagram",  ph: "@empresa" },
            ] as const).map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input value={(form as Record<string, string | null>)[f.key] ?? ""}
                  onChange={e => set(f.key as keyof Listing, e.target.value || null as never)}
                  placeholder={f.ph} className={inputCls} />
              </div>
            ))}
          </div>
        </section>

        {/* Notas internas */}
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Notas internas</p>
          <textarea rows={3} value={form.notes ?? ""} onChange={e => set("notes", e.target.value || null)}
            placeholder="Observações para a equipe..." className={areaCls} />
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[40px] px-6 rounded-[6px] transition-colors">
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <Link href="/admin/guia"
              className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[14px] h-[40px] px-5 flex items-center rounded-[6px] transition-colors">
              Cancelar
            </Link>
          </div>
          {!delConfirm ? (
            <button type="button" onClick={() => setDelConfirm(true)}
              className="text-[#526888] hover:text-[#ff6b6b] text-[13px] transition-colors">
              Excluir empresa
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[#ff6b6b] text-[13px]">Confirmar exclusão?</span>
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="bg-[#2d0a0a] border border-[#ff1f1f]/30 hover:bg-[#3d0a0a] text-[#ff6b6b] text-[13px] h-[32px] px-4 rounded-[6px] transition-colors disabled:opacity-50">
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
              <button type="button" onClick={() => setDelConfirm(false)}
                className="text-[#526888] hover:text-white text-[13px] transition-colors">Cancelar</button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
