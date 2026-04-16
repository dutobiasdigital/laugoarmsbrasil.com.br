"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";
const sectionTitle =
  "text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4";

interface UserSuggestion {
  id: string;
  name: string;
  email: string;
}

export default function AdminAnunciantesNovaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // Busca de usuário
  const [userQuery, setUserQuery]       = useState("");
  const [userResults, setUserResults]   = useState<UserSuggestion[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);

  // Form data
  const [form, setForm] = useState({
    tradeName:       "",
    email:           "",
    phone:           "",
    segment:         "",
    pipelineStatus:  "REGISTERED",
    listingType:     "NONE",
    cnpj:            "",
    razaoSocial:     "",
    website:         "",
    instagram:       "",
    whatsappNumber:  "",
    address:         "",
    city:            "",
    state:           "",
    zip:             "",
    description:     "",
  });

  const searchUsers = useCallback(async (q: string) => {
    if (q.length < 2) { setUserResults([]); return; }
    try {
      const res = await fetch(`/api/admin/usuarios?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUserResults(Array.isArray(data) ? data : []);
    } catch {
      setUserResults([]);
    }
  }, []);

  function set(k: string, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.tradeName) { setError("Nome comercial é obrigatório."); return; }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        userId: selectedUser?.id ?? null,
        cnpj:           form.cnpj           || null,
        razaoSocial:    form.razaoSocial    || null,
        website:        form.website        || null,
        instagram:      form.instagram      || null,
        whatsappNumber: form.whatsappNumber || null,
        address:        form.address        || null,
        city:           form.city           || null,
        state:          form.state          || null,
        zip:            form.zip            || null,
        description:    form.description    || null,
        segment:        form.segment        || null,
        email:          form.email          || null,
        phone:          form.phone          || null,
      };
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(JSON.stringify(data.error ?? data));
      }
      const created = await res.json();
      router.push(`/admin/anunciantes/${created.id}`);
    } catch (e: unknown) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/anunciantes" className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors">
          ← Anunciantes
        </Link>
        <div className="bg-[#141d2c] w-px h-4" />
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
          Nova Empresa
        </h1>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      <form onSubmit={handleSubmit} className="max-w-[900px] flex flex-col gap-6">
        {/* Usuário proprietário */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
          <p className={sectionTitle}>Usuário Proprietário</p>
          <div className="relative">
            <label className={labelCls}>Buscar por e-mail ou nome</label>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => { setUserQuery(e.target.value); searchUsers(e.target.value); }}
              placeholder="Digite para buscar..."
              className={inputCls}
            />
            {userResults.length > 0 && !selectedUser && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] overflow-hidden shadow-xl">
                {userResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setSelectedUser(u); setUserQuery(u.email); setUserResults([]); }}
                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#141d2c] text-left transition-colors"
                  >
                    <div className="w-[28px] h-[28px] rounded-full bg-[#141d2c] border border-[#1c2a3e] flex items-center justify-center text-[10px] text-[#7a9ab5] font-bold shrink-0">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[#d4d4da] text-[13px]">{u.name}</p>
                      <p className="text-[#526888] text-[11px]">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedUser && (
            <div className="mt-3 flex items-center justify-between bg-[#141d2c] rounded-[6px] px-3 py-2.5">
              <div>
                <p className="text-[#d4d4da] text-[13px] font-medium">{selectedUser.name}</p>
                <p className="text-[#526888] text-[11px]">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedUser(null); setUserQuery(""); }}
                className="text-[#526888] hover:text-[#f87171] text-[12px] transition-colors"
              >
                Remover
              </button>
            </div>
          )}
        </div>

        {/* Dados da empresa */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
          <p className={sectionTitle}>Dados da Empresa</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nome Comercial *</label>
              <input
                type="text"
                value={form.tradeName}
                onChange={(e) => set("tradeName", e.target.value)}
                placeholder="Ex: Armaria São Paulo"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>E-mail</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Segmento</label>
              <select value={form.segment} onChange={(e) => set("segment", e.target.value)} className={selectCls}>
                <option value="">Selecionar...</option>
                <option value="ARMAS">Armas</option>
                <option value="MUNICOES">Munições</option>
                <option value="ACESSORIOS">Acessórios</option>
                <option value="CACA">Caça</option>
                <option value="TIRO_ESPORTIVO">Tiro Esportivo</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Pipeline Status</label>
              <select value={form.pipelineStatus} onChange={(e) => set("pipelineStatus", e.target.value)} className={selectCls}>
                <option value="REGISTERED">Cadastrado</option>
                <option value="EMAIL_VERIFIED">E-mail Validado</option>
                <option value="COMPLETE">Completo</option>
                <option value="ACTIVE">Ativo</option>
                <option value="SUSPENDED">Suspenso</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo de Listagem</label>
              <select value={form.listingType} onChange={(e) => set("listingType", e.target.value)} className={selectCls}>
                <option value="NONE">Nenhum</option>
                <option value="FREE">FREE</option>
                <option value="PREMIUM">PREMIUM</option>
                <option value="DESTAQUE">DESTAQUE</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dados completos */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
          <p className={sectionTitle}>Dados Completos (Opcionais)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>CNPJ</label>
              <input type="text" value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} placeholder="00.000.000/0001-00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Razão Social</label>
              <input type="text" value={form.razaoSocial} onChange={(e) => set("razaoSocial", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Instagram</label>
              <input type="text" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@usuario" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input type="text" value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="+55 11 99999-9999" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>CEP</label>
              <input type="text" value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="00000-000" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Endereço</label>
              <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cidade</label>
              <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado (UF)</label>
              <input type="text" value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={2} placeholder="SP" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
          <p className={sectionTitle}>Descrição</p>
          <div>
            <label className={labelCls}>
              Descrição da empresa
              <span className="ml-2 text-[#526888]">({form.description.length}/600)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value.slice(0, 600))}
              rows={5}
              placeholder="Descreva a empresa..."
              className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-[#380f0f] border border-[#f87171] rounded-[6px] px-4 py-3">
            <p className="text-[#f87171] text-[13px]">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-6 flex items-center rounded-[6px] transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Criar Empresa"}
          </button>
          <Link
            href="/admin/anunciantes"
            className="text-[#7a9ab5] hover:text-white text-[14px] h-[40px] flex items-center px-4 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
