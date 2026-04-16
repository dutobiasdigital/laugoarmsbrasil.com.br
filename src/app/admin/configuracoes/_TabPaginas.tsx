"use client";

import { useState } from "react";
import { inputCls, labelCls, areaCls } from "./_ConfiguracoesClient";

/* ── Seção de página ─────────────────────────────────────────── */
function PaginaSection({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  const [titulo, setTitulo]     = useState("");
  const [slug, setSlug]         = useState("");
  const [conteudo, setConteudo] = useState("");

  function handleTituloChange(v: string) {
    setTitulo(v);
    if (!slug) {
      setSlug(
        v.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      );
    }
  }

  return (
    <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3 pb-2 border-b border-[#141d2c]">
        <span className="text-[22px]">{icon}</span>
        <div>
          <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] leading-none">{title}</h3>
          <p className="text-[#526888] text-[12px] mt-0.5">{desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Título da página</label>
          <input
            value={titulo}
            onChange={(e) => handleTituloChange(e.target.value)}
            placeholder={title}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Slug (URL)</label>
          <div className="flex items-center">
            <span className="bg-[#0e1520] border border-r-0 border-[#1c2a3e] rounded-l-[6px] h-[40px] px-3 flex items-center text-[#526888] text-[13px] whitespace-nowrap">/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="termos-de-uso"
              className="bg-[#070a12] border border-[#1c2a3e] rounded-r-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] flex-1 transition-colors"
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Conteúdo HTML</label>
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={10}
          placeholder={`<h1>${title}</h1>\n<p>Conteúdo da página...</p>`}
          className={`${areaCls} font-mono text-[13px]`}
        />
        <p className="text-[#526888] text-[11px] mt-1.5">
          Suporta HTML. Use tags como &lt;h1&gt;, &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;a&gt;, etc.
        </p>
      </div>

      {conteudo && (
        <div className="border border-[#1c2a3e] rounded-[8px] p-4">
          <p className="text-[#526888] text-[11px] font-semibold mb-2 uppercase tracking-wide">Pré-visualização</p>
          <div
            className="prose prose-invert prose-sm max-w-none text-[#d4d4da] text-[13px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: conteudo }}
          />
        </div>
      )}
    </section>
  );
}

/* ── Componente principal ────────────────────────────────────── */
export default function TabPaginas() {
  return (
    <div className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">
          Páginas
        </h2>
        <p className="text-[#526888] text-[13px]">
          Configure o conteúdo das páginas institucionais do site.
        </p>
      </div>

      <div className="bg-[#141d2c] border border-[#1c2a3e] rounded-[8px] px-4 py-3 flex items-center gap-3">
        <span className="text-[18px]">🚧</span>
        <p className="text-[#7a9ab5] text-[13px]">
          Integração com banco de dados em implementação. As páginas podem ser criadas mas ainda não são salvas automaticamente.
        </p>
      </div>

      <PaginaSection
        icon="⚖️"
        title="Termos de Uso"
        desc="Condições de uso do site e dos serviços oferecidos"
      />

      <PaginaSection
        icon="🔒"
        title="Política de Privacidade"
        desc="Como tratamos os dados pessoais dos usuários (LGPD)"
      />

      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button
          type="button"
          disabled
          className="bg-[#ff1f1f] opacity-40 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] cursor-not-allowed"
        >
          Salvar Páginas
        </button>
        <p className="text-[#526888] text-[12px]">Disponível em breve</p>
      </div>
    </div>
  );
}
