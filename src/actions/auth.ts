"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { verifyRecaptcha } from "@/lib/recaptcha";

export type AuthState = {
  error?: string;
  success?: boolean;
  message?: string;
};

/**
 * Called client-side (as a server action) before Supabase login
 * to validate the reCAPTCHA token without exposing the secret key.
 */
export async function verifyLoginCaptcha(token: string): Promise<boolean> {
  return verifyRecaptcha(token, "login");
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message };
    }

    // Return success so the client can navigate after the cookie is set
    return { success: true };
  } catch {
    return { error: "Erro de conexão. Verifique sua internet e tente novamente." };
  }
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  // reCAPTCHA verification (graceful: passes if key not configured)
  const captchaToken = (formData.get("_recaptchaToken") as string) ?? "";
  const captchaOk = await verifyRecaptcha(captchaToken, "signup");
  if (!captchaOk) {
    return { error: "Verificação de segurança falhou. Tente novamente." };
  }

  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Verifique seu e-mail para confirmar o cadastro." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  // reCAPTCHA verification (graceful: passes if key not configured)
  const captchaToken = (formData.get("_recaptchaToken") as string) ?? "";
  const captchaOk = await verifyRecaptcha(captchaToken, "forgot_password");
  if (!captchaOk) {
    return { error: "Verificação de segurança falhou. Tente novamente." };
  }

  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/nova-senha`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "E-mail de recuperação enviado. Verifique sua caixa de entrada." };
}

export async function updatePassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/minha-conta");
}
