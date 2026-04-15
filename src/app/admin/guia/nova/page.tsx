"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, STATES } from "@/lib/guia";

const inputCls  = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls  = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";
const areaCls   = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full resize-none";

interface FormData {
  name: string; category: string; plan: string; status: string;
  city: string; state: string; zip: string;
  phone: string; whatsapp: string; email: string;
  website: string; instagram: string; address: string;
  description: string; hours: string; notes: string;
  logoUrl: string; featured: boolean;
}

const EMPTY: FormData = {
  name: "", category: "OUTROS", plan: "FREE", status: "ACTIVE",
  city: "", state: "", zip: "", phone: "", whatsapp: "",
  email: "", website: "", instagram: "", address: "",
  description: "", hours: "", notes: "", logoUrl: "", featured: false,
};

export default function NovaGuiaPage() {
  const router = useRouter();
  const [form, setForm]   = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function set(key: keyof FormData, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const payload = {
        ...form,
        phone:       form.phone       || null,
        whatsapp:    form.whatsapp    || null,
        email:       form.email       || null,
        website:     form.website     || null,
        instagram:   form.instagram   || null,
        address:     form.address     || null,
        description: form.description || null,
        hours:       form.hours       || null,
        notes:       form.notes       || null,
        logoUrl:     form.logoUrl     || null,
        zip:         form.zip         || null,
      };
      const res = await fetch("/api/admin/guia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar.");
      router.push(`/admin/guia/${data.id}`);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-[760px]">
      <div className="mb-8">
        <Link href="/admin/guia" className="text-[#526888] text-[13px] hover:text-white transition-colors mb-2 flex items-center gap-1">
          ← Guia Comercial
        </Link>
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">Nova empresa</h1>
      </div>

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f]/30 rounded-[8px] px-4 py-3 mb-6 text-[#ff6b6b] text-[13px]">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Status & Plano */}
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Status & Plano</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                <option value="PENDING">Pendente</option>
                <option value="ACTIVE">Ativo</option>
                <option value="SUSPENDED">Suspenso</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Plano</label>
              <select value={form.plan} onChange={e => set("plan", e.target.value)} className={selectCls}>
                <option value="FREE">Gratuito</option>
                <option value="PREMIUM">Premium</option>
                <option value="DESTAQUE">Destaque</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} className="w-4 h-4" />
                <span className="text-[#d4d4da] text-[13px]">★ Destaque</span>
              </label>
            </div>
          </div>
        </section>

        {/* Dados */}
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Dados da empresa</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nome *</label>
              <input required value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Categoria</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} className={selectCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Horário</label>
              <input value={form.hours} onChange={e => set("hours", e.target.value)} placeholder="Seg–Sex 9h–18h" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>URL do logo</label>
              <input value={form.logoUrl} onChange={e => set("logoUrl", e.target.value)} placeholder="https://..." className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Descrição</label>
              <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} className={areaCls} />
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Localização</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className={labelCls}>Endereço</label>
              <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Rua, número, bairro" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cidade *</label>
              <input required value={form.city} onChange={e => set("city", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado *</label>
              <select required value={form.state} onChange={e => set("state", e.target.value)} className={selectCls}>
                <option value="">—</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>CEP</label>
              <input value={form.zip} onChange={e => set("zip", e.target.value)} placeholder="00000-000" className={inputCls} />
            </div>
          </div>
        </section>

        {/* Contatos */}
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Contatos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "phone",     label: "Telefone",  ph: "(00) 0000-0000" },
              { key: "whatsapp",  label: "WhatsApp",  ph: "5511999999999" },
              { key: "email",     label: "E-mail",    ph: "contato@empresa.com.br" },
              { key: "website",   label: "Site",      ph: "https://..." },
              { key: "instagram", label: "Instagram", ph: "@empresa" },
            ].map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input value={(form as Record<string, string>)[f.key]}
                  onChange={e => set(f.key as keyof FormData, e.target.value)}
                  placeholder={f.ph} className={inputCls} />
              </div>
            ))}
          </div>
        </section>

        {/* Notas */}
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Notas internas</p>
          <textarea rows={3} value={form.notes} onChange={e => set("notes", e.target.value)} className={areaCls} />
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[40px] px-6 rounded-[6px] transition-colors">
            {saving ? "Criando..." : "Criar empresa"}
          </button>
          <Link href="/admin/guia"
            className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[14px] h-[40px] px-5 flex items-center rounded-[6px] transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
