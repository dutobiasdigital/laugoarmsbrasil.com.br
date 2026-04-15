"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { verifyLoginCaptcha } from "@/actions/auth";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { executeRecaptcha, enabled: captchaEnabled } = useRecaptcha();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    // reCAPTCHA verification (skipped gracefully when key not configured)
    if (captchaEnabled) {
      const token = await executeRecaptcha("login");
      const ok = await verifyLoginCaptcha(token);
      if (!ok) {
        setError("Verificação de segurança falhou. Tente novamente.");
        setPending(false);
        return;
      }
    }

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.push("/minha-conta");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col lg:flex-row">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex relative w-[720px] shrink-0 bg-[#0e1520] flex-col p-20 justify-between">
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#ff1f1f]" />
        <div className="flex items-center gap-2">
          <div className="w-[40px] h-[40px] bg-[#ff1f1f] rounded-[3px]" />
          <span className="font-['Barlow_Condensed'] font-bold text-white text-[24px] tracking-[3px]">
            MAGNUM
          </span>
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[64px] leading-[68px]">
            Sua revista de<br />armas favorita.
          </h1>
          <p className="text-[#d4d4da] text-[18px] leading-[28px] max-w-[520px]">
            O maior acervo especializado em armas, munições e legislação do Brasil. Acesse 207 edições a qualquer hora.
          </p>
          <div className="flex gap-12 mt-2">
            <div className="flex flex-col gap-1">
              <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[40px] leading-none">207</span>
              <span className="text-[#7a9ab5] text-[14px]">Edições</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[40px] leading-none">25+</span>
              <span className="text-[#7a9ab5] text-[14px]">Anos</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[40px] leading-none">50k+</span>
              <span className="text-[#7a9ab5] text-[14px]">Leitores</span>
            </div>
          </div>
          <div className="bg-[#1c2a3e] h-px w-[560px]" />
          <p className="text-[#7a9ab5] text-[14px] leading-[22px]">
            "A melhor cobertura de armas e defesa do Brasil"
          </p>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="w-[32px] h-[32px] bg-[#ff1f1f] rounded-[2px]" />
          <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[22px] tracking-wide">MAGNUM</span>
        </div>

        <div className="w-full max-w-[520px]">
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-2">
            Entrar na sua conta
          </h2>
          <p className="text-[#7a9ab5] text-[15px] mb-6">
            Acesse o acervo completo da Revista Magnum
          </p>
          <div className="bg-[#141d2c] h-px mb-6" />

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 text-[13px] px-4 py-3 rounded-[6px] mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#7a9ab5] text-[13px] font-medium">E-mail</label>
              <input
                type="email"
                name="email"
                required
                placeholder="seu@email.com"
                className="w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-[#253750] rounded-[6px] h-[48px] px-4 text-[15px] focus:outline-none focus:border-[#ff1f1f] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[#7a9ab5] text-[13px] font-medium">Senha</label>
                <Link href="/auth/esqueceu-senha" className="text-[#ff1f1f] hover:text-[#ff4444] text-[13px] transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-[#253750] rounded-[6px] h-[48px] px-4 text-[15px] focus:outline-none focus:border-[#ff1f1f] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[16px] font-semibold h-[52px] rounded-[6px] transition-colors mt-1"
            >
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="flex items-center gap-1 mt-6 justify-center">
            <span className="text-[#7a9ab5] text-[14px]">Ainda não tem conta?</span>
            <Link href="/auth/cadastro" className="text-[#ff1f1f] hover:text-[#ff4444] text-[14px] font-semibold transition-colors">
              {" "}Criar conta grátis →
            </Link>
          </div>

          <p className="text-[#253750] text-[12px] text-center mt-4">
            🔒 Conexão segura · Dados protegidos com criptografia
          </p>
        </div>
      </div>
    </div>
  );
}
