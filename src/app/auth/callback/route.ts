import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code        = searchParams.get("code");
  const next        = searchParams.get("next") ?? "/minha-conta";
  const errorParam  = searchParams.get("error");

  // Erro explícito vindo do Supabase (ex: link expirado)
  if (errorParam) {
    return NextResponse.redirect(`${origin}/auth/esqueceu-senha?error=${encodeURIComponent(errorParam)}`);
  }

  if (code) {
    // PKCE flow — troca o código pela sessão
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Código inválido/expirado
    if (next.includes("nova-senha")) {
      return NextResponse.redirect(`${origin}/auth/esqueceu-senha?error=link_expirado`);
    }
    return NextResponse.redirect(`${origin}/auth/login?error=callback`);
  }

  // Sem code: fluxo implícito (token no hash #access_token=...)
  // Hash não chega ao servidor — redireciona para a página de destino
  // e deixa o JS client-side extrair o token do hash.
  if (next.includes("nova-senha")) {
    return NextResponse.redirect(`${origin}/auth/nova-senha`);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback`);
}
