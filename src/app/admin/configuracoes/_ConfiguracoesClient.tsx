"use client";

import { useState } from "react";

interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const inputCls =
  "bg-[#09090b] border border-[#3f3f46] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#a1a1aa] text-[12px] font-semibold mb-1.5";

export default function ConfiguracoesClient({ admins }: { admins: Admin[] }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handlePromote(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/usuarios/promover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `${email} agora é administrador.` });
        setEmail("");
      } else {
        setMessage({ type: "error", text: data.error ?? "Erro ao promover usuário." });
      }
    } catch {
      setMessage({ type: "error", text: "Erro de conexão." });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-[720px]">
      {/* Admins list */}
      <div className="mb-8">
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] leading-none mb-4">
          Administradores
        </h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] overflow-hidden">
          <div className="bg-[#27272a] px-5 py-3 grid grid-cols-3 gap-3">
            {["Nome", "E-mail", "Desde"].map((h) => (
              <p key={h} className="text-[#52525b] text-[11px] font-semibold tracking-[0.5px]">
                {h}
              </p>
            ))}
          </div>
          {admins.length === 0 ? (
            <p className="text-[#52525b] text-[13px] p-6 text-center">
              Nenhum administrador cadastrado.
            </p>
          ) : (
            admins.map((admin, i) => (
              <div key={admin.id}>
                {i > 0 && <div className="bg-[#27272a] h-px" />}
                <div className="px-5 py-3.5 grid grid-cols-3 gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-[28px] h-[28px] rounded-full bg-[#ff1f1f] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                      {admin.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-[#d4d4da] text-[14px]">{admin.name}</p>
                  </div>
                  <p className="text-[#a1a1aa] text-[13px]">{admin.email}</p>
                  <p className="text-[#52525b] text-[13px]">{admin.createdAt}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Promote user */}
      <div className="mb-8">
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] leading-none mb-2">
          Adicionar Administrador
        </h2>
        <p className="text-[#a1a1aa] text-[13px] mb-4">
          Digite o e-mail de um usuário cadastrado para conceder acesso de administrador.
        </p>

        {message && (
          <div
            className={`rounded-[8px] px-4 py-3 mb-4 text-[13px] ${
              message.type === "success"
                ? "bg-[#0f381f] text-[#22c55e]"
                : "bg-[#2d0a0a] border border-[#ff1f1f] text-[#ff6b6b]"
            }`}
          >
            {message.text}
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
      </div>

      {/* System info */}
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] leading-none mb-4">
          Informações do Sistema
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Versão", value: "1.0.0" },
            { label: "Framework", value: "Next.js 16.2.2" },
            { label: "Banco de dados", value: "PostgreSQL (Supabase)" },
            { label: "Hospedagem", value: "Hostinger" },
          ].map((item) => (
            <div key={item.label} className="bg-[#18181b] border border-[#27272a] rounded-[8px] p-4">
              <p className="text-[#52525b] text-[11px] font-semibold tracking-[0.5px] mb-1">
                {item.label.toUpperCase()}
              </p>
              <p className="text-[#d4d4da] text-[14px]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
