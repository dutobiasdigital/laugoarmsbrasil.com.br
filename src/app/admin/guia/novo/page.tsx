"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";

const inputCls   = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls   = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls  = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";
const sectionTtl = "text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4";

const DESC_LIMIT = 600;

export default function NovaEmpresaGuiaPage() {
  const router = useRouter();
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [logoUrl,     setLogoUrl]     = useState("");
  const [coverUrl,    setCoverUrl]    = useState("");

  const descCount = description.length;
  const descColor = descCount > DESC_LIMIT ? "text-red-400" : descCount > DESC_LIMIT * 0.85 ? "text-amber-400" : "text-[#526888]";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (descCount > DESC_LIMIT) { setError(`Descrição máxima: ${DESC_LIMIT} caracteres.`); return; }
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/guia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(fd), description, logoUrl, coverImageUrl: coverUrl }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao cadastrar empresa."); setLoading(false); return; }
    router.push("/admin/guia");
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/guia" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">← Guia Magnum</Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Nova Empresa</span>
      </div>
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">Nova Empresa no Guia</h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">Preencha os dados para cadastrar a empresa no Guia Magnum.</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">{error}</div>}

      <form onSubmit={handleSubmit} className="max-w-[860px]">

        {/* ── Dados principais ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Dados da Empresa</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Nome Fantasia *</label>
              <input name="tradeName" required className={inputCls} placeholder="Ex: Armas do Brasil Ltda" />
            </div>
            <div>
              <label className={labelCls}>Razão Social</label>
              <input name="legalName" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>CNPJ</label>
              <input name="cnpj" className={inputCls} placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <label className={labelCls}>E-mail *</label>
              <input name="email" type="email" required className={inputCls} placeholder="contato@empresa.com.br" />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input name="phone" className={inputCls} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input name="whatsappNumber" className={inputCls} placeholder="5511999999999" />
              <p className="text-[#526888] text-[11px] mt-1">Formato internacional sem espaços. Ex: 5511999998888</p>
            </div>
            <div>
              <label className={labelCls}>Segmento *</label>
              <select name="segment" required className={selectCls}>
                <option value="ARMAS">Armas</option>
                <option value="MUNICOES">Munições</option>
                <option value="ACESSORIOS">Acessórios</option>
                <option value="CACA">Caça / Pesca</option>
                <option value="TIRO_ESPORTIVO">Tiro Esportivo</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Plano do Guia</label>
              <select name="listingType" className={selectCls}>
                <option value="NONE">Sem plano</option>
                <option value="FREE">Free</option>
                <option value="PREMIUM">Premium</option>
                <option value="DESTAQUE">Destaque</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Site</label>
              <input name="website" type="url" className={inputCls} placeholder="https://..." />
            </div>
            <div>
              <label className={labelCls}>Instagram</label>
              <input name="instagram" className={inputCls} placeholder="@empresa" />
            </div>
          </div>
        </div>

        {/* ── Localização ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Localização</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="lg:col-span-2">
              <label className={labelCls}>Endereço</label>
              <input name="address" className={inputCls} placeholder="Rua, número, complemento" />
            </div>
            <div>
              <label className={labelCls}>Cidade *</label>
              <input name="city" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado *</label>
              <input name="state" required className={inputCls} placeholder="SP" maxLength={2} />
            </div>
            <div>
              <label className={labelCls}>CEP</label>
              <input name="zip" className={inputCls} placeholder="00000-000" />
            </div>
          </div>
        </div>

        {/* ── Mensagem WhatsApp ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Mensagem Padrão (WhatsApp)</p>
          <textarea
            name="whatsappMessage" rows={3}
            placeholder="Ex: Olá! Vi sua empresa na Revista Magnum e gostaria de mais informações."
            className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
          />
        </div>

        {/* ── Imagens ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Imagens</p>
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelCls}>Logotipo</label>
              <ImageUpload folder="empresas" filename={`logo-nova-${Date.now()}`} defaultUrl={logoUrl} onUrlChange={setLogoUrl} inputName="logoUrl" aspectHint="PNG com fundo transparente. Proporção livre." />
            </div>
            <div>
              <label className={labelCls}>Foto de Destaque</label>
              <ImageUpload folder="empresas" filename={`foto-nova-${Date.now()}`} defaultUrl={coverUrl} onUrlChange={setCoverUrl} inputName="coverImageUrl" aspectHint="Foto da empresa ou showroom. Proporção 16:9 recomendada." />
            </div>
          </div>
        </div>

        {/* ── Descrição ── */}
        <div className="mb-8">
          <p className={sectionTtl}>Descrição Pública</p>
          <textarea
            rows={6} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Apresentação da empresa, produtos, diferenciais..."
            className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
          />
          <div className="flex justify-end mt-1">
            <p className={`text-[11px] font-mono tabular-nums ${descColor}`}>{descCount}/{DESC_LIMIT}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors">
            {loading ? "Cadastrando..." : "Cadastrar no Guia"}
          </button>
          <Link href="/admin/guia" className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
