export const dynamic = "force-dynamic";

import Link from "next/link";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

interface Gallery {
  id: string;
  title: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  cover_url: string | null;
  created_at: string;
}

export default async function GaleriasPage() {
  let galleries: Gallery[] = [];

  try {
    const res = await fetch(
      `${BASE}/galleries?select=id,title,slug,is_active,sort_order,cover_url,created_at&order=sort_order.asc,created_at.desc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    galleries = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
          Galerias
        </h1>
        <Link
          href="/admin/galerias/nova"
          className="bg-[#CB0A0E] hover:bg-[#a80009] text-white text-[14px] font-semibold h-[40px] px-5 rounded-[6px] transition-colors flex items-center gap-2"
        >
          <span>+</span> Nova Galeria
        </Link>
      </div>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{galleries.length} galerias cadastradas</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] overflow-hidden">
        {galleries.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#7a9ab5] text-[14px]">
            Nenhuma galeria cadastrada ainda.{" "}
            <Link href="/admin/galerias/nova" className="text-[#CB0A0E] hover:opacity-80">
              Criar a primeira
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#141d2c]">
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] w-[72px]">Capa</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Título</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Slug</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] w-[80px]">Ordem</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] w-[100px]">Status</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] w-[120px]">Criado em</th>
                  <th className="px-5 py-3 w-[80px]" />
                </tr>
              </thead>
              <tbody>
                {galleries.map((gal) => (
                  <tr key={gal.id} className="border-b border-[#141d2c] hover:bg-[#0a0f1a]">
                    <td className="px-5 py-3">
                      {gal.cover_url ? (
                        <img
                          src={gal.cover_url}
                          alt={gal.title}
                          className="w-[48px] h-[36px] object-cover rounded-[4px] bg-[#141d2c]"
                        />
                      ) : (
                        <div className="w-[48px] h-[36px] rounded-[4px] bg-[#141d2c] flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                            className="w-[18px] h-[18px] text-[#526888]">
                            <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#d4d4da] text-[14px] font-medium">{gal.title}</td>
                    <td className="px-5 py-3 text-[#7a9ab5] text-[12px] font-mono">{gal.slug}</td>
                    <td className="px-5 py-3 text-[#7a9ab5] text-[13px] text-center">{gal.sort_order}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${
                          gal.is_active
                            ? "bg-green-900/40 text-green-400 border border-green-800/50"
                            : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/50"
                        }`}
                      >
                        {gal.is_active ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#526888] text-[12px]">
                      {new Date(gal.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/galerias/${gal.id}`}
                        className="text-[#CB0A0E] hover:opacity-80 text-[12px] transition-opacity"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
