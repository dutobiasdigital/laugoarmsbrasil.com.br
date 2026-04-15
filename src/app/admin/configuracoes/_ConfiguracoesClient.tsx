"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import TabIntegracoes from "./_TabIntegracoes";
import TabSEO from "./_TabSEO";
import TabEmpresa from "./_TabEmpresa";
import TabRedes from "./_TabRedes";
import TabEmail from "./_TabEmail";
import TabEditorial from "./_TabEditorial";
import TabNotificacoes from "./_TabNotificacoes";

/* ── helpers de estilo ──────────────────────────────────────── */
export const inputCls  = "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
export const labelCls  = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
export const selectCls = "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
export const areaCls   = "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors resize-none";

interface Admin { id: string; name: string; email: string; createdAt: string; }

interface Props {
  initialTab: string;
  settings: Record<string, string>;
  admins: Admin[];
}

/* ── Tabs ───────────────────────────────────────────────────── */
const TABS = [
  { id: "integracoes", icon: "🔌", label: "Integrações" },
  { id: "seo",         icon: "🌐", label: "Site & SEO" },
  { id: "empresa",     icon: "🏢", label: "Empresa" },
  { id: "redes",       icon: "📱", label: "Redes Sociais" },
  { id: "email",        icon: "📧", label: "E-mail / SMTP" },
  { id: "editorial",   icon: "📝", label: "Editorial" },
  { id: "notificacoes",icon: "🔔", label: "Notificações" },
  { id: "acesso",      icon: "🔐", label: "Acesso" },
  { id: "sistema",     icon: "⚙️", label: "Sistema" },
];

/* ── Salvar ─────────────────────────────────────────────────── */
export async function saveSettings(data: Record<string, string>): Promise<{ ok?: boolean; error?: string }> {
  const res = await fetch("/api/admin/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

/* ── Componente ─────────────────────────────────────────────── */
export default function ConfiguracoesClient({ initialTab, settings, admins }: Props) {
  const router  = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [, startTransition] = useTransition();

  function changeTab(id: string) {
    setTab(id);
    startTransition(() => {
      router.replace(`/admin/configuracoes?aba=${id}`, { scroll: false });
    });
  }

  return (
    <div className="flex gap-6 items-start">

      {/* Sidebar de tabs */}
      <nav className="w-[200px] shrink-0 flex flex-col gap-0.5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => changeTab(t.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-[14px] w-full text-left transition-colors ${
              tab === t.id
                ? "bg-[#260a0a] border border-[#ff1f1f] text-white font-semibold"
                : "text-[#7a9ab5] hover:text-white hover:bg-[#141d2c]"
            }`}
          >
            <span className="text-[15px]">{t.icon}</span>
            <span className="flex-1">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {tab === "integracoes" && <TabIntegracoes settings={settings} />}
        {tab === "seo"         && <TabSEO settings={settings} />}
        {tab === "empresa"     && <TabEmpresa settings={settings} />}
        {tab === "redes"       && <TabRedes settings={settings} />}
        {tab === "email"        && <TabEmail settings={settings} />}
        {tab === "editorial"   && <TabEditorial settings={settings} />}
        {tab === "notificacoes"&& <TabNotificacoes settings={settings} />}
        {tab === "acesso"      && <TabAcesso admins={admins} />}
        {tab === "sistema"     && <TabSistema />}
      </div>
    </div>
  );
}

/* ── Tab Em Breve ───────────────────────────────────────────── */
function TabEmBreve({ label }: { label: string }) {
  return (
    <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-12 flex flex-col items-center justify-center text-center gap-3 min-h-[300px]">
      <p className="text-[40px]">🚧</p>
      <p className="font-['Barlow_Condensed'] font-bold text-white text-[24px]">{label}</p>
      <p className="text-[#526888] text-[14px]">Esta seção está em desenvolvimento e será liberada em breve.</p>
    </div>
  );
}

/* ── Tab Acesso ─────────────────────────────────────────────── */
function TabAcesso({ admins }: { admins: { id: string; name: string; email: string; createdAt: string }[] }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handlePromote(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/usuarios/promover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { setMsg({ type: "success", text: `${email} agora é administrador.` }); setEmail(""); }
      else setMsg({ type: "error", text: data.error ?? "Erro ao promover." });
    } catch { setMsg({ type: "error", text: "Erro de conexão." }); }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-8 max-w-[680px]">
      <section>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] mb-4">Administradores</h2>
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
          <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-3 gap-3">
            {["Nome","E-mail","Desde"].map(h => (
              <p key={h} className="text-[#253750] text-[11px] font-semibold tracking-[0.5px]">{h}</p>
            ))}
          </div>
          {admins.length === 0
            ? <p className="text-[#253750] text-[13px] p-6 text-center">Nenhum administrador.</p>
            : admins.map((a, i) => (
              <div key={a.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div className="px-5 py-3.5 grid grid-cols-3 gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-[28px] h-[28px] rounded-full bg-[#ff1f1f] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                      {a.name.slice(0,2).toUpperCase()}
                    </div>
                    <p className="text-[#d4d4da] text-[14px]">{a.name}</p>
                  </div>
                  <p className="text-[#7a9ab5] text-[13px]">{a.email}</p>
                  <p className="text-[#253750] text-[13px]">{a.createdAt}</p>
                </div>
              </div>
            ))
          }
        </div>
      </section>

      <section>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] mb-2">Adicionar Administrador</h2>
        <p className="text-[#7a9ab5] text-[13px] mb-4">Digite o e-mail de um usuário cadastrado para conceder acesso de administrador.</p>
        {msg && (
          <div className={`rounded-[8px] px-4 py-3 mb-4 text-[13px] ${msg.type === "success" ? "bg-[#0f381f] text-[#22c55e]" : "bg-[#2d0a0a] border border-[#ff1f1f] text-[#ff6b6b]"}`}>
            {msg.text}
          </div>
        )}
        <form onSubmit={handlePromote} className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>E-mail do usuário</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@exemplo.com" className={inputCls} />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[40px] px-6 rounded-[6px] transition-colors whitespace-nowrap">
              {loading ? "Processando..." : "Promover"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

/* ── Tab Sistema ────────────────────────────────────────────── */
function TabSistema() {
  return (
    <div className="max-w-[680px]">
      <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] mb-4">Informações do Sistema</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Versão",         value: "1.0.0" },
          { label: "Framework",      value: "Next.js 15" },
          { label: "Banco de dados", value: "PostgreSQL (Supabase)" },
          { label: "Hospedagem",     value: "Hostinger" },
          { label: "Deploy",         value: "Git → GitHub → Hostinger (auto)" },
          { label: "CDN de imagens", value: "Supabase Storage" },
        ].map(item => (
          <div key={item.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[8px] p-4">
            <p className="text-[#253750] text-[11px] font-semibold tracking-[0.5px] mb-1">{item.label.toUpperCase()}</p>
            <p className="text-[#d4d4da] text-[14px]">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
