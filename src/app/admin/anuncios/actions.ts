"use server";

import { revalidatePath } from "next/cache";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export async function createAd(_: unknown, formData: FormData) {
  try {
    const res = await fetch(`${BASE}/advertisements`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        name: formData.get("name") as string,
        advertiser: formData.get("advertiser") as string,
        imageUrl: formData.get("imageUrl") as string,
        targetUrl: formData.get("targetUrl") as string,
        position: formData.get("position") as string,
        active: formData.get("active") === "on",
        startsAt: (formData.get("startsAt") as string) || null,
        endsAt: (formData.get("endsAt") as string) || null,
        maxImpressions: formData.get("maxImpressions") ? Number(formData.get("maxImpressions")) : null,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    revalidatePath("/admin/anuncios");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao criar anúncio." };
  }
}

export async function updateAd(_: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  try {
    const res = await fetch(`${BASE}/advertisements?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        name: formData.get("name") as string,
        advertiser: formData.get("advertiser") as string,
        imageUrl: formData.get("imageUrl") as string,
        targetUrl: formData.get("targetUrl") as string,
        position: formData.get("position") as string,
        active: formData.get("active") === "on",
        startsAt: (formData.get("startsAt") as string) || null,
        endsAt: (formData.get("endsAt") as string) || null,
        maxImpressions: formData.get("maxImpressions") ? Number(formData.get("maxImpressions")) : null,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    revalidatePath("/admin/anuncios");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao atualizar anúncio." };
  }
}
