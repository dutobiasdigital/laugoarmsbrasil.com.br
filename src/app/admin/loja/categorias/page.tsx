export const dynamic = "force-dynamic";

import Link from "next/link";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

interface Category {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default async function CategoriasLojaPage() {
  let categories: Category[] = [];

  try {
    const res = await fetch(
      `${BASE}/shop_categories?select=id,title,slug,description,isActive,sortOrder,createdAt&order=sortOrder.asc,isActive.desc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    categories = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/loja" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Loja
        </Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Categorias</span>
      </div>

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
          Categorias da Loja
        </h1>
        <Link
          href="/admin/loja/categorias/nova"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 rounded-[6px] transition-colors flex items-center gap-2"
        >
          <span>+</span> Nova Categoria
        </Link>
      </div>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{categories.length} categorias cadastradas</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] overflow-hidden">
        {categories.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#7a9ab5] text-[14px]">
            Nenhuma categoria cadastrada ainda.{" "}
            <Link href="/admin/loja/categorias/nova" className="text-[#ff1f1f] hover:text-[#ff4444]">
              Criar a primeira
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#141d2c]">
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] w-[80px]">Ordem</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Título</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Slug</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] w-[100px]">Status</th>
                  <th className="px-5 py-3 w-[80px]" />
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-[#141d2c] hover:bg-[#0a0f1a]">
                    <td className="px-5 py-3 text-[#7a9ab5] text-[13px] text-center">{cat.sortOrder}</td>
                    <td className="px-5 py-3 text-[#d4d4da] text-[14px] font-medium">{cat.title}</td>
                    <td className="px-5 py-3 text-[#7a9ab5] text-[12px] font-mono">{cat.slug}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${
                          cat.isActive
                            ? "bg-green-900/40 text-green-400 border border-green-800/50"
                            : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/50"
                        }`}
                      >
                        {cat.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/loja/categorias/${cat.id}`}
                        className="text-[#ff1f1f] hover:text-[#ff4444] text-[12px] transition-colors"
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
