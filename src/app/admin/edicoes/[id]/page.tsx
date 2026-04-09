import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import EditionEditForm from "./_EditionEditForm";

export const dynamic = "force-dynamic";

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
    pageCount: number | null;
    coverImageUrl: string | null;
    pdfStoragePath: string | null;
    isPublished: boolean;
    publishedAt: Date | null;
  } | null = null;

  try {
    edition = await prisma.edition.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        number: true,
        type: true,
        editorial: true,
        pageCount: true,
        coverImageUrl: true,
        pdfStoragePath: true,
        isPublished: true,
        publishedAt: true,
      },
    });
  } catch {
    // DB unavailable
  }

  if (!edition) notFound();

  // Serialize dates for client component
  const serialized = {
    ...edition,
    publishedAt: edition.publishedAt?.toISOString().slice(0, 10) ?? null,
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/edicoes"
          className="text-[#a1a1aa] hover:text-white text-[14px] transition-colors"
        >
          ← Edições
        </Link>
        <span className="text-[#27272a]">/</span>
        <span className="text-[#d4d4da] text-[14px] truncate max-w-[300px]">
          {edition.title}
        </span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Editar Edição
      </h1>
      <p className="text-[#a1a1aa] text-[14px] mb-6">
        {edition.number ? `Edição Nº ${edition.number}` : edition.title}
      </p>
      <div className="bg-[#27272a] h-px mb-6" />

      <EditionEditForm edition={serialized} />
    </>
  );
}
