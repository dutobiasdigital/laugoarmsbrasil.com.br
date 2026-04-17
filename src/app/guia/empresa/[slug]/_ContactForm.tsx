"use client";

import { useState } from "react";

interface Props {
  companyId:   string;
  companyName: string;
}

export default function ContactForm({ companyId, companyName }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]             = useState(false);
  const [error, setError]           = useState<string | null>(null);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setError("Nome e mensagem são obrigatórios.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/guia/interaction", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          id:      companyId,
          type:    "FORM",
          payload: form,
        }),
      });
      if (!res.ok) throw new Error("Erro ao enviar");
      setSent(true);
    } catch {
      setError("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "bg-[#070a12] border border-[#1c2a3e] rounded-[8px] h-[44px] px-4 text-[14px] text-[#d4d4da] placeholder-white/25 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
  const labelCls = "block text-[#526888] text-[12px] font-semibold mb-1.5 uppercase tracking-[0.5px]";

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
        <div className="w-[56px] h-[56px] bg-[#0f381f] rounded-full flex items-center justify-center text-[28px]">
          ✅
        </div>
        <p className="text-white text-[18px] font-bold">Mensagem enviada!</p>
        <p className="text-[#526888] text-[14px] max-w-[320px]">
          Sua mensagem foi registrada. A equipe de <strong className="text-[#d4d4da]">{companyName}</strong> entrará em contato em breve.
        </p>
        <button
          onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
          className="text-[#ff1f1f] hover:text-white text-[13px] transition-colors mt-2"
        >
          Enviar outra mensagem →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nome <span className="text-[#ff1f1f]">*</span></label>
          <input
            className={inputCls}
            placeholder="Seu nome completo"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>E-mail</label>
          <input
            className={inputCls}
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Telefone / WhatsApp</label>
          <input
            className={inputCls}
            placeholder="(11) 99999-9999"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Assunto</label>
          <input
            className={inputCls}
            placeholder="Como podemos ajudar?"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Mensagem <span className="text-[#ff1f1f]">*</span></label>
        <textarea
          className="bg-[#070a12] border border-[#1c2a3e] rounded-[8px] px-4 py-3 text-[14px] text-[#d4d4da] placeholder-white/25 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors resize-none"
          rows={5}
          placeholder={`Olá! Gostaria de saber mais sobre ${companyName}...`}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[15px] font-semibold h-[48px] rounded-[8px] transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="w-[16px] h-[16px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Mensagem →"
        )}
      </button>

      <p className="text-[#526888] text-[11px] text-center">
        Sua mensagem será encaminhada para a empresa. Nenhum dado é compartilhado com terceiros.
      </p>
    </form>
  );
}
