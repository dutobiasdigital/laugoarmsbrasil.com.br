"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";

const inputCls   = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls   = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls  = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";
const areaCls    = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none";
const sectionTtl = "text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4";

const DESC_LIMIT = 600;

const PIPELINE_STATUS: { value: string; label: string; color: string }[] = [
  { value: "REGISTERED",    label: "Cadastrada",     color: "bg-[#1a1a0a] text-[#facc15]" },
  { value: "EMAIL_VERIFIED",label: "E-mail verificado", color: "bg-[#0a1a2a] text-[#60a5fa]" },
  { value: "COMPLETE",      label: "Completo",       color: "bg-[#0a1a2a] text-[#818cf8]" },
  { value: "ACTIVE",        label: "Ativa",          color: "bg-[#0f381f] text-[#22c55e]" },
  { value: "SUSPENDED",     label: "Suspensa",       color: "bg-[#141d2c] text-[#526888]" },
];

interface Company {
  id: string;
  tradeName: string;
  legalName: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  segment: string;
  listingType: string;
  pipelineStatus: string;
  website: string | null;
  instagram: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  notes: string | null;
  featured: boolean;
  emailVerified: boolean;
  viewsCount: number;
}

export default function EditarEmpresaGuiaPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [company,    setCompany]    = useState<Company | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [msg,        setMsg]        = useState<{ type: "success" | "error"; text: string } | null>(null);

  // controlled fields
  const [description, setDescription] = useState("");
  const [logoUrl,     setLogoUrl]     = useState("");
  const [coverUrl,    setCoverUrl]    = useState("");

  useEffect(() => {
    fetch(`/api/admin/guia?id=${id}`)
      .then(r => r.json())
      .then((d: Company | null) => {
        if (d) {
          setCompany(d);
          setDescription(d.description ?? "");
          setLogoUrl(d.logoUrl ?? "");
          setCoverUrl(d.coverImageUrl ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const descCount = description.length;
  const descColor = descCount > DESC_LIMIT ? "text-red-400" : descCount > DESC_LIMIT * 0.85 ? "text-amber-400" : "text-[#526888]";

  const currentStatus = PIPELINE_STATUS.find(s => s.value === company?.pipelineStatus) ?? PIPELINE_STATUS[0];

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (descCount > DESC_LIMIT) { setMsg({ type: "error", text: `Descrição máxima: ${DESC_LIMIT} caracteres.` }); return; }
    setSaving(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      id,
      ...Object.fromEntries(fd),
      description,
      logoUrl,
      coverImageUrl: coverUrl,
    };
    try {
      const res = await fetch("/api/admin/guia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      setMsg({ type: "success", text: "Empresa atualizada com sucesso!" });
      setCompany(prev => prev ? { ...prev, ...body } as Company : prev);
    } catch (err: unknown) {
      setMsg({ type: "error", text: (err as Error).message });
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/guia", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Erro ao excluir.");
      router.push("/admin/guia");
    } catch (err: unknown) {
      setMsg({ type: "error", text: (err as Error).message });
      setDelConfirm(false);
    }
    setDeleting(false);
  }

  if (loading) {
    return <div className="text-[#526888] text-[14px] py-20 text-center animate-pulse">Carregando empresa...</div>;
  }

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-[#ff6b6b] text-[14px] mb-4">Empresa não encontrada.</p>
        <Link href="/admin/guia" className="text-[#7a9ab5] hover:text-white text-[14px]">← Voltar ao Guia</Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb + header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/guia" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">← Guia Magnum</Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">{company.tradeName}</span>
      </div>

      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">{company.tradeName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] ${currentStatus.color}`}>{currentStatus.label}</span>
            <span className="text-[#526888] text-[12px] font-mono">{company.viewsCount} views</span>
          </div>
        </div>
      </div>

      <p className="text-[#7a9ab5] text-[14px] mb-6">Edite os dados da empresa no Guia Magnum.</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      {msg && (
        <div className={`rounded-[8px] px-4 py-3 mb-5 text-[13px] ${
          msg.type === "success" ? "bg-[#0f381f] text-[#22c55e]" : "bg-[#2d0a0a] border border-[#ff1f1f]/30 text-[#ff6b6b]"
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-[860px]">

        {/* ── Status Pipeline (admin only) ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Status & Controle (Admin)</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div>
              <label className={labelCls}>Status Pipeline</label>
              <select name="pipelineStatus" defaultValue={company.pipelineStatus} className={selectCls}>
                {PIPELINE_STATUS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Plano do Guia</label>
              <select name="listingType" defaultValue={company.listingType} className={selectCls}>
                <option value="NONE">Sem plano</option>
                <option value="FREE">Free</option>
                <option value="PREMIUM">Premium</option>
                <option value="DESTAQUE">Destaque</option>
              </select>
            </div>
            <div className="flex flex-col gap-3 justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="featured" value="true" defaultChecked={company.featured}
                  className="w-4 h-4 rounded accent-[#ff1f1f]" />
                <span className="text-[#d4d4da] text-[13px]">★ Empresa em destaque</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="emailVerified" value="true" defaultChecked={company.emailVerified}
                  className="w-4 h-4 rounded accent-[#ff1f1f]" />
                <span className="text-[#d4d4da] text-[13px]">✓ E-mail verificado</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Dados principais ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Dados da Empresa</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Nome Fantasia *</label>
              <input name="tradeName" required defaultValue={company.tradeName} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Razão Social</label>
              <input name="legalName" defaultValue={company.legalName ?? ""} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>CNPJ</label>
              <input name="cnpj" defaultValue={company.cnpj ?? ""} className={inputCls} placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <label className={labelCls}>E-mail</label>
              <input name="email" type="email" defaultValue={company.email ?? ""} className={inputCls} placeholder="contato@empresa.com.br" />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input name="phone" defaultValue={company.phone ?? ""} className={inputCls} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input name="whatsappNumber" defaultValue={company.whatsappNumber ?? ""} className={inputCls} placeholder="5511999999999" />
              <p className="text-[#526888] text-[11px] mt-1">Formato internacional sem espaços. Ex: 5511999998888</p>
            </div>
            <div>
              <label className={labelCls}>Segmento</label>
              <select name="segment" defaultValue={company.segment} className={selectCls}>
                <option value="ARMAS">Armas</option>
                <option value="MUNICOES">Munições</option>
                <option value="ACESSORIOS">Acessórios</option>
                <option value="CACA">Caça / Pesca</option>
                <option value="TIRO_ESPORTIVO">Tiro Esportivo</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Site</label>
              <input name="website" type="url" defaultValue={company.website ?? ""} className={inputCls} placeholder="https://..." />
            </div>
            <div>
              <label className={labelCls}>Instagram</label>
              <input name="instagram" defaultValue={company.instagram ?? ""} className={inputCls} placeholder="@empresa" />
            </div>
          </div>
        </div>

        {/* ── Localização ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Localização</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="lg:col-span-2">
              <label className={labelCls}>Endereço</label>
              <input name="address" defaultValue={company.address ?? ""} className={inputCls} placeholder="Rua, número, complemento" />
            </div>
            <div>
              <label className={labelCls}>Cidade</label>
              <input name="city" defaultValue={company.city ?? ""} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <input name="state" defaultValue={company.state ?? ""} className={inputCls} placeholder="SP" maxLength={2} />
            </div>
            <div>
              <label className={labelCls}>CEP</label>
              <input name="zip" defaultValue={company.zip ?? ""} className={inputCls} placeholder="00000-000" />
            </div>
          </div>
        </div>

        {/* ── Mensagem WhatsApp ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Mensagem Padrão (WhatsApp)</p>
          <textarea
            name="whatsappMessage" rows={3}
            defaultValue={company.whatsappMessage ?? ""}
            placeholder="Ex: Olá! Vi sua empresa na Revista Magnum e gostaria de mais informações."
            className={areaCls}
          />
        </div>

        {/* ── Imagens ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Imagens</p>
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelCls}>Logotipo</label>
              <ImageUpload folder="empresas" filename={`logo-${id}`} defaultUrl={logoUrl} onUrlChange={setLogoUrl} inputName="logoUrl" aspectHint="PNG com fundo transparente. Proporção livre." />
            </div>
            <div>
              <label className={labelCls}>Foto de Destaque</label>
              <ImageUpload folder="empresas" filename={`foto-${id}`} defaultUrl={coverUrl} onUrlChange={setCoverUrl} inputName="coverImageUrl" aspectHint="Foto da empresa ou showroom. Proporção 16:9 recomendada." />
            </div>
          </div>
        </div>

        {/* ── Descrição ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Descrição Pública</p>
          <textarea
            rows={6} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Apresentação da empresa, produtos, diferenciais..."
            className={areaCls}
          />
          <div className="flex justify-end mt-1">
            <p className={`text-[11px] font-mono tabular-nums ${descColor}`}>{descCount}/{DESC_LIMIT}</p>
          </div>
        </div>

        {/* ── Notas internas ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Notas Internas (admin)</p>
          <textarea
            name="notes" rows={3}
            defaultValue={company.notes ?? ""}
            placeholder="Observações internas, não exibidas ao público..."
            className={areaCls}
          />
        </div>

        {/* ── Ações ── */}
        <div className="flex items-center justify-between pt-2 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors">
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
            <Link href="/admin/guia"
              className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
              Cancelar
            </Link>
          </div>

          {!delConfirm ? (
            <button type="button" onClick={() => setDelConfirm(true)}
              className="text-[#526888] hover:text-[#ff6b6b] text-[13px] transition-colors">
              Excluir empresa
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[#ff6b6b] text-[13px]">Confirmar exclusão?</span>
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="bg-[#2d0a0a] border border-[#ff1f1f]/30 hover:bg-[#3d0a0a] text-[#ff6b6b] text-[13px] h-[34px] px-4 rounded-[6px] transition-colors disabled:opacity-50">
                {deleting ? "Excluindo..." : "Sim, excluir"}
              </button>
              <button type="button" onClick={() => setDelConfirm(false)}
                className="text-[#526888] hover:text-white text-[13px] transition-colors">
                Cancelar
              </button>
            </div>
          )}
        </div>
      </form>
    </>
  );
}
