export const dynamic = "force-dynamic";

import Link from "next/link";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const PAGE_SIZE = 20;

interface Product {
  id: string;
  name: string;
  slug: string;
  mainImageUrl: string | null;
  basePrice: number;
  stock: number | null;
  hasVariations: boolean;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  sku: string | null;
}

interface Category {
  id: string;
  title: string;
}

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutosLojaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoryId?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q          = sp.q ?? "";
  const categoryId = sp.categoryId ?? "";
  const page       = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset     = (page - 1) * PAGE_SIZE;

  let products: Product[]    = [];
  let categories: Category[] = [];
  let total = 0;

  try {
    const [catRes, prodRes] = await Promise.all([
      fetch(`${BASE}/shop_categories?select=id,title&isActive=eq.true&order=sortOrder.asc`, {
        headers: HEADERS,
        cache: "no-store",
      }),
      (async () => {
        let url = `${BASE}/shop_products?select=id,name,slug,mainImageUrl,basePrice,stock,hasVariations,isActive,isFeatured,categoryId,sku&order=createdAt.desc&limit=${PAGE_SIZE}&offset=${offset}`;
        if (q) url += `&name=ilike.*${encodeURIComponent(q)}*`;
        if (categoryId) url += `&categoryId=eq.${categoryId}`;
        return fetch(url, {
          headers: { ...HEADERS, Prefer: "count=exact" },
          cache: "no-store",
        });
      })(),
    ]);

    const catData = await catRes.json();
    categories = Array.isArray(catData) ? catData : [];

    const countStr = prodRes.headers.get("content-range")?.split("/")[1] ?? "0";
    total = parseInt(countStr, 10);
    const prodData = await prodRes.json();
    products = Array.isArray(prodData) ? prodData : [];
  } catch {
    // DB unavailable
  }

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.title]));
  const totalPages  = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/loja" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Loja
        </Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Produtos</span>
      </div>

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
          Produtos da Loja
        </h1>
        <Link
          href="/admin/loja/produtos/novo"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 rounded-[6px] transition-colors flex items-center gap-2"
        >
          <span>+</span> Novo Produto
        </Link>
      </div>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{total} produto{total !== 1 ? "s" : ""} cadastrado{total !== 1 ? "s" : ""}</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-5 flex-wrap">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-[260px]"
        />
        <select
          name="categoryId"
          defaultValue={categoryId}
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f]"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[40px] px-5 rounded-[6px] transition-colors"
        >
          Filtrar
        </button>
        {(q || categoryId) && (
          <Link
            href="/admin/loja/produtos"
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] text-[14px] h-[40px] px-5 rounded-[6px] transition-colors flex items-center"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] overflow-hidden">
        {products.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#7a9ab5] text-[14px]">
            Nenhum produto encontrado.{" "}
            {!q && !categoryId && (
              <Link href="/admin/loja/produtos/novo" className="text-[#ff1f1f] hover:text-[#ff4444]">
                Criar o primeiro
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#141d2c]">
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] w-[60px]">Foto</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Nome</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Categoria</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Preço</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Estoque</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] w-[90px]">Status</th>
                  <th className="px-5 py-3 w-[70px]" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[#141d2c] hover:bg-[#0a0f1a]">
                    <td className="px-5 py-3">
                      {p.mainImageUrl ? (
                        <div className="w-[48px] h-[48px] rounded-[6px] overflow-hidden border border-[#1c2a3e] bg-[#141d2c]">
                          <img
                            src={p.mainImageUrl}
                            alt={p.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-[48px] h-[48px] rounded-[6px] border border-[#1c2a3e] bg-[#141d2c] flex items-center justify-center text-[18px]">
                          📦
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-[#d4d4da] text-[14px] font-medium">{p.name}</div>
                      {p.sku && <div className="text-[#7a9ab5] text-[11px] font-mono mt-0.5">SKU: {p.sku}</div>}
                      {p.isFeatured && (
                        <span className="inline-flex px-1.5 py-0.5 rounded-[3px] text-[10px] font-semibold bg-amber-900/30 text-amber-400 border border-amber-800/40 mt-0.5">
                          Destaque
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#7a9ab5] text-[13px]">
                      {p.categoryId ? (categoryMap[p.categoryId] ?? "—") : "—"}
                    </td>
                    <td className="px-5 py-3 text-[#d4d4da] text-[13px]">
                      {fmtBRL(p.basePrice)}
                    </td>
                    <td className="px-5 py-3 text-[#d4d4da] text-[13px]">
                      {p.hasVariations ? (
                        <span className="text-[#7a9ab5] text-[12px]">Variações</span>
                      ) : (
                        p.stock ?? 0
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${
                          p.isActive
                            ? "bg-green-900/40 text-green-400 border border-green-800/50"
                            : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/50"
                        }`}
                      >
                        {p.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/loja/produtos/${p.id}`}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-5">
          {page > 1 && (
            <Link
              href={`/admin/loja/produtos?q=${q}&categoryId=${categoryId}&page=${page - 1}`}
              className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] h-[36px] px-4 rounded-[6px] transition-colors flex items-center"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-[#7a9ab5] text-[13px] px-2">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/loja/produtos?q=${q}&categoryId=${categoryId}&page=${page + 1}`}
              className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] h-[36px] px-4 rounded-[6px] transition-colors flex items-center"
            >
              Próxima →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
