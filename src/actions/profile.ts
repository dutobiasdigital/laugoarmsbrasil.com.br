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

/* ── Atualização completa do perfil ──────────────────────────── */
export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const name     = (formData.get("name") as string)?.trim();
  const phone    = (formData.get("phone") as string)?.trim() || null;
  const cpf      = (formData.get("cpf") as string)?.trim() || null;
  const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || null;
  const newEmail = (formData.get("newEmail") as string)?.trim() || null;

  // Endereço
  const addressStreet       = (formData.get("addressStreet") as string)?.trim() || null;
  const addressNumber       = (formData.get("addressNumber") as string)?.trim() || null;
  const addressComplement   = (formData.get("addressComplement") as string)?.trim() || null;
  const addressNeighborhood = (formData.get("addressNeighborhood") as string)?.trim() || null;
  const addressCity         = (formData.get("addressCity") as string)?.trim() || null;
  const addressState        = (formData.get("addressState") as string)?.trim() || null;
  const addressZip          = (formData.get("addressZip") as string)?.trim() || null;

  // Redes sociais
  const socialInstagram = (formData.get("socialInstagram") as string)?.trim() || null;
  const socialFacebook  = (formData.get("socialFacebook") as string)?.trim() || null;
  const socialYoutube   = (formData.get("socialYoutube") as string)?.trim() || null;
  const socialTiktok    = (formData.get("socialTiktok") as string)?.trim() || null;

  if (!name || name.length < 2) {
    return { error: "Nome deve ter pelo menos 2 caracteres." };
  }

  try {
    const res = await fetch(`${BASE}/users?authId=eq.${user.id}`, {
      method:  "PATCH",
      headers: HEADERS,
      body: JSON.stringify({
        name, phone, cpf, avatarUrl,
        addressStreet, addressNumber, addressComplement, addressNeighborhood,
        addressCity, addressState, addressZip,
        socialInstagram, socialFacebook, socialYoutube, socialTiktok,
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err?.message ?? "Erro ao atualizar perfil." };
    }

    // Atualiza metadata no Supabase Auth
    await supabase.auth.updateUser({ data: { full_name: name } });

    // Solicita troca de e-mail (double opt-in)
    if (newEmail && newEmail !== user.email) {
      const { error: emailErr } = await supabase.auth.updateUser({ email: newEmail });
      if (emailErr) {
        return { error: `Perfil salvo, mas erro ao trocar e-mail: ${emailErr.message}` };
      }
      revalidatePath("/minha-conta");
      return {
        success: true,
        message: "Perfil salvo! Verifique sua caixa de entrada — enviamos confirmações para o e-mail atual e para o novo.",
      };
    }

    revalidatePath("/minha-conta");
    return { success: true, message: "Perfil atualizado com sucesso." };
  } catch {
    return { error: "Erro ao atualizar perfil. Tente novamente." };
  }
}

/* ── Alteração de senha (usuário logado) ─────────────────────── */
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

  return { success: true, message: "Senha alterada com sucesso." };
}

/* ── Solicitar redefinição de senha por e-mail ───────────────── */
export async function requestPasswordReset(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "E-mail não encontrado." };

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { sendPasswordResetEmail } = await import("@/lib/email");

    const admin  = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://laugoarmsbrasil.com.br";

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${appUrl}/auth/callback?next=/auth/nova-senha` },
    });

    if (!error && data?.properties?.action_link) {
      await sendPasswordResetEmail({
        email,
        resetLink: data.properties.action_link,
        name: data.user?.user_metadata?.full_name as string | undefined,
      });
    }
  } catch (err) {
    console.error("[requestPasswordReset]", err);
  }

  return {
    success: true,
    message: "Se este e-mail estiver cadastrado, você receberá o link em breve. Verifique sua caixa de entrada.",
  };
}
