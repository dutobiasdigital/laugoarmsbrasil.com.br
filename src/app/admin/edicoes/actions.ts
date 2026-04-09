"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createEdition(_: unknown, formData: FormData) {
  const title = formData.get("title") as string;
  const slug =
    (formData.get("slug") as string) || toSlug(title);
  const number = formData.get("number") ? Number(formData.get("number")) : null;
  const type = (formData.get("type") as string) || "REGULAR";
  const editorial = (formData.get("editorial") as string) || null;
  const pageCount = formData.get("pageCount") ? Number(formData.get("pageCount")) : null;
  const coverImageUrl = (formData.get("coverImageUrl") as string) || null;
  const pdfStoragePath = (formData.get("pdfStoragePath") as string) || null;
  const isPublished = formData.get("isPublished") === "on";
  const publishedAt = formData.get("publishedAt")
    ? new Date(formData.get("publishedAt") as string)
    : null;

  try {
    await prisma.edition.create({
      data: {
        title,
        slug,
        number,
        type: type as "REGULAR" | "SPECIAL",
        editorial,
        pageCount,
        coverImageUrl,
        pdfStoragePath,
        isPublished,
        publishedAt,
      },
    });
    revalidatePath("/admin/edicoes");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao criar edição." };
  }
}

export async function updateEdition(_: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const number = formData.get("number") ? Number(formData.get("number")) : null;
  const type = (formData.get("type") as string) || "REGULAR";
  const editorial = (formData.get("editorial") as string) || null;
  const pageCount = formData.get("pageCount") ? Number(formData.get("pageCount")) : null;
  const coverImageUrl = (formData.get("coverImageUrl") as string) || null;
  const pdfStoragePath = (formData.get("pdfStoragePath") as string) || null;
  const isPublished = formData.get("isPublished") === "on";
  const publishedAt = formData.get("publishedAt")
    ? new Date(formData.get("publishedAt") as string)
    : null;

  try {
    await prisma.edition.update({
      where: { id },
      data: {
        title,
        slug,
        number,
        type: type as "REGULAR" | "SPECIAL",
        editorial,
        pageCount,
        coverImageUrl,
        pdfStoragePath,
        isPublished,
        publishedAt,
      },
    });
    revalidatePath("/admin/edicoes");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao atualizar edição." };
  }
}

export async function deleteEdition(id: string) {
  try {
    await prisma.edition.delete({ where: { id } });
    revalidatePath("/admin/edicoes");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao excluir edição." };
  }
}
