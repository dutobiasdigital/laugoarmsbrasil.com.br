import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  PUBLISHED: { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "PUBLICADO" },
  DRAFT: { bg: "bg-[#141d2c]", text: "text-[#7a9ab5]", label: "RASCUNHO" },
  ARCHIVED: { bg: "bg-[#141d2c]", text: "text-[#253750]", label: "ARQUIVADO" },
};

export default async function AdminArtigosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; pagina?: string }>;
}) {
  const { q, status, pagina } = await searchParams;
  const page = Math.max(1, parseInt(pagina ?? "1", 10));
  const PER_PAGE = 12;

  let articles: {
    id: string;
    title: string;
    slug: string;
    status: string;
    isExclusive: boolean;
    publishedAt: Date | null;
    authorName: string;
    featureImageUrl: string | null;
    category: { name: string };
  }[] = [];
  let total = 0;

  try {
    const where = {
      ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
      ...(status && status !== "TODOS"
        ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }
        : {}),
    };

    [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          isExclusive: true,
          publishedAt: true,
          authorName: true,
          featureImageUrl: true,
          category: { select: { name: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Artigos
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} artigos cadastrados
          </p>
        </div>
        <Link
          href="/admin/artigos/novo"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors"
        >
          + Novo Artigo
        </Link>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="🔍 Buscar por título..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-[260px]"
        />
        <select
          name="status"
          defaultValue={status ?? "TODOS"}
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f]"
        >
          <option value="TODOS">Todos os status</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="DRAFT">Rascunho</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>
        <button
          type="submit"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[38px] px-4 rounded-[6px] transition-colors"
        >
          Filtrar
        </button>
        {(q || status) && (
          <Link
            href="/admin/artigos"
            className="text-[#7a9ab5] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-6 gap-3">
          {["Imagem", "Título", "Categoria", "Autor", "Status", "Ações"].map((h) => (
            <p key={h} className="text-[#253750] text-[11px] font-semibold tracking-[0.5px]">
              {h}
            </p>
          ))}
        </div>

        {articles.length === 0 ? (
          <p className="text-[#253750] text-[13px] p-8 text-center">
            Nenhum artigo encontrado.
          </p>
        ) : (
          articles.map((art, i) => {
            const st = STATUS_STYLE[art.status] ?? STATUS_STYLE.DRAFT;
            return (
              <div key={art.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div className="px-5 py-3.5 grid grid-cols-6 gap-3 items-center">
                  <div className="w-[52px] h-[36px] bg-[#141d2c] rounded-[2px] overflow-hidden flex items-center justify-center">
                    {art.featureImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={art.featureImageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#253750] text-[10px]">—</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[14px] truncate">{art.title}</p>
                    {art.isExclusive && (
                      <span className="text-[#ff1f1f] text-[10px] font-semibold">EXCLUSIVO</span>
                    )}
                  </div>
                  <span className="bg-[#141d2c] text-[#7a9ab5] text-[11px] px-2 py-[2px] rounded-full">
                    {art.category.name}
                  </span>
                  <p className="text-[#7a9ab5] text-[13px] truncate">{art.authorName}</p>
                  <span
                    className={`inline-flex items-center h-[20px] px-2.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}
                  >
                    {st.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/artigos/${art.id}`}
                      className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors"
                    >
                      Editar
                    </Link>
                    {art.status === "PUBLISHED" && (
                      <Link
                        href={`/blog/${art.slug}`}
                        target="_blank"
                        className="text-[#253750] hover:text-[#7a9ab5] text-[13px] transition-colors"
                      >
                        Ver
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between border-t border-[#141d2c]">
            <p className="text-[#253750] text-[13px]">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de{" "}
              {total.toLocaleString("pt-BR")} artigos
            </p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/artigos?${q ? `q=${encodeURIComponent(q)}&` : ""}${status ? `status=${status}&` : ""}pagina=${p}`}
                  className={`w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors ${
                    p === page
                      ? "bg-[#ff1f1f] text-white"
                      : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
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
