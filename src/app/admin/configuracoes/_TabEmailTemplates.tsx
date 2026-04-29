"use client";

import { useState } from "react";
import { saveSettings } from "./_ConfiguracoesClient";

const areaCls = "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[13px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors resize-none font-mono leading-relaxed";
const inputCls = "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";

/* ── Variáveis disponíveis por template ─────────────────────── */
const VARS: Record<string, string[]> = {
  boas_vindas:           ["{{nome}}", "{{email}}", "{{data}}"],
  pagamento_confirmado:  ["{{nome}}", "{{email}}", "{{produto}}", "{{valor}}", "{{gateway}}", "{{referencia}}"],
  plano_expirando:       ["{{nome}}", "{{email}}", "{{plano}}", "{{valor}}", "{{data_expiracao}}", "{{dias_restantes}}"],
  assinatura_cancelada:  ["{{nome}}", "{{email}}", "{{plano}}", "{{data_cancelamento}}"],
};

const TEMPLATES = [
  {
    id:       "boas_vindas",
    label:    "Boas-vindas",
    icon:     "🎉",
    desc:     "Enviado quando um novo usuário se cadastra.",
    subject:  "Bem-vindo à Laúgo Arms Brasil, {{nome}}!",
    body:     `Olá, {{nome}}!

Seja bem-vindo à Laúgo Arms Brasil — o maior acervo sobre armamento civil do Brasil.

Sua conta foi criada com sucesso. Agora você pode explorar nossa plataforma e assinar um de nossos planos para acessar mais de 200 edições completas.

Qualquer dúvida, estamos à disposição.

Até logo,
Equipe Laúgo Arms Brasil`,
  },
  {
    id:       "pagamento_confirmado",
    label:    "Pagamento Confirmado",
    icon:     "✅",
    desc:     "Enviado após aprovação de qualquer pagamento.",
    subject:  "✅ Pagamento confirmado — {{produto}}",
    body:     `Olá, {{nome}}!

Seu pagamento foi aprovado com sucesso!

Produto: {{produto}}
Valor:   {{valor}}
Gateway: {{gateway}}
Ref.:    {{referencia}}

Aproveite seu acesso ao acervo completo da Laúgo Arms Brasil.

Equipe Laúgo Arms Brasil`,
  },
  {
    id:       "plano_expirando",
    label:    "Plano Expirando",
    icon:     "⚠️",
    desc:     "Enviado quando faltam 7 dias para o vencimento.",
    subject:  "⚠ Sua assinatura expira em {{dias_restantes}} dias",
    body:     `Olá, {{nome}}!

Sua assinatura {{plano}} expira em {{dias_restantes}} dias ({{data_expiracao}}).

Para continuar tendo acesso ao acervo completo da Laúgo Arms Brasil, renove sua assinatura:

{{link_renovacao}}

Qualquer dúvida, entre em contato conosco.

Equipe Laúgo Arms Brasil`,
  },
  {
    id:       "assinatura_cancelada",
    label:    "Assinatura Cancelada",
    icon:     "❌",
    desc:     "Enviado quando a assinatura é cancelada ou expira.",
    subject:  "Sua assinatura foi cancelada",
    body:     `Olá, {{nome}}!

Sua assinatura {{plano}} foi encerrada em {{data_cancelamento}}.

Sentimos muito ver você partir. Se desejar reativar sua assinatura, acesse:

https://laugoarmsbrasil.com.br/assine

Equipe Laúgo Arms Brasil`,
  },
];

interface Props {
  settings: Record<string, string>;
}

export default function TabEmailTemplates({ settings }: Props) {
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0].id);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");

  // Estado local para cada template (subject + body)
  const [forms, setForms] = useState<Record<string, { subject: string; body: string }>>(() => {
    const init: Record<string, { subject: string; body: string }> = {};
    for (const t of TEMPLATES) {
      init[t.id] = {
        subject: settings[`email.template.${t.id}.subject`] ?? t.subject,
        body:    settings[`email.template.${t.id}.body`]    ?? t.body,
      };
    }
    return init;
  });

  const current = TEMPLATES.find(t => t.id === activeTemplate)!;
  const form    = forms[activeTemplate];
  const vars    = VARS[activeTemplate] ?? [];

  function updateForm(field: "subject" | "body", value: string) {
    setForms(prev => ({ ...prev, [activeTemplate]: { ...prev[activeTemplate], [field]: value } }));
  }

  async function handleSave() {
    setSaving(true); setMsg(null);
    const data: Record<string, string> = {};
    for (const t of TEMPLATES) {
      data[`email.template.${t.id}.subject`] = forms[t.id].subject;
      data[`email.template.${t.id}.body`]    = forms[t.id].body;
    }
    const result = await saveSettings(data);
    setSaving(false);
    setMsg(result.ok
      ? { type: "success", text: "Templates salvos com sucesso." }
      : { type: "error", text: result.error ?? "Erro ao salvar." });
  }

  async function handleTest() {
    if (!testEmail) return;
    setTesting(activeTemplate);
    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ to: testEmail, template: activeTemplate }),
      });
      const data = await res.json();
      setMsg(data.ok
        ? { type: "success", text: `E-mail de teste (${current.label}) enviado para ${testEmail}.` }
        : { type: "error", text: data.error ?? "Erro ao enviar." });
    } catch {
      setMsg({ type: "error", text: "Erro de conexão." });
    }
    setTesting(null);
  }

  function insertVar(v: string) {
    const ta = document.getElementById("tpl-body") as HTMLTextAreaElement | null;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const newVal = form.body.slice(0, start) + v + form.body.slice(end);
    updateForm("body", newVal);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + v.length;
      ta.focus();
    }, 0);
  }

  return (
    <div className="max-w-[860px]">
      <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] mb-1">
        Templates de E-mail
      </h2>
      <p className="text-[#7a9ab5] text-[13px] mb-5">
        Personalize os e-mails automáticos enviados pela plataforma. Use variáveis como{" "}
        <code className="bg-[#141d2c] px-1 rounded text-[#f59e0b] text-[12px]">{"{{nome}}"}</code>{" "}
        que são substituídas automaticamente.
      </p>

      {msg && (
        <div className={`rounded-[8px] px-4 py-3 mb-5 text-[13px] ${
          msg.type === "success"
            ? "bg-[#0f381f] text-[#22c55e]"
            : "bg-[#2d0a0a] border border-[#ff1f1f]/40 text-[#ff6b6b]"
        }`}>
          {msg.text}
        </div>
      )}

      <div className="flex gap-5">
        {/* Sidebar de templates */}
        <nav className="w-[200px] shrink-0 flex flex-col gap-1">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-left text-[13px] w-full transition-colors ${
                activeTemplate === t.id
                  ? "bg-[#260a0a] border border-[#ff1f1f] text-white font-semibold"
                  : "text-[#7a9ab5] hover:text-white hover:bg-[#141d2c]"
              }`}
            >
              <span>{t.icon}</span>
              <span className="leading-tight">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Editor */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-1.5">
            <p className="text-white text-[12px] px-3 py-2">{current.desc}</p>
          </div>

          {/* Assunto */}
          <div>
            <label className={labelCls}>Assunto do e-mail</label>
            <input
              className={inputCls}
              value={form.subject}
              onChange={e => updateForm("subject", e.target.value)}
              placeholder="Assunto do e-mail..."
            />
          </div>

          {/* Corpo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls.replace(" mb-1.5", "")}>Corpo do e-mail</label>
              {/* Variáveis disponíveis */}
              <div className="flex items-center gap-1 flex-wrap">
                {vars.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVar(v)}
                    className="bg-[#141d2c] hover:bg-[#1c2a3e] border border-[#1c2a3e] text-[#f59e0b] text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors"
                    title={`Inserir ${v}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="tpl-body"
              rows={14}
              className={areaCls}
              value={form.body}
              onChange={e => updateForm("body", e.target.value)}
              placeholder="Corpo do e-mail em texto simples. Use {{variavel}} para dados dinâmicos..."
            />
            <p className="text-white text-[11px] mt-1">
              O e-mail será enviado em HTML com o layout padrão da Laúgo Arms Brasil.
              Quebras de linha são preservadas.
            </p>
          </div>

          {/* Preview */}
          <div className="bg-[#070a12] border border-[#141d2c] rounded-[8px] p-4">
            <p className="text-white text-[11px] font-semibold tracking-[0.5px] mb-2">PRÉVIA DO CORPO</p>
            <pre className="text-[#7a9ab5] text-[12px] leading-[20px] whitespace-pre-wrap font-sans">
              {form.body}
            </pre>
          </div>

          {/* Teste de envio */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
            <p className="text-[#7a9ab5] text-[12px] font-semibold mb-3">
              Enviar e-mail de teste ({current.label})
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="seu@email.com"
                className={`${inputCls} max-w-[280px]`}
              />
              <button
                onClick={handleTest}
                disabled={!testEmail || testing !== null}
                className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 disabled:opacity-50 text-[#d4d4da] text-[13px] h-[40px] px-4 rounded-[6px] whitespace-nowrap transition-colors"
              >
                {testing === activeTemplate ? "Enviando..." : "Enviar teste"}
              </button>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end border-t border-[#141d2c] pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[40px] px-6 rounded-[6px] transition-colors"
            >
              {saving ? "Salvando..." : "Salvar todos os templates"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
