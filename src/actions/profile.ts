"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  "Content-Type":  "application/json",
  "apikey":        SERVICE,
  "Authorization": `Bearer ${SERVICE}`,
  "Prefer":        "return=minimal",
};

export type ProfileState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const name  = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!name || name.length < 2) {
    return { error: "Nome deve ter pelo menos 2 caracteres." };
  }

  try {
    const res = await fetch(
      `${BASE}/users?authId=eq.${user.id}`,
      {
        method:  "PATCH",
        headers: HEADERS,
        body:    JSON.stringify({ name, phone, updatedAt: new Date().toISOString() }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return { error: err?.message ?? "Erro ao atualizar perfil." };
    }

    // Atualiza metadata no Supabase Auth também
    await supabase.auth.updateUser({ data: { full_name: name } });

    revalidatePath("/minha-conta");
    return { success: true, message: "Perfil atualizado com sucesso." };
  } catch {
    return { error: "Erro ao atualizar perfil. Tente novamente." };
  }
}

export async function updatePassword(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const password = formData.get("password") as string;
  const confirm  = formData.get("confirm") as string;

  if (!password || password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As senhas não coincidem." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: true, message: "Senha atualizada com sucesso." };
}
