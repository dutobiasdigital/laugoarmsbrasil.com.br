"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";

const inputCls = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";
const sectionTitle = "text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4";

const DESC_LIMIT = 600;

export default function NovaEmpresaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeName, setTradeName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const descCount = description.length;
  const descColor =
    descCount > DESC_LIMIT ? "text-red-400" : descCount > DESC_LIMIT * 0.85 ? "text-amber-400" : "text-[#526888]";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (descCount > DESC_LIMIT) {
      setError(`A descrição não pode ultrapassar ${DESC_LIMIT} caracteres.`);
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      ...Object.fromEntries(fd),
      description,
      logoUrl,
      coverImageUrl,
    };
    const res = await fetch("/api/admin/empresas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao cadastrar empresa."); setLoading(false); return; }
    router.push("/admin/empresas");
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/empresas" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">← Empresas</Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Nova Empresa</span>
      </div>
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">Nova Empresa</h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">Cadastre um novo anunciante no Guia Comercial.</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">{error}</div>}

      <form onSubmit={handleSubmit} className="max-w-[860px]">

        {/* ── Dados da empresa ── */}
        <div className="mb-8">
          <p className={sectionTitle}>Dados da Empresa</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Nome Fantasia *</label>
              <input name="tradeName" required value={tradeName} onChange={e => setTradeName(e.target.value)} placeholder="Ex: Dufex Armas" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Razão Social</label>
              <input name="legalName" placeholder="Ex: Dufex Comércio de Armas Ltda" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nome do Contato</label>
              <input name="contact" placeholder="Nome do responsável" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input name="phone" placeholder="(11) 99999-9999" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input name="whatsappNumber" placeholder="5511999999999 (com DDI)" className={inputCls} />
              <p className="text-[#526888] text-[11px] mt-1">Formato internacional sem espaços. Ex: 5511999998888</p>
            </div>
            <div>
              <label className={labelCls}>E-mail</label>
              <input name="email" type="email" placeholder="contato@empresa.com.br" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Segmento *</label>
              <select name="segment" defaultValue="OUTROS" className={selectCls}>
                <option value="ARMAS">Armas</option>
                <option value="MUNICOES">Munições</option>
                <option value="ACESSORIOS">Acessórios</option>
                <option value="CACA">Caça</option>
                <option value="TIRO_ESPORTIVO">Tiro Esportivo</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Site</label>
              <input name="website" type="url" placeholder="https://www.empresa.com.br" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Instagram</label>
              <input name="instagram" placeholder="@empresa" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Endereço</label>
              <input name="address" placeholder="Rua, número, cidade, estado" className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── Mensagem padrão WhatsApp ── */}
        <div className="mb-8">
          <p className={sectionTitle}>Mensagem Padrão (WhatsApp)</p>
          <div>
            <label className={labelCls}>Texto pré-preenchido ao visitante clicar em "Falar no WhatsApp"</label>
            <textarea
              name="whatsappMessage"
              rows={3}
              placeholder="Ex: Olá! Vi sua empresa na Laúgo Arms Brasil e gostaria de mais informações."
              className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
            />
          </div>
        </div>

        {/* ── Imagens ── */}
        <div className="mb-8">
          <p className={sectionTitle}>Imagens</p>
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelCls}>Logotipo</label>
              <ImageUpload
                folder="empresas"
                filename={tradeName ? `logo-${tradeName.toLowerCase().replace(/\s+/g, '-')}` : undefined}
                defaultUrl={logoUrl}
                onUrlChange={setLogoUrl}
                inputName="logoUrl"
                aspectHint="Fundo transparente (PNG). Proporção livre."
              />
            </div>
            <div>
              <label className={labelCls}>Foto de Destaque</label>
              <ImageUpload
                folder="empresas"
                filename={tradeName ? `foto-${tradeName.toLowerCase().replace(/\s+/g, '-')}` : undefined}
                defaultUrl={coverImageUrl}
                onUrlChange={setCoverImageUrl}
                inputName="coverImageUrl"
                aspectHint="Foto da empresa, showroom ou produto. Proporção 16:9 recomendada."
              />
            </div>
          </div>
        </div>

        {/* ── Descrição ── */}
        <div className="mb-8">
          <p className={sectionTitle}>Descrição Pública</p>
          <div>
            <label className={labelCls}>
              Texto exibido na página da empresa no Guia
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Apresentação da empresa, produtos, diferenciais... Seja objetivo e atrativo."
              className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[#526888] text-[11px]">
                Dica: seja direto. Textos até 400 caracteres têm melhor leitura na vitrine do guia.
              </p>
              <p className={`text-[11px] font-mono tabular-nums ${descColor}`}>
                {descCount}/{DESC_LIMIT}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors">
            {loading ? "Salvando..." : "Cadastrar Empresa"}
          </button>
          <Link href="/admin/empresas" className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
