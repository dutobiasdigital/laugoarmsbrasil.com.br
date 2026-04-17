import { notFound } from "next/navigation";
import Link from "next/link";
import PagesManager from "./_PagesManager";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

export default async function PaginasEdicaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let edition: {
    id: string;
    title: string;
    slug: string;
    number: number | null;
    type: string;
    editorialPageFiles: string[] | null;
    indexPageFiles: string[] | null;
  } | null = null;

  try {
    const res = await fetch(
      `${BASE}/editions?id=eq.${id}&select=id,title,slug,number,type,editorialPageFiles,indexPageFiles&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    edition = Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch { /* DB indisponível */ }

  if (!edition) notFound();

  // Busca páginas no Storage e gera signed URLs
  let initialPages: { name: string; size: number; signedUrl: string }[] = [];
  try {
    const admin = createAdminClient();
    const { data: files } = await admin.storage
      .from("edition-pages")
      .list(edition.slug, { limit: 500, sortBy: { column: "name", order: "asc" } });

    const rawPages = (files ?? []).filter((f) => f.name && f.id);

    if (rawPages.length > 0) {
      const paths = rawPages.map((f) => `${edition!.slug}/${f.name}`);
      const { data: signed } = await admin.storage
        .from("edition-pages")
        .createSignedUrls(paths, 3600);

      const signedMap: Record<string, string> = {};
      (signed ?? []).forEach((s) => {
        const filename = (s.path ?? "").split("/").pop() ?? "";
        if (s.signedUrl) signedMap[filename] = s.signedUrl;
      });

      initialPages = rawPages.map((f) => ({
        name: f.name,
        size: f.metadata?.size ?? 0,
        signedUrl: signedMap[f.name] ?? "",
      }));
    }
  } catch { /* bucket pode não existir ainda */ }

  const edLabel =
    edition.type === "SPECIAL"
      ? edition.title
      : edition.number
        ? `Edição Nº ${edition.number}`
        : edition.title;

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Link href="/admin/edicoes" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          ← Edições
        </Link>
        <span className="text-[#2a3a4e]">/</span>
        <Link href={`/admin/edicoes/${id}`} className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          {edLabel}
        </Link>
        <span className="text-[#2a3a4e]">/</span>
        <span className="text-white text-[14px]">Páginas do Leitor</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
            Páginas do Leitor
          </h1>
          <p className="text-[#526888] text-[13px] mt-2">
            {edLabel} — <span className="font-mono text-[#3a4a5e]">{edition.slug}</span>
          </p>
        </div>
        {initialPages.length > 0 && (
          <a
            href={`/ler/${edition.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#141d2c] border border-[#1c2a3e] hover:border-[#2a3a5e] text-[#7a9ab5] hover:text-white text-[13px] h-[38px] px-4 rounded-[6px] transition-colors whitespace-nowrap"
          >
            📖 Abrir leitor
          </a>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl bg-[#0a0e18] border border-[#141d2c] p-4 mb-6 flex gap-3">
        <span className="text-xl shrink-0 mt-0.5">ℹ️</span>
        <div className="text-[#7a9ab5] text-[13px] leading-[22px]">
          <strong className="text-white">Como funciona:</strong> Clique em qualquer página para
          ampliar, excluir ou marcá-la como{" "}
          <strong className="text-[#ff6b6b]">Página Editorial</strong> ou{" "}
          <strong className="text-[#38bdf8]">Página Índice</strong>. Você pode marcar
          <strong className="text-white"> múltiplas páginas</strong> de cada tipo — ideal para
          editoriais e índices com mais de uma página.
        </div>
      </div>

      <PagesManager
        slug={edition.slug}
        editionId={edition.id}
        initialPages={initialPages}
        initialEditorialPages={edition.editorialPageFiles ?? []}
        initialIndexPages={edition.indexPageFiles ?? []}
      />
    </>
  );
}
