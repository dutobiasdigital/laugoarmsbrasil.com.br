"use server";

import { revalidatePath } from "next/cache";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

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
  const authorName = (formData.get("authorName") as string) || "Redação Laúgo";
  const featureImageUrl = (formData.get("featureImageUrl") as string) || null;
  const categoryId = formData.get("categoryId") as string;
  const isExclusive = formData.get("isExclusive") === "on";
  const status = (formData.get("status") as string) || "DRAFT";
  const publishedAt =
    formData.get("publishedAt") && status === "PUBLISHED"
      ? (formData.get("publishedAt") as string)
      : status === "PUBLISHED"
      ? new Date().toISOString()
      : null;

  try {
    const res = await fetch(`${BASE}/articles`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        authorName,
        featureImageUrl,
        categoryId,
        isExclusive,
        status,
        publishedAt,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Erro ao criar artigo.");
    }

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
  const authorName = (formData.get("authorName") as string) || "Redação Laúgo";
  const featureImageUrl = (formData.get("featureImageUrl") as string) || null;
  const categoryId = formData.get("categoryId") as string;
  const isExclusive = formData.get("isExclusive") === "on";
  const status = (formData.get("status") as string) || "DRAFT";
  const publishedAt =
    formData.get("publishedAt") && status === "PUBLISHED"
      ? (formData.get("publishedAt") as string)
      : status === "PUBLISHED"
      ? new Date().toISOString()
      : null;

  try {
    const res = await fetch(`${BASE}/articles?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        authorName,
        featureImageUrl,
        categoryId,
        isExclusive,
        status,
        publishedAt,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Erro ao atualizar artigo.");
    }

    revalidatePath("/admin/artigos");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao atualizar artigo." };
  }
}

export async function deleteArticle(id: string) {
  try {
    const res = await fetch(`${BASE}/articles?id=eq.${id}`, {
      method: "DELETE",
      headers: HEADERS,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Erro ao excluir artigo.");
    }

    revalidatePath("/admin/artigos");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao excluir artigo." };
  }
}
