"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload, { slugify } from "@/components/admin/ImageUpload";

const inputCls =
  "bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#a1a1aa] text-[12px] font-semibold mb-1.5";
const selectCls =
  "bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";

export default function NovoAnuncioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advertiser, setAdvertiser] = useState("");

  const imageFilename = advertiser ? `anuncio-${slugify(advertiser)}` : undefined;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/anuncios", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao criar anúncio.");
      setLoading(false);
      return;
    }
    router.push("/admin/anuncios");
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/anuncios" className="text-[#a1a1aa] hover:text-white text-[14px] transition-colors">
          ← Anúncios
        </Link>
        <span className="text-[#27272a]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Novo Anúncio</span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Novo Anúncio
      </h1>
      <p className="text-[#a1a1aa] text-[14px] mb-6">Cadastre um novo banner publicitário.</p>
      <div className="bg-[#27272a] h-px mb-6" />

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-[700px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div>
            <label className={labelCls}>Nome do anúncio *</label>
            <input name="name" required placeholder="Ex: Banner Loja ABC — Nov 2025" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Anunciante *</label>
            <input
              name="advertiser"
              required
              placeholder="Nome da empresa"
              className={inputCls}
              value={advertiser}
              onChange={(e) => setAdvertiser(e.target.value)}
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>Imagem do Banner *</label>
            <ImageUpload
              folder="anuncios"
              filename={imageFilename}
              inputName="imageUrl"
              aspectHint="Preencha o anunciante antes de fazer upload para nomear o arquivo corretamente"
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>URL de Destino (clique) *</label>
            <input name="targetUrl" required type="url" placeholder="https://..." className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Posição *</label>
            <select name="position" required defaultValue="" className={selectCls}>
              <option value="" disabled>Selecione uma posição</option>
              <option value="HOME_TOP">Home — Topo</option>
              <option value="HOME_SIDEBAR">Home — Sidebar</option>
              <option value="ARTICLE_INLINE">Artigo — Inline</option>
              <option value="ARTICLE_SIDEBAR">Artigo — Sidebar</option>
              <option value="EDITIONS_TOP">Edições — Topo</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Máximo de Impressões</label>
            <input name="maxImpressions" type="number" placeholder="Deixe em branco para ilimitado" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Data de Início</label>
            <input name="startsAt" type="date" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Data de Término</label>
            <input name="endsAt" type="date" className={inputCls} />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input id="active" name="active" type="checkbox" defaultChecked className="w-[16px] h-[16px] accent-[#ff1f1f]" />
            <label htmlFor="active" className="text-[#d4d4da] text-[14px]">Ativo (exibir imediatamente)</label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors"
          >
            {loading ? "Salvando..." : "Criar Anúncio"}
          </button>
          <Link
            href="/admin/anuncios"
            className="bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
