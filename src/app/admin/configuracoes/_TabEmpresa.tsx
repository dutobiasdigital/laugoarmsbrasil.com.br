"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls, areaCls, selectCls } from "./_ConfiguracoesClient";
import TabRedes from "./_TabRedes";
import TabFiliais from "./_TabFiliais";

interface Props { settings: Record<string, string>; }

const SUB_TABS = [
  { id: "dados",   label: "Dados da Empresa" },
  { id: "filiais", label: "Filiais" },
  { id: "redes",   label: "Redes Sociais" },
];

// Chaves que vêm do Supabase e serão salvas de volta
const KEYS = [
  // Identidade pública (compartilhadas com SEO)
  "site.name", "site.tagline", "site.domain",
  // Dados legais
  "empresa.razao_social", "empresa.cnpj",
  // Endereço
  "empresa.endereco", "empresa.cidade", "empresa.estado", "empresa.cep",
  // Contato
  "empresa.telefone", "empresa.email_geral", "empresa.email_comercial",
  "empresa.email_suporte", "empresa.horario_atendimento",
  // SEO da empresa
  "site.description", "site.keywords",
  // Legal
  "empresa.copyright",
];

const TIMEZONES = [
  "America/Sao_Paulo", "America/Manaus", "America/Belem",
  "America/Fortaleza", "America/Recife", "America/Cuiaba",
  "America/Porto_Velho", "America/Boa_Vista", "America/Noronha",
];

export default function TabEmpresa({ settings }: Props) {
  const [sub, setSub] = useState("dados");

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-tab nav */}
      <div className="flex gap-1 bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-1">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSub(t.id)}
            className={`flex-1 h-[36px] rounded-[8px] text-[13px] font-medium transition-colors ${
              sub === t.id
                ? "bg-[#ff1f1f] text-white"
                : "text-[#7a9ab5] hover:text-white hover:bg-[#141d2c]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "dados"   && <TabDados settings={settings} />}
      {sub === "filiais" && <TabFiliais />}
      {sub === "redes"   && <TabRedes settings={settings} />}
    </div>
  );
}

/* ── Sub-componente: Dados da Empresa ──────────────────────────────── */
function TabDados({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function set(key: string, val: string) { setValues((v) => ({ ...v, [key]: val })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const result = await saveSettings(values);
    if (result.error) setError(result.error);
    else setSaved(true);
    setSaving(false);
    if (result.ok) setTimeout(() => setSaved(false), 3000);
  }

  const descLen = values["site.description"]?.length ?? 0;
  const descOk  = descLen >= 120 && descLen <= 160;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-[720px]">
      <div>
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] leading-none mb-1">
          Dados da Empresa
        </h3>
        <p className="text-[#526888] text-[13px]">
          Identidade, localização, contato, SEO e textos institucionais.
        </p>
      </div>

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* Identidade */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          🪪 Identidade
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome do Site / Marca</label>
            <input
              value={values["site.name"]}
              onChange={(e) => set("site.name", e.target.value)}
              placeholder="Revista Magnum"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Slogan / Tagline</label>
            <input
              value={values["site.tagline"]}
              onChange={(e) => set("site.tagline", e.target.value)}
              placeholder="O Mundo das Armas em Suas Mãos"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Domínio (URL canônica)</label>
          <input
            value={values["site.domain"]}
            onChange={(e) => set("site.domain", e.target.value)}
            placeholder="https://www.revistamagnum.com.br"
            type="url"
            className={inputCls}
          />
          <p className="text-[#526888] text-[11px] mt-1">
            Sem barra no final. Usado em canonical URLs e sitemaps.
          </p>
        </div>
      </section>

      {/* Dados Legais */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          📋 Dados Legais
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Razão Social</label>
            <input
              value={values["empresa.razao_social"]}
              onChange={(e) => set("empresa.razao_social", e.target.value)}
              placeholder="Editora Magnum Ltda"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>CNPJ</label>
            <input
              value={values["empresa.cnpj"]}
              onChange={(e) => set("empresa.cnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Endereço Sede */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          📍 Endereço — Sede
        </h4>
        <div>
          <label className={labelCls}>Logradouro</label>
          <input
            value={values["empresa.endereco"]}
            onChange={(e) => set("empresa.endereco", e.target.value)}
            placeholder="Av. Paulista, 1000 — sala 101"
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Cidade</label>
            <input
              value={values["empresa.cidade"]}
              onChange={(e) => set("empresa.cidade", e.target.value)}
              placeholder="São Paulo"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Estado</label>
            <select
              value={values["empresa.estado"]}
              onChange={(e) => set("empresa.estado", e.target.value)}
              className={selectCls}
            >
              <option value="">UF</option>
              {["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"].map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>CEP</label>
            <input
              value={values["empresa.cep"]}
              onChange={(e) => set("empresa.cep", e.target.value)}
              placeholder="01310-100"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          📞 Contato
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Telefone Principal</label>
            <input
              value={values["empresa.telefone"]}
              onChange={(e) => set("empresa.telefone", e.target.value)}
              placeholder="(11) 3333-4444"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Horário de Atendimento</label>
            <input
              value={values["empresa.horario_atendimento"]}
              onChange={(e) => set("empresa.horario_atendimento", e.target.value)}
              placeholder="Seg–Sex, 9h às 18h"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>E-mail Geral</label>
            <input
              value={values["empresa.email_geral"]}
              onChange={(e) => set("empresa.email_geral", e.target.value)}
              type="email"
              placeholder="contato@revistamagnum.com.br"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>E-mail Comercial / Publicidade</label>
            <input
              value={values["empresa.email_comercial"]}
              onChange={(e) => set("empresa.email_comercial", e.target.value)}
              type="email"
              placeholder="publicidade@revistamagnum.com.br"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>E-mail de Suporte ao Assinante</label>
            <input
              value={values["empresa.email_suporte"]}
              onChange={(e) => set("empresa.email_suporte", e.target.value)}
              type="email"
              placeholder="suporte@revistamagnum.com.br"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* SEO da empresa */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          🌐 SEO — Descrição e Palavras-chave
        </h4>

        <div>
          <label className={labelCls}>
            Meta description padrão
            <span className={`ml-2 font-normal ${descOk ? "text-[#22c55e]" : "text-[#526888]"}`}>
              {descLen}/160{" "}
              {descOk ? "✓ ideal" : descLen < 120 ? "(mín. 120)" : "(máx. 160)"}
            </span>
          </label>
          <textarea
            value={values["site.description"]}
            onChange={(e) => set("site.description", e.target.value)}
            rows={3}
            placeholder="O maior acervo de publicações especializadas em armas, munições e legislação do Brasil."
            className={areaCls}
          />
        </div>

        <div>
          <label className={labelCls}>Palavras-chave (separadas por vírgula)</label>
          <input
            value={values["site.keywords"]}
            onChange={(e) => set("site.keywords", e.target.value)}
            placeholder="revista de armas, tiro esportivo, CAC, munições, legislação"
            className={inputCls}
          />
          <p className="text-[#526888] text-[11px] mt-1">
            Adicione ou remova termos separados por vírgula.
          </p>
        </div>
      </section>

      {/* Copyright */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          ⚖️ Textos Legais
        </h4>
        <div>
          <label className={labelCls}>Texto de Copyright (rodapé)</label>
          <textarea
            value={values["empresa.copyright"]}
            onChange={(e) => set("empresa.copyright", e.target.value)}
            rows={2}
            placeholder={`© ${new Date().getFullYear()} Revista Magnum. Todos os direitos reservados.`}
            className={areaCls}
          />
        </div>
      </section>

      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors"
        >
          {saving ? "Salvando..." : "Salvar Empresa"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
      </div>
    </form>
  );
}
