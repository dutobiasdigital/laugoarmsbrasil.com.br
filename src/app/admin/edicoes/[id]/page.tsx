import { notFound } from "next/navigation";
import Link from "next/link";
import EditionEditForm from "./_EditionEditForm";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export default async function EditarEdicaoPage({
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
    editorial: string | null;
    tableOfContents: string | null;
    pageCount: number | null;
    coverImageUrl: string | null;
    pdfStoragePath: string | null;
    pageFlipUrl: string | null;
    isPublished: boolean;
    isOnNewstand: boolean;
    publishedAt: string | null;
    editorialPageFiles: string[] | null;
    indexPageFiles: string[] | null;
  } | null = null;

  try {
    const res = await fetch(
      `${BASE}/editions?id=eq.${id}&select=id,title,slug,number,type,editorial,tableOfContents,pageCount,coverImageUrl,pdfStoragePath,pageFlipUrl,isPublished,isOnNewstand,publishedAt,editorialPageFiles,indexPageFiles&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    edition = Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch { /* DB unavailable */ }

  if (!edition) notFound();
  const ed = edition!;

  // Gera signed URLs para todas as páginas marcadas
  type MarkedPage = { filename: string; url: string };
  let editorialPageUrls: MarkedPage[] = [];
  let indexPageUrls: MarkedPage[]     = [];

  const allMarked = [
    ...(ed.editorialPageFiles ?? []).map((f) => ({ type: "editorial" as const, f })),
    ...(ed.indexPageFiles     ?? []).map((f) => ({ type: "index"     as const, f })),
  ];

  if (allMarked.length > 0) {
    try {
      const admin  = createAdminClient();
      const unique = [...new Set(allMarked.map((m) => m.f))];
      const paths  = unique.map((f) => `${ed.slug}/${f}`);
      const { data: signed } = await admin.storage
        .from("edition-pages")
        .createSignedUrls(paths, 3600);

      const signedMap: Record<string, string> = {};
      (signed ?? []).forEach((s) => {
        const fn = (s.path ?? "").split("/").pop() ?? "";
        if (s.signedUrl) signedMap[fn] = s.signedUrl;
      });

      editorialPageUrls = (ed.editorialPageFiles ?? []).map((f) => ({ filename: f, url: signedMap[f] ?? "" }));
      indexPageUrls     = (ed.indexPageFiles     ?? []).map((f) => ({ filename: f, url: signedMap[f] ?? "" }));
    } catch { /* Storage indisponível */ }
  }

  const serialized = {
    ...ed,
    editorialPageFiles: ed.editorialPageFiles ?? [],
    indexPageFiles:     ed.indexPageFiles     ?? [],
    publishedAt: ed.publishedAt ? ed.publishedAt.slice(0, 10) : null,
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/edicoes" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          ← Edições
        </Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px] truncate max-w-[300px]">{ed.title}</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Editar Edição
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {ed.number ? `Edição Nº ${ed.number}` : ed.title}
          </p>
        </div>
        <Link
          href={`/admin/edicoes/${id}/paginas`}
          className="flex items-center gap-2 bg-[#141d2c] border border-[#1c2a3e] hover:border-[#2a3a5e] text-[#7a9ab5] hover:text-white text-[13px] h-[38px] px-4 rounded-[6px] transition-colors whitespace-nowrap"
        >
          📄 Páginas do Leitor
        </Link>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />

      <EditionEditForm
        edition={serialized}
        editorialPageUrls={editorialPageUrls}
        indexPageUrls={indexPageUrls}
      />
    </>
  );
}
