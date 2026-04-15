"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls, areaCls } from "./_ConfiguracoesClient";

interface Props { settings: Record<string, string>; }

const KEYS = [
  "empresa.razao_social", "empresa.cnpj", "empresa.endereco",
  "empresa.cidade", "empresa.estado", "empresa.cep",
  "empresa.telefone", "empresa.email_geral", "empresa.email_comercial",
  "empresa.email_suporte", "empresa.horario_atendimento", "empresa.copyright",
];

export default function TabEmpresa({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function set(key: string, val: string) { setValues(v => ({ ...v, [key]: val })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const result = await saveSettings(values);
    if (result.error) setError(result.error);
    else setSaved(true);
    setSaving(false);
    if (result.ok) setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">Empresa</h2>
        <p className="text-[#526888] text-[13px]">Dados institucionais — usados no footer, página de contato e mídia kit.</p>
      </div>

      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>}

      {/* Dados legais */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">📋 Dados Legais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Razão Social</label>
            <input value={values["empresa.razao_social"]} onChange={e => set("empresa.razao_social", e.target.value)}
              placeholder="Editora Magnum Ltda" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>CNPJ</label>
            <input value={values["empresa.cnpj"]} onChange={e => set("empresa.cnpj", e.target.value)}
              placeholder="00.000.000/0000-00" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Endereço */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">📍 Endereço</h3>
        <div>
          <label className={labelCls}>Logradouro</label>
          <input value={values["empresa.endereco"]} onChange={e => set("empresa.endereco", e.target.value)}
            placeholder="Av. Paulista, 1000 — sala 101" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Cidade</label>
            <input value={values["empresa.cidade"]} onChange={e => set("empresa.cidade", e.target.value)}
              placeholder="São Paulo" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Estado</label>
            <input value={values["empresa.estado"]} onChange={e => set("empresa.estado", e.target.value)}
              placeholder="SP" maxLength={2} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>CEP</label>
            <input value={values["empresa.cep"]} onChange={e => set("empresa.cep", e.target.value)}
              placeholder="01310-100" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">📞 Contato</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Telefone Principal</label>
            <input value={values["empresa.telefone"]} onChange={e => set("empresa.telefone", e.target.value)}
              placeholder="(11) 3333-4444" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Horário de Atendimento</label>
            <input value={values["empresa.horario_atendimento"]} onChange={e => set("empresa.horario_atendimento", e.target.value)}
              placeholder="Seg–Sex, 9h às 18h" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail Geral</label>
            <input value={values["empresa.email_geral"]} onChange={e => set("empresa.email_geral", e.target.value)}
              type="email" placeholder="contato@revistamagnum.com.br" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail Comercial / Publicidade</label>
            <input value={values["empresa.email_comercial"]} onChange={e => set("empresa.email_comercial", e.target.value)}
              type="email" placeholder="publicidade@revistamagnum.com.br" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail de Suporte ao Assinante</label>
            <input value={values["empresa.email_suporte"]} onChange={e => set("empresa.email_suporte", e.target.value)}
              type="email" placeholder="suporte@revistamagnum.com.br" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Textos legais */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">⚖️ Textos Legais</h3>
        <div>
          <label className={labelCls}>Texto de Copyright (rodapé)</label>
          <textarea value={values["empresa.copyright"]} onChange={e => set("empresa.copyright", e.target.value)}
            rows={2} placeholder={`© ${new Date().getFullYear()} Revista Magnum. Todos os direitos reservados.`}
            className={areaCls} />
        </div>
      </section>

      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button type="submit" disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
          {saving ? "Salvando..." : "Salvar Empresa"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
      </div>
    </form>
  );
}
