"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import TabHome        from "./_TabHome";
import TabEmpresa     from "./_TabEmpresa";
import TabSEO         from "./_TabSEO";
import TabPagamentos  from "./_TabPagamentos";
import TabModulos     from "./_TabModulos";
import TabPaginas     from "./_TabPaginas";
import TabEmails      from "./_TabEmails";
import TabIntegracoes from "./_TabIntegracoes";
import TabSistema     from "./_TabSistema";

/* ── helpers de estilo — exportados para sub-componentes ──────── */
export const inputCls  = "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
export const labelCls  = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
export const selectCls = "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
export const areaCls   = "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors resize-none";

interface Admin { id: string; name: string; email: string; createdAt: string; }

interface Props {
  initialTab: string;
  settings: Record<string, string>;
  admins: Admin[];
}

/* ── Tabs ─────────────────────────────────────────────────────── */
const TABS = [
  { id: "home",        icon: "🏠", label: "Home" },
  { id: "acesso",      icon: "🔐", label: "Usuários / Acesso" },
  { id: "empresa",     icon: "🏢", label: "Empresa" },
  { id: "seo",         icon: "🌐", label: "SEO" },
  { id: "pagamentos",  icon: "💳", label: "Pagamentos" },
  { id: "emails",      icon: "📧", label: "E-mails" },
  { id: "integracoes", icon: "🔌", label: "Integrações" },
  { id: "modulos",     icon: "🧩", label: "Módulos" },
  { id: "paginas",     icon: "📄", label: "Páginas" },
  { id: "sistema",     icon: "⚙️", label: "Sistema" },
];

/* ── Salvar — exportado para sub-componentes ─────────────────── */
export async function saveSettings(
  data: Record<string, string>
): Promise<{ ok?: boolean; error?: string }> {
  const res = await fetch("/api/admin/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

/* ── Componente principal ─────────────────────────────────────── */
export default function ConfiguracoesClient({ initialTab, settings, admins }: Props) {
  const router = useRouter();
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
      <nav className="w-[210px] shrink-0 flex flex-col gap-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => changeTab(t.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-[13px] w-full text-left transition-colors ${
              tab === t.id
                ? "bg-[#260a0a] border border-[#ff1f1f] text-white font-semibold"
                : "text-[#7a9ab5] hover:text-white hover:bg-[#141d2c]"
            }`}
          >
            <span className="text-[15px] shrink-0">{t.icon}</span>
            <span className="flex-1 truncate">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {tab === "home"        && <TabHome />}
        {tab === "acesso"      && <TabAcesso admins={admins} />}
        {tab === "empresa"     && <TabEmpresa settings={settings} />}
        {tab === "seo"         && <TabSEO settings={settings} />}
        {tab === "pagamentos"  && <TabPagamentos settings={settings} />}
        {tab === "emails"      && <TabEmails settings={settings} />}
        {tab === "integracoes" && <TabIntegracoes settings={settings} />}
        {tab === "modulos"     && <TabModulos settings={settings} />}
        {tab === "paginas"     && <TabPaginas />}
        {tab === "sistema"     && <TabSistema settings={settings} />}
      </div>
    </div>
  );
}

/* ── Tab Acesso ─────────────────────────────────────────────────── */
function TabAcesso({
  admins,
}: {
  admins: { id: string; name: string; email: string; createdAt: string }[];
}) {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]       = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      if (res.ok) {
        setMsg({ type: "success", text: `${email} agora é administrador.` });
        setEmail("");
      } else {
        setMsg({ type: "error", text: data.error ?? "Erro ao promover." });
      }
    } catch {
      setMsg({ type: "error", text: "Erro de conexão." });
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-8 max-w-[680px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">
          Usuários / Acesso
        </h2>
        <p className="text-[#526888] text-[13px]">
          Gerencie os usuários com acesso administrativo ao painel.
        </p>
      </div>

      <section>
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] mb-4">
          Administradores Ativos
        </h3>
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
          <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-3 gap-3">
            {["Nome", "E-mail", "Desde"].map((h) => (
              <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px]">
                {h}
              </p>
            ))}
          </div>
          {admins.length === 0 ? (
            <p className="text-[#526888] text-[13px] p-6 text-center">
              Nenhum administrador cadastrado.
            </p>
          ) : (
            admins.map((a, i) => (
              <div key={a.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div className="px-5 py-3.5 grid grid-cols-3 gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-[28px] h-[28px] rounded-full bg-[#ff1f1f] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                      {a.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-[#d4d4da] text-[13px] truncate">{a.name}</p>
                  </div>
                  <p className="text-[#7a9ab5] text-[12px] truncate">{a.email}</p>
                  <p className="text-white text-[12px]">{a.createdAt}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] mb-1">
          Adicionar Administrador
        </h3>
        <p className="text-[#526888] text-[13px] mb-4">
          Digite o e-mail de um usuário cadastrado para conceder acesso de administrador.
        </p>
        {msg && (
          <div
            className={`rounded-[8px] px-4 py-3 mb-4 text-[13px] ${
              msg.type === "success"
                ? "bg-[#0f381f] text-[#22c55e]"
                : "bg-[#2d0a0a] border border-[#ff1f1f] text-[#ff6b6b]"
            }`}
          >
            {msg.text}
          </div>
        )}
        <form onSubmit={handlePromote} className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>E-mail do usuário</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              className={inputCls}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[40px] px-6 rounded-[6px] transition-colors whitespace-nowrap"
            >
              {loading ? "Processando..." : "Promover"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
