import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEdicoesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; pagina?: string }>;
}) {
  const { q, tipo, pagina } = await searchParams;
  const page = Math.max(1, parseInt(pagina ?? "1", 10));
  const PER_PAGE = 12;

  let editions: {
    id: string;
    title: string;
    number: number | null;
    slug: string;
    type: string;
    isPublished: boolean;
    publishedAt: Date | null;
    coverImageUrl: string | null;
  }[] = [];
  let total = 0;

  try {
    const where = {
      ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
      ...(tipo && tipo !== "TODOS" ? { type: tipo as "REGULAR" | "SPECIAL" } : {}),
    };

    [editions, total] = await Promise.all([
      prisma.edition.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        select: {
          id: true,
          title: true,
          number: true,
          slug: true,
          type: true,
          isPublished: true,
          publishedAt: true,
          coverImageUrl: true,
        },
      }),
      prisma.edition.count({ where }),
    ]);
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Edições
          </h1>
          <p className="text-[#a1a1aa] text-[14px]">
            {total.toLocaleString("pt-BR")} edições cadastradas
          </p>
        </div>
        <Link
          href="/admin/edicoes/nova"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors"
        >
          + Nova Edição
        </Link>
      </div>

      <div className="bg-[#27272a] h-px mb-6" />

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="🔍 Buscar por título..."
          className="bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f] w-[260px]"
        />
        <select
          name="tipo"
          defaultValue={tipo ?? "TODOS"}
          className="bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f]"
        >
          <option value="TODOS">Todos os tipos</option>
          <option value="REGULAR">Regular</option>
          <option value="SPECIAL">Especial</option>
        </select>
        <button
          type="submit"
          className="bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[38px] px-4 rounded-[6px] transition-colors"
        >
          Filtrar
        </button>
        {(q || tipo) && (
          <Link
            href="/admin/edicoes"
            className="text-[#a1a1aa] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] overflow-hidden">
        <div className="bg-[#27272a] px-5 py-3 grid grid-cols-7 gap-3">
          {["Nº", "Capa", "Título", "Tipo", "Páginas", "Status", "Ações"].map((h) => (
            <p key={h} className="text-[#52525b] text-[11px] font-semibold tracking-[0.5px]">
              {h}
            </p>
          ))}
        </div>

        {editions.length === 0 ? (
          <p className="text-[#52525b] text-[13px] p-8 text-center">
            Nenhuma edição encontrada.
          </p>
        ) : (
          editions.map((ed, i) => (
            <div key={ed.id}>
              {i > 0 && <div className="bg-[#27272a] h-px" />}
              <div className="px-5 py-3.5 grid grid-cols-7 gap-3 items-center">
                <p className="text-[#ff1f1f] font-['Barlow_Condensed'] font-bold text-[18px]">
                  {ed.number ?? "—"}
                </p>
                <div className="w-[36px] h-[48px] bg-[#27272a] rounded-[2px] overflow-hidden flex items-center justify-center">
                  {ed.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ed.coverImageUrl}
                      alt={ed.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#52525b] text-[10px]">—</span>
                  )}
                </div>
                <p className="text-[#d4d4da] text-[14px] truncate">{ed.title}</p>
                <span
                  className={`inline-flex items-center h-[20px] px-2 rounded-[2px] text-[10px] font-bold ${
                    ed.type === "SPECIAL"
                      ? "bg-[#260a0a] text-[#ff1f1f]"
                      : "bg-[#27272a] text-[#a1a1aa]"
                  }`}
                >
                  {ed.type === "SPECIAL" ? "ESPECIAL" : "REGULAR"}
                </span>
                <p className="text-[#a1a1aa] text-[13px]">
                  {ed.publishedAt
                    ? ed.publishedAt.toLocaleDateString("pt-BR", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                <span
                  className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold ${
                    ed.isPublished
                      ? "bg-[#0f381f] text-[#22c55e]"
                      : "bg-[#27272a] text-[#52525b]"
                  }`}
                >
                  {ed.isPublished ? "PUBLICADA" : "RASCUNHO"}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/edicoes/${ed.id}`}
                    className="text-[#a1a1aa] hover:text-white text-[13px] transition-colors"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/edicoes/${ed.slug}`}
                    target="_blank"
                    className="text-[#52525b] hover:text-[#a1a1aa] text-[13px] transition-colors"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between border-t border-[#27272a]">
            <p className="text-[#52525b] text-[13px]">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de{" "}
              {total.toLocaleString("pt-BR")} edições
            </p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/edicoes?${q ? `q=${encodeURIComponent(q)}&` : ""}${tipo ? `tipo=${tipo}&` : ""}pagina=${p}`}
                  className={`w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors ${
                    p === page
                      ? "bg-[#ff1f1f] text-white"
                      : "bg-[#27272a] border border-[#3f3f46] text-[#a1a1aa] hover:text-white"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
