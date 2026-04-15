"use client";

import { useState } from "react";

const inputCls =
  "bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] h-[44px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls =
  "bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] h-[44px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";

const INTERESTS = [
  { value: "BILLBOARD",    label: "Billboard — Topo da home (970×250)" },
  { value: "LEADERBOARD",  label: "Leaderboard — Topo de páginas (728×90)" },
  { value: "MED_RECT",     label: "Medium Rectangle — Sidebar/Inline (300×250)" },
  { value: "HALF_PAGE",    label: "Half Page — Sidebar fixa (300×600)" },
  { value: "LARGE_MOBILE", label: "Large Mobile Banner (320×100)" },
  { value: "PACOTE",       label: "Pacote completo / personalizado" },
];

export default function AnuncieForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd   = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd);

    const res = await fetch("/api/anuncie", {
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
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
        <div className="w-[56px] h-[56px] bg-[#0f381f] rounded-full flex items-center justify-center text-[26px]">
          ✓
        </div>
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[28px]">
          Solicitação recebida!
        </h3>
        <p className="text-[#7a9ab5] text-[15px] leading-[24px] max-w-[360px]">
          Nossa equipe entrará em contato em até{" "}
          <strong className="text-[#d4d4da]">24 horas</strong> pelo e-mail ou WhatsApp
          informados.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 lg:p-8 flex flex-col gap-4"
    >
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* Nome fantasia + razão social */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nome Fantasia *</label>
          <input
            name="tradeName"
            required
            placeholder="Ex: Dufex Armas"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Razão Social</label>
          <input
            name="legalName"
            placeholder="Ex: Dufex Comércio Ltda"
            className={inputCls}
          />
        </div>
      </div>

      {/* Segmento */}
      <div>
        <label className={labelCls}>Segmento *</label>
        <select name="segment" defaultValue="OUTROS" className={selectCls}>
          <option value="ARMAS">Armas</option>
          <option value="MUNICOES">Munições</option>
          <option value="ACESSORIOS">Acessórios</option>
          <option value="CACA">Caça</option>
          <option value="TIRO_ESPORTIVO">Tiro Esportivo</option>
          <option value="OUTROS">Outros</option>
        </select>
      </div>

      {/* Contato + Telefone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nome do Contato *</label>
          <input
            name="contact"
            required
            placeholder="Nome do responsável"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Telefone / WhatsApp *</label>
          <input
            name="phone"
            required
            placeholder="(11) 99999-9999"
            className={inputCls}
          />
        </div>
      </div>

      {/* E-mail + Site */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>E-mail *</label>
          <input
            name="email"
            type="email"
            required
            placeholder="contato@empresa.com.br"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Site</label>
          <input
            name="website"
            type="url"
            placeholder="https://www.empresa.com.br"
            className={inputCls}
          />
        </div>
      </div>

      {/* Instagram + Endereço */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Instagram</label>
          <input name="instagram" placeholder="@empresa" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Cidade / Estado</label>
          <input
            name="address"
            placeholder="São Paulo, SP"
            className={inputCls}
          />
        </div>
      </div>

      {/* Interesse */}
      <div>
        <label className={labelCls}>Formato de interesse</label>
        <select name="interests" defaultValue="" className={selectCls}>
          <option value="">Selecione ou deixe em branco...</option>
          {INTERESTS.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mensagem */}
      <div>
        <label className={labelCls}>Mensagem / Observações</label>
        <textarea
          name="message"
          rows={3}
          placeholder="Conte sobre sua campanha, objetivos ou dúvidas..."
          className="bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] px-3 py-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[15px] font-semibold h-[52px] rounded-[6px] transition-colors mt-1"
      >
        {loading ? "Enviando..." : "Enviar solicitação →"}
      </button>

      <p className="text-[#253750] text-[12px] text-center">
        Seus dados são usados apenas para fins comerciais e não são compartilhados com terceiros.
      </p>
    </form>
  );
}
