"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls } from "./_ConfiguracoesClient";

interface Props { settings: Record<string, string>; }

const EVENTOS = [
  { key: "notify.novo_assinante",    label: "Novo assinante",             desc: "Quando um usuário assina um plano." },
  { key: "notify.pagamento_ok",      label: "Pagamento aprovado",         desc: "Quando um pagamento é confirmado." },
  { key: "notify.pagamento_falhou",  label: "Pagamento reprovado",        desc: "Quando um pagamento falha ou é rejeitado." },
  { key: "notify.nova_solicitacao",  label: "Nova solicitação de anúncio",desc: "Quando alguém preenche o formulário em /anuncie." },
  { key: "notify.assinatura_cancela",label: "Assinatura cancelada",       desc: "Quando um assinante cancela o plano." },
  { key: "notify.erro_critico",      label: "Erro crítico de sistema",    desc: "Quando uma API retorna erro 500 ou exception crítica." },
];

const KEYS = [...EVENTOS.map(e => e.key), "notify.emails_destino"];

export default function TabNotificacoes({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
    // Defaults: ligar notificações principais por padrão
    if (!init["notify.novo_assinante"])   init["notify.novo_assinante"]   = "true";
    if (!init["notify.pagamento_ok"])     init["notify.pagamento_ok"]     = "true";
    if (!init["notify.pagamento_falhou"]) init["notify.pagamento_falhou"] = "true";
    if (!init["notify.nova_solicitacao"]) init["notify.nova_solicitacao"] = "true";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function toggle(key: string) {
    setValues(v => ({ ...v, [key]: v[key] === "true" ? "false" : "true" }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const result = await saveSettings(values);
    if (result.error) setError(result.error);
    else setSaved(true);
    setSaving(false);
    if (result.ok) setTimeout(() => setSaved(false), 3000);
  }

  const activeCount = EVENTOS.filter(ev => values[ev.key] === "true").length;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">Notificações Internas</h2>
        <p className="text-[#526888] text-[13px]">Defina quais eventos geram alertas por e-mail para a equipe administrativa.</p>
      </div>

      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>}

      {/* E-mails destino */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-3">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">📬 Destinatários</h3>
        <div>
          <label className={labelCls}>E-mail(s) que recebem as notificações</label>
          <input value={values["notify.emails_destino"]}
            onChange={e => setValues(v => ({ ...v, "notify.emails_destino": e.target.value }))}
            placeholder="admin@revistamagnum.com.br, editorial@revistamagnum.com.br"
            className={inputCls} />
          <p className="text-white text-[11px] mt-1">Separe múltiplos e-mails por vírgula.</p>
        </div>
      </section>

      {/* Eventos */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden">
        <div className="bg-[#141d2c] px-5 py-3 flex items-center justify-between">
          <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px]">🔔 Eventos</h3>
          <p className="text-[#526888] text-[12px]">{activeCount} de {EVENTOS.length} ativados</p>
        </div>

        {EVENTOS.map((ev, i) => (
          <div key={ev.key}>
            {i > 0 && <div className="bg-[#141d2c] h-px" />}
            <div className="px-5 py-4 flex items-center gap-4">
              {/* Toggle */}
              <button type="button" onClick={() => toggle(ev.key)}
                className={`w-[40px] h-[22px] rounded-full transition-colors shrink-0 relative ${values[ev.key] === "true" ? "bg-[#ff1f1f]" : "bg-[#141d2c] border border-[#1c2a3e]"}`}>
                <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[3px] transition-all ${values[ev.key] === "true" ? "left-[21px]" : "left-[3px]"}`} />
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-semibold ${values[ev.key] === "true" ? "text-[#d4d4da]" : "text-[#526888]"}`}>{ev.label}</p>
                <p className="text-white text-[12px]">{ev.desc}</p>
              </div>
              {values[ev.key] === "true" && (
                <span className="text-[10px] bg-[#0f381f] text-[#22c55e] px-2 py-[2px] rounded-[2px] font-bold shrink-0">ON</span>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] px-5 py-4">
        <p className="text-[#526888] text-[12px]">
          💡 As notificações usam a configuração de SMTP da aba <strong className="text-[#7a9ab5]">E-mail / SMTP</strong>. Configure o servidor antes de ativar os alertas.
        </p>
      </div>

      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button type="submit" disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
          {saving ? "Salvando..." : "Salvar Notificações"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
      </div>
    </form>
  );
}
