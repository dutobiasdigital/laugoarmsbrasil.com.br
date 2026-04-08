"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!name || name.length < 2) {
    return { error: "Nome deve ter pelo menos 2 caracteres." };
  }

  try {
    await prisma.user.update({
      where: { authId: user.id },
      data: { name, phone },
    });

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  if (password !== confirm) {
    return { error: "As senhas não coincidem." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Senha atualizada com sucesso." };
}
