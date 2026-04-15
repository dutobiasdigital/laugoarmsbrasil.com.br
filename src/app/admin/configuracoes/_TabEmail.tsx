"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls, selectCls } from "./_ConfiguracoesClient";

interface Props { settings: Record<string, string>; }

const KEYS = [
  "smtp.host", "smtp.port", "smtp.user", "smtp.password",
  "smtp.secure", "smtp.from_name", "smtp.from_email", "smtp.reply_to",
];

export default function TabEmail({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
    if (!init["smtp.port"]) init["smtp.port"] = "587";
    if (!init["smtp.secure"]) init["smtp.secure"] = "tls";
    return init;
  });
  const [saving, setSaving]   = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [testMsg, setTestMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

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

  async function handleTest() {
    setTesting(true); setTestMsg(null);
    try {
      const res = await fetch("/api/admin/settings/test-email", { method: "POST" });
      const data = await res.json();
      setTestMsg(res.ok
        ? { type: "success", text: "E-mail de teste enviado! Verifique sua caixa de entrada." }
        : { type: "error", text: data.error ?? "Falha no teste de e-mail." }
      );
    } catch {
      setTestMsg({ type: "error", text: "Erro de conexão." });
    }
    setTesting(false);
  }

  const isConfigured = values["smtp.host"] && values["smtp.user"] && values["smtp.password"];

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">E-mail / SMTP</h2>
        <p className="text-[#526888] text-[13px]">Configure o servidor de envio para e-mails transacionais: bem-vindo, confirmação de pagamento, recuperação de senha.</p>
      </div>

      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>}
      {testMsg && (
        <div className={`rounded-[8px] px-4 py-3 text-[13px] ${testMsg.type === "success" ? "bg-[#0f381f] text-[#22c55e]" : "bg-[#2d0a0a] border border-[#ff1f1f] text-[#ff6b6b]"}`}>
          {testMsg.text}
        </div>
      )}

      {/* Servidor */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🖥 Servidor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Host SMTP</label>
            <input value={values["smtp.host"]} onChange={e => set("smtp.host", e.target.value)}
              placeholder="smtp.hostinger.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Porta</label>
            <input value={values["smtp.port"]} onChange={e => set("smtp.port", e.target.value)}
              placeholder="587" type="number" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Segurança</label>
          <select value={values["smtp.secure"]} onChange={e => set("smtp.secure", e.target.value)} className={selectCls}>
            <option value="tls">TLS / STARTTLS (porta 587 — recomendado)</option>
            <option value="ssl">SSL (porta 465)</option>
            <option value="none">Sem criptografia (porta 25 — não recomendado)</option>
          </select>
        </div>
      </section>

      {/* Autenticação */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🔑 Autenticação</h3>
        <div>
          <label className={labelCls}>Usuário (e-mail de login)</label>
          <input value={values["smtp.user"]} onChange={e => set("smtp.user", e.target.value)}
            type="email" placeholder="noreply@revistamagnum.com.br" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Senha</label>
          <div className="relative">
            <input value={values["smtp.password"]} onChange={e => set("smtp.password", e.target.value)}
              type={showPass ? "text" : "password"} placeholder="••••••••••••"
              className={inputCls + " pr-[80px]"} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526888] hover:text-[#7a9ab5] text-[11px] font-semibold transition-colors">
              {showPass ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <p className="text-[#253750] text-[11px] mt-1">Armazenada de forma segura no banco de dados.</p>
        </div>
      </section>

      {/* Remetente */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">✉️ Remetente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome do Remetente</label>
            <input value={values["smtp.from_name"]} onChange={e => set("smtp.from_name", e.target.value)}
              placeholder="Revista Magnum" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail Remetente (From)</label>
            <input value={values["smtp.from_email"]} onChange={e => set("smtp.from_email", e.target.value)}
              type="email" placeholder="noreply@revistamagnum.com.br" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail de Resposta (Reply-To)</label>
            <input value={values["smtp.reply_to"]} onChange={e => set("smtp.reply_to", e.target.value)}
              type="email" placeholder="contato@revistamagnum.com.br" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Testar */}
      {isConfigured && (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[#d4d4da] text-[14px] font-semibold">Testar configuração</p>
            <p className="text-[#526888] text-[12px]">Envia um e-mail de teste para o administrador logado.</p>
          </div>
          <button type="button" onClick={handleTest} disabled={testing}
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-[#ff1f1f]/50 hover:text-white text-[#7a9ab5] text-[13px] font-semibold h-[38px] px-5 rounded-[6px] transition-colors whitespace-nowrap shrink-0">
            {testing ? "Enviando..." : "📤 Testar agora"}
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button type="submit" disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
          {saving ? "Salvando..." : "Salvar E-mail / SMTP"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
      </div>
    </form>
  );
}
