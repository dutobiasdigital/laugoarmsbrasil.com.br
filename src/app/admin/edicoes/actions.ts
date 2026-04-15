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
  const publishedAt = formData.get("publishedAt") ? (formData.get("publishedAt") as string) : null;

  try {
    const res = await fetch(`${BASE}/editions`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({ title, slug, number, type, editorial, pageCount, coverImageUrl, pdfStoragePath, isPublished, publishedAt }),
    });
    if (!res.ok) throw new Error(await res.text());
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
  const publishedAt = formData.get("publishedAt") ? (formData.get("publishedAt") as string) : null;

  try {
    const res = await fetch(`${BASE}/editions?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({ title, slug, number, type, editorial, pageCount, coverImageUrl, pdfStoragePath, isPublished, publishedAt }),
    });
    if (!res.ok) throw new Error(await res.text());
    revalidatePath("/admin/edicoes");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao atualizar edição." };
  }
}

export async function deleteEdition(id: string) {
  try {
    const res = await fetch(`${BASE}/editions?id=eq.${id}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!res.ok) throw new Error(await res.text());
    revalidatePath("/admin/edicoes");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao excluir edição." };
  }
}
