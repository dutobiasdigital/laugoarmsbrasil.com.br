export const dynamic = "force-dynamic";

import Link from "next/link";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

interface Category {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  imageUrl: string | null;
  parentId: string | null;
}

export default async function CategoriasLojaPage() {
  let categories: Category[] = [];

  try {
    const res = await fetch(
      `${BASE}/shop_categories?select=id,title,slug,isActive,sortOrder,imageUrl,parentId&order=sortOrder.asc,title.asc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    categories = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

  // Build tree: roots first, then children grouped under their parent
  const roots    = categories.filter((c) => !c.parentId);
  const children = categories.filter((c) => !!c.parentId);

  const tree: { parent: Category; children: Category[] }[] = roots.map((r) => ({
    parent: r,
    children: children.filter((c) => c.parentId === r.id).sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  // Orphan subcategories (parent deleted)
  const knownParentIds = new Set(roots.map((r) => r.id));
  const orphans = children.filter((c) => !knownParentIds.has(c.parentId!));

  const totalCount = categories.length;

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/loja" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Loja
        </Link>
        <span className="text-[#26262C]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Categorias</span>
      </div>

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-['Archivo'] font-bold text-white text-[32px] leading-none">
          Categorias da Loja
        </h1>
        <Link
          href="/admin/loja/categorias/nova"
          className="bg-[#CB0A0E] hover:bg-[#A00810] text-white text-[14px] font-semibold h-[40px] px-5 rounded-[6px] transition-colors flex items-center gap-2"
        >
          <span>+</span> Nova Categoria
        </Link>
      </div>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{totalCount} categorias cadastradas</p>
      <div className="bg-[#26262C] h-px mb-6" />

      <div className="bg-[#16161A] border border-[#26262C] rounded-[10px] overflow-hidden">
        {tree.length === 0 && orphans.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#7a9ab5] text-[14px]">
            Nenhuma categoria cadastrada ainda.{" "}
            <Link href="/admin/loja/categorias/nova" className="text-[#CB0A0E] hover:text-[#e01015]">
              Criar a primeira
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1C1C21]">
                  <th className="text-left px-5 py-3 text-[#5C5C66] text-[11px] font-semibold uppercase tracking-[0.5px] w-[56px]" />
                  <th className="text-left px-5 py-3 text-[#5C5C66] text-[11px] font-semibold uppercase tracking-[0.5px]">Categoria</th>
                  <th className="text-left px-5 py-3 text-[#5C5C66] text-[11px] font-semibold uppercase tracking-[0.5px] hidden sm:table-cell">Slug</th>
                  <th className="text-left px-5 py-3 text-[#5C5C66] text-[11px] font-semibold uppercase tracking-[0.5px] w-[80px]">Ordem</th>
                  <th className="text-left px-5 py-3 text-[#5C5C66] text-[11px] font-semibold uppercase tracking-[0.5px] w-[100px]">Status</th>
                  <th className="px-5 py-3 w-[80px]" />
                </tr>
              </thead>
              <tbody>
                {tree.map(({ parent, children: subs }) => (
                  <>
                    {/* Parent row */}
                    <tr key={parent.id} className="border-b border-[#26262C] hover:bg-[#1C1C21]">
                      <td className="px-3 py-2.5">
                        {parent.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={parent.imageUrl}
                            alt={parent.title}
                            className="w-[40px] h-[40px] object-cover rounded-[6px] border border-[#26262C]"
                          />
                        ) : (
                          <div className="w-[40px] h-[40px] rounded-[6px] bg-[#1C1C21] border border-[#26262C] flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#3A3A42]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#F4F4F6] text-[14px] font-semibold">{parent.title}</span>
                          {subs.length > 0 && (
                            <span className="bg-[#1C1C21] border border-[#3A3A42] text-[#8A8A95] text-[10px] px-1.5 py-0.5 rounded-[4px]">
                              {subs.length} sub
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-[#5C5C66] text-[12px] font-mono hidden sm:table-cell">{parent.slug}</td>
                      <td className="px-5 py-2.5 text-[#5C5C66] text-[13px] text-center">{parent.sortOrder}</td>
                      <td className="px-5 py-2.5">
                        <StatusBadge active={parent.isActive} />
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <Link
                          href={`/admin/loja/categorias/${parent.id}`}
                          className="text-[#CB0A0E] hover:text-[#e01015] text-[12px] transition-colors"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>

                    {/* Subcategory rows */}
                    {subs.map((sub) => (
                      <tr key={sub.id} className="border-b border-[#26262C] hover:bg-[#1C1C21] bg-[#111113]">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1 pl-3">
                            <svg className="w-3 h-3 text-[#3A3A42] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {sub.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={sub.imageUrl}
                                alt={sub.title}
                                className="w-[32px] h-[32px] object-cover rounded-[4px] border border-[#26262C]"
                              />
                            ) : (
                              <div className="w-[32px] h-[32px] rounded-[4px] bg-[#1C1C21] border border-[#26262C] flex items-center justify-center">
                                <svg className="w-3 h-3 text-[#3A3A42]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-2">
                          <span className="text-[#B8B8C0] text-[13px] pl-1">{sub.title}</span>
                        </td>
                        <td className="px-5 py-2 text-[#5C5C66] text-[11px] font-mono hidden sm:table-cell">{sub.slug}</td>
                        <td className="px-5 py-2 text-[#5C5C66] text-[12px] text-center">{sub.sortOrder}</td>
                        <td className="px-5 py-2">
                          <StatusBadge active={sub.isActive} />
                        </td>
                        <td className="px-5 py-2 text-right">
                          <Link
                            href={`/admin/loja/categorias/${sub.id}`}
                            className="text-[#CB0A0E] hover:text-[#e01015] text-[12px] transition-colors"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </>
                ))}

                {/* Orphan subcategories (parent deleted) */}
                {orphans.map((orphan) => (
                  <tr key={orphan.id} className="border-b border-[#26262C] hover:bg-[#1C1C21]">
                    <td className="px-3 py-2.5">
                      <div className="w-[40px] h-[40px] rounded-[6px] bg-[#2d1a0a] border border-[#5c3a1e] flex items-center justify-center text-[16px]">
                        ⚠
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[#F4F4F6] text-[14px]">{orphan.title}</span>
                        <span className="bg-amber-900/30 border border-amber-700/40 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-[4px]">
                          pai removido
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-[#5C5C66] text-[12px] font-mono hidden sm:table-cell">{orphan.slug}</td>
                    <td className="px-5 py-2.5 text-[#5C5C66] text-[13px] text-center">{orphan.sortOrder}</td>
                    <td className="px-5 py-2.5"><StatusBadge active={orphan.isActive} /></td>
                    <td className="px-5 py-2.5 text-right">
                      <Link href={`/admin/loja/categorias/${orphan.id}`} className="text-[#CB0A0E] hover:text-[#e01015] text-[12px] transition-colors">
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

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${
      active
        ? "bg-green-900/40 text-green-400 border border-green-800/50"
        : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/50"
    }`}>
      {active ? "Ativa" : "Inativa"}
    </span>
  );
}
