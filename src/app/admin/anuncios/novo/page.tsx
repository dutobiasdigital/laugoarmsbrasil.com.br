"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload, { slugify } from "@/components/admin/ImageUpload";

const inputCls = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";

const BANNER_SIZES = [
  { value: "BILLBOARD",    label: "Billboard — 970×250px",      desc: "Home Topo" },
  { value: "LEADERBOARD",  label: "Leaderboard — 728×90px",     desc: "Topo de páginas" },
  { value: "MED_RECT",     label: "Medium Rectangle — 300×250px", desc: "Sidebar / inline" },
  { value: "HALF_PAGE",    label: "Half Page — 300×600px",      desc: "Sidebar fixa" },
  { value: "LARGE_MOBILE", label: "Large Mobile — 320×100px",   desc: "Mobile" },
];

const POSITIONS = [
  { value: "HOME_TOP",        label: "Home — Topo" },
  { value: "HOME_SIDEBAR",    label: "Home — Sidebar" },
  { value: "ARTICLE_INLINE",  label: "Artigo — Entre parágrafos" },
  { value: "ARTICLE_SIDEBAR", label: "Artigo — Sidebar" },
  { value: "EDITIONS_TOP",    label: "Edições — Topo" },
  { value: "EDITIONS_SIDEBAR",label: "Edições — Sidebar" },
  { value: "BLOG_TOP",        label: "Blog — Topo" },
  { value: "GLOBAL_FOOTER",   label: "Rodapé global" },
];

interface Advertiser { id: string; tradeName: string; segment: string; }

export default function NovoAnuncioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Advertiser[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [advertiserName, setAdvertiserName] = useState("");
  const [bannerSize, setBannerSize] = useState("");

  useEffect(() => {
    fetch("/api/admin/empresas").then(r => r.json()).then(d => setEmpresas(Array.isArray(d) ? d : []));
  }, []);

  const imageFilename = advertiserName ? `anuncio-${slugify(advertiserName)}` : undefined;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      ...Object.fromEntries(fd),
      advertiserId: selectedEmpresa || null,
    };
    const res = await fetch("/api/admin/anuncios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao criar anúncio."); setLoading(false); return; }
    router.push("/admin/anuncios");
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/anuncios" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">← Anúncios</Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Novo Anúncio</span>
      </div>
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">Novo Anúncio</h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">Cadastre um novo banner publicitário.</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">{error}</div>}

      <form onSubmit={handleSubmit} className="max-w-[860px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Empresa anunciante */}
          <div className="lg:col-span-2">
            <label className={labelCls}>Empresa Anunciante</label>
            <div className="flex gap-2">
              <select
                value={selectedEmpresa}
                onChange={e => {
                  setSelectedEmpresa(e.target.value);
                  const emp = empresas.find(em => em.id === e.target.value);
                  if (emp) setAdvertiserName(emp.tradeName);
                }}
                className={selectCls}
              >
                <option value="">Selecione uma empresa cadastrada...</option>
                {empresas.map(em => (
                  <option key={em.id} value={em.id}>{em.tradeName}</option>
                ))}
              </select>
              <Link href="/admin/empresas/nova" target="_blank"
                className="shrink-0 bg-[#141d2c] border border-[#1c2a3e] hover:border-[#ff1f1f] text-[#7a9ab5] hover:text-white text-[13px] h-[40px] px-4 flex items-center rounded-[6px] transition-colors whitespace-nowrap">
                + Nova empresa
              </Link>
            </div>
          </div>

          <div>
            <label className={labelCls}>Nome do Anúncio *</label>
            <input name="name" required placeholder="Ex: Banner Dufex — Jan 2026" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Anunciante (texto) *</label>
            <input name="advertiser" required placeholder="Nome da empresa" className={inputCls}
              value={advertiserName} onChange={e => setAdvertiserName(e.target.value)} />
          </div>

          {/* Tamanho do banner */}
          <div>
            <label className={labelCls}>Tamanho do Banner *</label>
            <select name="bannerSize" required value={bannerSize} onChange={e => setBannerSize(e.target.value)} className={selectCls}>
              <option value="" disabled>Selecione o tamanho...</option>
              {BANNER_SIZES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {bannerSize && (
              <p className="text-[#526888] text-[11px] mt-1">
                {BANNER_SIZES.find(s => s.value === bannerSize)?.desc}
              </p>
            )}
          </div>

          {/* Posição */}
          <div>
            <label className={labelCls}>Posição no Site *</label>
            <select name="position" required defaultValue="" className={selectCls}>
              <option value="" disabled>Selecione a posição...</option>
              {POSITIONS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Imagem */}
          <div className="lg:col-span-2">
            <label className={labelCls}>Imagem do Banner *</label>
            <ImageUpload folder="anuncios" filename={imageFilename} inputName="imageUrl"
              aspectHint={bannerSize ? `Tamanho recomendado: ${BANNER_SIZES.find(s=>s.value===bannerSize)?.label}` : "Selecione o tamanho do banner acima"} />
          </div>

          {/* URL de destino */}
          <div className="lg:col-span-2">
            <label className={labelCls}>URL de Destino (clique) *</label>
            <input name="targetUrl" required type="url" placeholder="https://www.anunciante.com.br" className={inputCls} />
          </div>

          {/* Período */}
          <div>
            <label className={labelCls}>Data de Início</label>
            <input name="startsAt" type="date" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Data de Término</label>
            <input name="endsAt" type="date" className={inputCls} />
          </div>

          {/* Máximo de impressões */}
          <div>
            <label className={labelCls}>Máximo de Impressões</label>
            <input name="maxImpressions" type="number" placeholder="Em branco = ilimitado" className={inputCls} />
          </div>

          {/* Notas internas */}
          <div>
            <label className={labelCls}>Notas Internas</label>
            <input name="notes" placeholder="Observações para a equipe..." className={inputCls} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input id="active" name="active" type="checkbox" defaultChecked className="w-[16px] h-[16px] accent-[#ff1f1f]" />
            <label htmlFor="active" className="text-[#d4d4da] text-[14px]">Ativo (exibir imediatamente)</label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors">
            {loading ? "Salvando..." : "Criar Anúncio"}
          </button>
          <Link href="/admin/anuncios" className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
