"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ImageUpload, { slugify } from "@/components/admin/ImageUpload";

const inputCls  = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls  = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";

const BANNER_SIZES = [
  { value: "BILLBOARD",    label: "Billboard — 970×250px",       desc: "Home Topo" },
  { value: "LEADERBOARD",  label: "Leaderboard — 728×90px",      desc: "Topo de páginas" },
  { value: "MED_RECT",     label: "Medium Rectangle — 300×250px", desc: "Sidebar / inline" },
  { value: "HALF_PAGE",    label: "Half Page — 300×600px",       desc: "Sidebar fixa" },
  { value: "LARGE_MOBILE", label: "Large Mobile — 320×100px",    desc: "Mobile" },
];

const POSITIONS = [
  { value: "HOME_TOP",         label: "Home — Topo" },
  { value: "HOME_SIDEBAR",     label: "Home — Sidebar" },
  { value: "ARTICLE_INLINE",   label: "Artigo — Entre parágrafos" },
  { value: "ARTICLE_SIDEBAR",  label: "Artigo — Sidebar" },
  { value: "EDITIONS_TOP",     label: "Edições — Topo" },
  { value: "EDITIONS_SIDEBAR", label: "Edições — Sidebar" },
  { value: "BLOG_TOP",         label: "Blog — Topo" },
  { value: "GLOBAL_FOOTER",    label: "Rodapé global" },
];

interface Advertiser { id: string; tradeName: string; }

interface Ad {
  id: string;
  name: string;
  advertiser: string;
  advertiserId: string | null;
  imageUrl: string;
  targetUrl: string;
  position: string;
  bannerSize: string | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  maxImpressions: number | null;
  notes: string | null;
  clicks: number;
}

export default function EditarAnuncioPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [ad, setAd] = useState<Ad | null>(null);
  const [empresas, setEmpresas] = useState<Advertiser[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [advertiserName, setAdvertiserName] = useState("");
  const [bannerSize, setBannerSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load ad data
    fetch("/api/admin/anuncios")
      .then(r => r.json())
      .then((list: Ad[]) => {
        const found = list.find(a => a.id === id);
        if (found) {
          setAd(found);
          setAdvertiserName(found.advertiser);
          setBannerSize(found.bannerSize ?? "");
          setSelectedEmpresa(found.advertiserId ?? "");
        }
      });
    // Load empresas
    fetch("/api/admin/empresas")
      .then(r => r.json())
      .then((d: Advertiser[]) => setEmpresas(Array.isArray(d) ? d : []));
  }, [id]);

  const imageFilename = advertiserName ? `anuncio-${slugify(advertiserName)}` : undefined;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      id,
      ...Object.fromEntries(fd),
      advertiserId: selectedEmpresa || null,
    };
    const res = await fetch("/api/admin/anuncios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao salvar."); setLoading(false); return; }
    router.push("/admin/anuncios");
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch("/api/admin/anuncios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) router.push("/admin/anuncios");
    else { setError("Erro ao excluir."); setDeleting(false); setConfirmDelete(false); }
  }

  if (!ad) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-[#526888] text-[14px]">Carregando...</p>
    </div>
  );

  const toDateInput = (iso: string | null) => iso ? iso.substring(0, 10) : "";

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/anuncios" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">← Anúncios</Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px] truncate max-w-[300px]">{ad.name}</span>
      </div>
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">Editar Anúncio</h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{ad.name}</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Stats bar */}
      <div className="flex gap-4 mb-6">
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[8px] px-5 py-3 flex flex-col gap-0.5">
          <p className="text-[#526888] text-[11px] uppercase tracking-wide">Cliques</p>
          <p className="text-[#d4d4da] text-[22px] font-bold font-['Barlow_Condensed']">{(ad.clicks ?? 0).toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">{error}</div>}

      <form onSubmit={handleSubmit} className="max-w-[860px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Empresa */}
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
            <input name="name" required defaultValue={ad.name} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Anunciante (texto) *</label>
            <input name="advertiser" required className={inputCls}
              value={advertiserName} onChange={e => setAdvertiserName(e.target.value)} />
          </div>

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

          <div>
            <label className={labelCls}>Posição no Site *</label>
            <select name="position" required defaultValue={ad.position} className={selectCls}>
              <option value="" disabled>Selecione a posição...</option>
              {POSITIONS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>Imagem do Banner *</label>
            <ImageUpload
              folder="anuncios"
              filename={imageFilename}
              inputName="imageUrl"
              defaultUrl={ad.imageUrl}
              aspectHint={bannerSize ? `Tamanho recomendado: ${BANNER_SIZES.find(s => s.value === bannerSize)?.label}` : "Selecione o tamanho do banner acima"}
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>URL de Destino (clique) *</label>
            <input name="targetUrl" required type="url" defaultValue={ad.targetUrl} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Data de Início</label>
            <input name="startsAt" type="date" defaultValue={toDateInput(ad.startsAt)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Data de Término</label>
            <input name="endsAt" type="date" defaultValue={toDateInput(ad.endsAt)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Máximo de Impressões</label>
            <input name="maxImpressions" type="number" defaultValue={ad.maxImpressions ?? ""} placeholder="Em branco = ilimitado" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Notas Internas</label>
            <input name="notes" defaultValue={ad.notes ?? ""} placeholder="Observações para a equipe..." className={inputCls} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input id="active" name="active" type="checkbox" defaultChecked={ad.active} className="w-[16px] h-[16px] accent-[#ff1f1f]" />
            <label htmlFor="active" className="text-[#d4d4da] text-[14px]">Ativo (exibir no site)</label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex gap-3">
            <button type="submit" disabled={loading || deleting}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
            <Link href="/admin/anuncios" className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
              Cancelar
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <>
                <span className="text-[#ff6b6b] text-[13px] font-medium">Confirma exclusão?</span>
                <button type="button" onClick={handleDelete} disabled={deleting}
                  className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[38px] px-4 rounded-[6px] transition-colors">
                  {deleting ? "Excluindo..." : "Sim, excluir"}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="bg-[#141d2c] border border-[#1c2a3e] text-[#d4d4da] text-[13px] h-[38px] px-4 rounded-[6px] transition-colors">
                  Não
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} disabled={loading}
                className="border border-[#3a1010] hover:border-[#ff1f1f]/50 text-[#526888] hover:text-[#ff6b6b] text-[13px] h-[38px] px-4 rounded-[6px] transition-colors">
                🗑 Excluir anúncio
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
