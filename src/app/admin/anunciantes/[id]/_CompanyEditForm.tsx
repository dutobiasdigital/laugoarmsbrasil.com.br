"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";
const sectionTitle =
  "text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4";

interface UserSuggestion { id: string; name: string; email: string; }

interface CompanyData {
  id: string;
  userId: string | null;
  tradeName: string;
  email: string | null;
  phone: string | null;
  segment: string | null;
  pipelineStatus: string;
  listingType: string;
  cnpj: string | null;
  razaoSocial: string | null;
  legalName: string | null;
  website: string | null;
  instagram: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  notes: string | null;
  users: UserSuggestion | null;
}

export default function CompanyEditForm({ company }: { company: CompanyData }) {
  const router = useRouter();
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [userQuery, setUserQuery]       = useState(company.users?.email ?? "");
  const [userResults, setUserResults]   = useState<UserSuggestion[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(company.users);

  const [form, setForm] = useState({
    tradeName:      company.tradeName,
    email:          company.email          ?? "",
    phone:          company.phone          ?? "",
    segment:        company.segment        ?? "",
    pipelineStatus: company.pipelineStatus,
    listingType:    company.listingType,
    cnpj:           company.cnpj           ?? "",
    razaoSocial:    company.razaoSocial    ?? "",
    website:        company.website        ?? "",
    instagram:      company.instagram      ?? "",
    whatsappNumber: company.whatsappNumber ?? "",
    address:        company.address        ?? "",
    city:           company.city           ?? "",
    state:          company.state          ?? "",
    zip:            company.zip            ?? "",
    description:    company.description    ?? "",
    metaTitle:      company.metaTitle      ?? "",
    metaDescription: company.metaDescription ?? "",
    metaKeywords:   company.metaKeywords   ?? "",
    notes:          company.notes          ?? "",
  });

  const searchUsers = useCallback(async (q: string) => {
    if (q.length < 2) { setUserResults([]); return; }
    try {
      const res = await fetch(`/api/admin/usuarios?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUserResults(Array.isArray(data) ? data : []);
    } catch { setUserResults([]); }
  }, []);

  function set(k: string, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        id: company.id,
        ...form,
        userId:         selectedUser?.id    ?? company.userId,
        email:          form.email          || null,
        phone:          form.phone          || null,
        segment:        form.segment        || null,
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
        metaTitle:      form.metaTitle      || null,
        metaDescription: form.metaDescription || null,
        metaKeywords:   form.metaKeywords   || null,
        notes:          form.notes          || null,
      };
      const res = await fetch("/api/admin/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(JSON.stringify(data.error ?? data));
      }
      setSuccess(true);
      router.refresh();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Usuário proprietário */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
        <p className={sectionTitle}>Usuário Proprietário</p>
        <div className="relative">
          <label className={labelCls}>Buscar por e-mail ou nome</label>
          <input
            type="text"
            value={userQuery}
            onChange={(e) => { setUserQuery(e.target.value); setSelectedUser(null); searchUsers(e.target.value); }}
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
            <input type="text" value={form.tradeName} onChange={(e) => set("tradeName", e.target.value)} required className={inputCls} />
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
        <p className={sectionTitle}>Dados Completos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>CNPJ</label>
            <input type="text" value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Razão Social</label>
            <input type="text" value={form.razaoSocial} onChange={(e) => set("razaoSocial", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Instagram</label>
            <input type="text" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp</label>
            <input type="text" value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>CEP</label>
            <input type="text" value={form.zip} onChange={(e) => set("zip", e.target.value)} className={inputCls} />
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
            <input type="text" value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={2} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
        <p className={sectionTitle}>Descrição</p>
        <div>
          <label className={labelCls}>
            Descrição
            <span className="ml-2 text-[#526888]">({form.description.length}/600)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value.slice(0, 600))}
            rows={5}
            className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
          />
        </div>
      </div>

      {/* SEO */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
        <p className={sectionTitle}>SEO</p>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Meta Title</label>
            <input type="text" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Meta Description</label>
            <input type="text" value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Keywords</label>
            <input type="text" value={form.metaKeywords} onChange={(e) => set("metaKeywords", e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Notas internas */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
        <p className={sectionTitle}>Notas Internas</p>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Observações internas sobre a empresa..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
        />
      </div>

      {error && (
        <div className="bg-[#380f0f] border border-[#f87171] rounded-[6px] px-4 py-3">
          <p className="text-[#f87171] text-[13px]">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-[#0f381f] border border-[#22c55e] rounded-[6px] px-4 py-3">
          <p className="text-[#22c55e] text-[13px]">Salvo com sucesso!</p>
        </div>
      )}

      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-6 flex items-center rounded-[6px] transition-colors disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </form>
  );
}
