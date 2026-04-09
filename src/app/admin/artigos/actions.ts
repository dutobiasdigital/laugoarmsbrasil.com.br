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

export async function createArticle(_: unknown, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || toSlug(title);
  const excerpt = (formData.get("excerpt") as string) || null;
  const content = (formData.get("content") as string) || "";
  const authorName = (formData.get("authorName") as string) || "Redação Magnum";
  const featureImageUrl = (formData.get("featureImageUrl") as string) || null;
  const categoryId = formData.get("categoryId") as string;
  const isExclusive = formData.get("isExclusive") === "on";
  const status = (formData.get("status") as string) || "DRAFT";
  const publishedAt =
    formData.get("publishedAt") && status === "PUBLISHED"
      ? new Date(formData.get("publishedAt") as string)
      : status === "PUBLISHED"
      ? new Date()
      : null;

  try {
    await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        authorName,
        featureImageUrl,
        categoryId,
        isExclusive,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        publishedAt,
      },
    });
    revalidatePath("/admin/artigos");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao criar artigo." };
  }
}

export async function updateArticle(_: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const excerpt = (formData.get("excerpt") as string) || null;
  const content = (formData.get("content") as string) || "";
  const authorName = (formData.get("authorName") as string) || "Redação Magnum";
  const featureImageUrl = (formData.get("featureImageUrl") as string) || null;
  const categoryId = formData.get("categoryId") as string;
  const isExclusive = formData.get("isExclusive") === "on";
  const status = (formData.get("status") as string) || "DRAFT";
  const publishedAt =
    formData.get("publishedAt")
      ? new Date(formData.get("publishedAt") as string)
      : status === "PUBLISHED"
      ? new Date()
      : null;

  try {
    await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        authorName,
        featureImageUrl,
        categoryId,
        isExclusive,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        publishedAt,
      },
    });
    revalidatePath("/admin/artigos");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao atualizar artigo." };
  }
}

export async function deleteArticle(id: string) {
  try {
    await prisma.article.delete({ where: { id } });
    revalidatePath("/admin/artigos");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao excluir artigo." };
  }
}
