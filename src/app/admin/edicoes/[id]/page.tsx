import { notFound } from "next/navigation";
import Link from "next/link";
import EditionEditForm from "./_EditionEditForm";

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
  } | null = null;

  try {
    const res = await fetch(
      `${BASE}/editions?id=eq.${id}&select=id,title,slug,number,type,editorial,tableOfContents,pageCount,coverImageUrl,pdfStoragePath,pageFlipUrl,isPublished,isOnNewstand,publishedAt&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    edition = Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    // DB unavailable
  }

  if (!edition) notFound();
  const ed = edition!;

  const serialized = {
    ...ed,
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

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Editar Edição
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">
        {ed.number ? `Edição Nº ${ed.number}` : ed.title}
      </p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <EditionEditForm edition={serialized} />
    </>
  );
}
