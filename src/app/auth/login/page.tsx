"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { verifyLoginCaptcha } from "@/actions/auth";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import Link from "next/link";

export default function LoginPage() {
  const [error, setPending_error]        = useState<string | null>(null);
  const [pending, setPending]            = useState(false);
  const [showPass, setShowPass]          = useState(false);
  const { executeRecaptcha, enabled: captchaEnabled } = useRecaptcha();

  function setError(e: string | null) { setPending_error(e); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form         = e.currentTarget;
    const email        = (form.elements.namedItem("email")          as HTMLInputElement).value;
    const password     = (form.elements.namedItem("password")       as HTMLInputElement).value;
    const keepConnected= (form.elements.namedItem("keepConnected")  as HTMLInputElement)?.checked !== false;

    try {
      // reCAPTCHA verification (skipped gracefully when key not configured)
      if (captchaEnabled) {
        const token = await executeRecaptcha("login");
        const ok    = await verifyLoginCaptcha(token);
        if (!ok) {
          setError("Verificação de segurança falhou. Tente novamente.");
          setPending(false);
          return;
        }
      }

      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        const msg = authError.message.includes("Invalid login credentials")
          ? "E-mail ou senha incorretos."
          : authError.message.includes("Email not confirmed")
          ? "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada."
          : authError.message;
        setError(msg);
        setPending(false);
        return;
      }

      // Se "Manter conectado" NÃO estiver marcado, assinar saída ao fechar o browser
      if (!keepConnected) {
        sessionStorage.setItem("magnum_session_only", "1");
        const supabaseRef = supabase;
        window.addEventListener(
          "pagehide",
          () => { supabaseRef.auth.signOut({ scope: "local" }); },
          { once: true }
        );
      } else {
        sessionStorage.removeItem("magnum_session_only");
      }

      // Hard redirect: garante que os cookies de sessão são lidos pelo servidor
      window.location.assign("/minha-conta");
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
      setPending(false);
    }
  }

  const inputCls = "w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-white/30 rounded-[6px] h-[52px] px-4 text-[15px] focus:outline-none focus:border-[#ff1f1f] transition-colors";

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col lg:flex-row">

      {/* Left panel — Branding */}
      <div className="hidden lg:flex relative w-[720px] shrink-0 bg-[#0e1520] flex-col p-20 justify-between">
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#ff1f1f]" />
        <div className="flex items-center gap-2">
          <div className="w-[40px] h-[40px] bg-[#ff1f1f] rounded-[3px]" />
          <span className="font-['Barlow_Condensed'] font-bold text-white text-[24px] tracking-[3px]">MAGNUM</span>
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[64px] leading-[68px]">
            Sua revista de<br />armas favorita.
          </h1>
          <p className="text-[#d4d4da] text-[18px] leading-[28px] max-w-[520px]">
            O maior acervo especializado em armas, munições e legislação do Brasil. Acesse 207 edições a qualquer hora.
          </p>
          <div className="flex gap-12 mt-2">
            {[["207","Edições"],["25+","Anos"],["50k+","Leitores"]].map(([n,l])=>(
              <div key={l} className="flex flex-col gap-1">
                <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[40px] leading-none">{n}</span>
                <span className="text-[#7a9ab5] text-[14px]">{l}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#1c2a3e] h-px w-[560px]" />
          <p className="text-[#7a9ab5] text-[14px] leading-[22px]">&ldquo;A melhor cobertura de armas e defesa do Brasil&rdquo;</p>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-16">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-[32px] h-[32px] bg-[#ff1f1f] rounded-[2px]" />
          <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[22px] tracking-wide">MAGNUM</span>
        </div>

        <div className="w-full max-w-[480px]">
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-1.5">
            Entrar na sua conta
          </h2>
          <p className="text-[#7a9ab5] text-[15px] mb-6">Acesse o acervo completo da Revista Magnum</p>
          <div className="bg-[#141d2c] h-px mb-6" />

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 text-[13px] px-4 py-3 rounded-[6px] mb-5 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#7a9ab5] text-[13px] font-medium">E-mail</label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className={inputCls}
              />
            </div>

            {/* Senha com olho */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[#7a9ab5] text-[13px] font-medium">Senha</label>
                <Link href="/auth/esqueceu-senha" className="text-[#ff1f1f] hover:text-[#ff4444] text-[13px] transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526888] hover:text-[#d4d4da] transition-colors p-1.5"
                  aria-label={showPass ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPass ? (
                    /* Eye-off */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Eye */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Manter conectado */}
            <label className="flex items-center gap-3 cursor-pointer select-none -mt-1">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  name="keepConnected"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-[18px] h-[18px] rounded-[4px] border-2 border-[#1c2a3e] bg-[#141d2c] peer-checked:bg-[#ff1f1f] peer-checked:border-[#ff1f1f] transition-all" />
                <svg
                  className="absolute inset-0 m-auto w-[10px] h-[10px] text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-[#d4d4da] text-[14px]">Manter conectado</span>
            </label>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[16px] font-semibold h-[52px] rounded-[6px] transition-colors mt-1 flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : "Entrar"}
            </button>
          </form>

          <div className="flex items-center gap-1 mt-6 justify-center">
            <span className="text-[#7a9ab5] text-[14px]">Ainda não tem conta?</span>
            <Link href="/auth/cadastro" className="text-[#ff1f1f] hover:text-[#ff4444] text-[14px] font-semibold transition-colors">
              {" "}Criar conta grátis →
            </Link>
          </div>

          <p className="text-[#526888] text-[12px] text-center mt-4">
            🔒 Conexão segura · Dados protegidos com criptografia
          </p>
        </div>
      </div>
    </div>
  );
}
