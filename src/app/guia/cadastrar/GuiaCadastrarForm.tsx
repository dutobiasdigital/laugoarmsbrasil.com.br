"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, STATES } from "@/lib/guia";

const inputCls  = "bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] h-[44px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
const selectCls = "bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] h-[44px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
const labelCls  = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const areaCls   = "bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors resize-none";

interface FormData {
  name: string; category: string;
  city: string; state: string;
  phone: string; whatsapp: string; email: string;
  website: string; instagram: string;
  address: string; description: string; message: string;
}

const EMPTY: FormData = {
  name: "", category: "", city: "", state: "",
  phone: "", whatsapp: "", email: "", website: "", instagram: "",
  address: "", description: "", message: "",
};

export default function GuiaCadastrarForm() {
  const [form, setForm]         = useState<FormData>(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  function set(key: keyof FormData, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/guia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar.");
      setSuccess(true);
      setForm(EMPTY);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-[480px] mx-auto">
        <div className="w-[72px] h-[72px] bg-[#0f381f] border border-[#22c55e]/30 rounded-full flex items-center justify-center text-[36px] mb-6">✅</div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] mb-3">Cadastro enviado!</h2>
        <p className="text-[#7a9ab5] text-[15px] leading-[24px] mb-8">
          Recebemos os dados da sua empresa. Nossa equipe irá validar e publicar em até 24 horas. Você será notificado por e-mail.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/guia"
            className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
            Ver o Guia Comercial
          </Link>
          <button onClick={() => setSuccess(false)}
            className="bg-[#0e1520] border border-[#1c2a3e] hover:border-zinc-600 text-[#d4d4da] text-[14px] h-[44px] px-6 rounded-[6px] transition-colors">
            Cadastrar outra empresa
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-[720px]">

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f]/30 rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* Dados da empresa */}
      <section>
        <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-1">Passo 1</p>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[24px] mb-5">Dados da empresa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nome da empresa *</label>
            <input required value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="Ex: Armas & Defesa SP" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Categoria *</label>
            <select required value={form.category} onChange={e => set("category", e.target.value)} className={selectCls}>
              <option value="">Selecione...</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Estado *</label>
            <select required value={form.state} onChange={e => set("state", e.target.value)} className={selectCls}>
              <option value="">Selecione...</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Cidade *</label>
            <input required value={form.city} onChange={e => set("city", e.target.value)}
              placeholder="Ex: São Paulo" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Endereço completo</label>
            <input value={form.address} onChange={e => set("address", e.target.value)}
              placeholder="Rua, número, bairro" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Descrição da empresa</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Descreva os serviços e diferenciais da sua empresa..."
              className={areaCls}
            />
            <p className="text-[#253750] text-[11px] mt-1">{form.description.length}/500 caracteres recomendados</p>
          </div>
        </div>
      </section>

      <div className="border-t border-[#141d2c]" />

      {/* Contato */}
      <section>
        <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-1">Passo 2</p>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[24px] mb-5">Contatos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Telefone</label>
            <input value={form.phone} onChange={e => set("phone", e.target.value)}
              placeholder="(00) 0000-0000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp</label>
            <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)}
              placeholder="5511999999999 (com DDI)" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail comercial</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="contato@suaempresa.com.br" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Site</label>
            <input value={form.website} onChange={e => set("website", e.target.value)}
              placeholder="https://suaempresa.com.br" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Instagram</label>
            <input value={form.instagram} onChange={e => set("instagram", e.target.value)}
              placeholder="@suaempresa" className={inputCls} />
          </div>
        </div>
      </section>

      <div className="border-t border-[#141d2c]" />

      {/* Mensagem adicional */}
      <section>
        <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-1">Passo 3</p>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[24px] mb-2">Informações adicionais</h2>
        <p className="text-[#526888] text-[13px] mb-5">Alguma informação extra para nossa equipe? Interesse em planos pagos?</p>
        <textarea rows={3} value={form.message} onChange={e => set("message", e.target.value)}
          placeholder="Ex: Tenho interesse no plano Destaque. Meu horário de atendimento é..."
          className={areaCls} />
      </section>

      {/* Aviso plano gratuito */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4 flex gap-3">
        <span className="text-[20px] shrink-0">ℹ️</span>
        <div>
          <p className="text-[#d4d4da] text-[13px] font-semibold mb-0.5">Cadastro gratuito — plano FREE</p>
          <p className="text-[#526888] text-[12px]">
            Seu cadastro será publicado no plano gratuito após aprovação manual. Para planos Premium (R$ 79/mês) ou Destaque (R$ 149/mês) com mais visibilidade, entre em contato: <a href="mailto:publicidade@revistamagnum.com.br" className="text-[#7a9ab5] hover:text-white transition-colors">publicidade@revistamagnum.com.br</a>
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[15px] font-semibold h-[52px] px-8 rounded-[8px] transition-colors self-start"
      >
        {loading ? "Enviando..." : "Enviar cadastro →"}
      </button>
    </form>
  );
}
