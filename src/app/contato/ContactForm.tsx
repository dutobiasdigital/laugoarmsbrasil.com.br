"use client";

import { useState } from "react";
import { useRecaptcha } from "@/hooks/useRecaptcha";

const inputCls =
  "w-full bg-[#0e1520] border border-[#141d2c] rounded-[6px] h-[44px] px-4 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f]";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { executeRecaptcha } = useRecaptcha();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd) as Record<string, string>;

    // Inject reCAPTCHA token (no-op when key not configured)
    body._recaptchaToken = await executeRecaptcha("contact");

    const res = await fetch("/api/contato", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao enviar. Tente novamente.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-5 text-center py-16">
        <div className="w-[64px] h-[64px] rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center text-[28px]">
          ✓
        </div>
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[28px]">
          Mensagem enviada!
        </h3>
        <p className="text-[#7a9ab5] text-[15px] max-w-[400px]">
          Recebemos sua mensagem e responderemos em até{" "}
          <strong className="text-[#d4d4da]">2 dias úteis</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nome *</label>
          <input type="text" name="name" required placeholder="Seu nome" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>E-mail *</label>
          <input type="email" name="email" required placeholder="seu@email.com" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Assunto *</label>
        <select
          name="subject"
          required
          defaultValue=""
          className="w-full bg-[#0e1520] border border-[#141d2c] rounded-[6px] h-[44px] px-4 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f]"
        >
          <option value="" disabled>Selecione um assunto</option>
          <option value="assinatura">Assinatura / Pagamento</option>
          <option value="conteudo">Conteúdo editorial</option>
          <option value="publicidade">Publicidade</option>
          <option value="tecnico">Problema técnico</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Mensagem *</label>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Descreva sua mensagem com detalhes..."
          className="w-full bg-[#0e1520] border border-[#141d2c] rounded-[6px] px-4 py-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[15px] font-semibold h-[50px] rounded-[6px] transition-colors"
      >
        {loading ? "Enviando..." : "Enviar mensagem →"}
      </button>

      <p className="text-white text-[12px]">Respondemos em até 2 dias úteis.</p>
    </form>
  );
}
