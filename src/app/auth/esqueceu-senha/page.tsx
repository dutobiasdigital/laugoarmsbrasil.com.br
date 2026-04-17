"use client";

import { useState, useTransition, useEffect } from "react";
import { forgotPassword } from "@/actions/auth";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import Link from "next/link";

export default function EsqueceuSenhaPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Detecta quando o callback redireciona aqui por link expirado
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "link_expirado") {
      setError("O link de redefinição expirou. Solicite um novo abaixo.");
    } else if (err) {
      setError("O link de verificação é inválido. Solicite um novo abaixo.");
    }
  }, []);
  const { executeRecaptcha } = useRecaptcha();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Inject reCAPTCHA token (no-op if key not configured)
    const token = await executeRecaptcha("forgot_password");
    fd.set("_recaptchaToken", token);

    startTransition(async () => {
      const result = await forgotPassword({}, fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="hidden lg:flex relative w-[720px] shrink-0 bg-[#0e1520] flex-col p-20 justify-between">
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#ff1f1f]" />

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-[40px] h-[40px] bg-[#ff1f1f] rounded-[3px]" />
          <span className="font-['Barlow_Condensed'] font-bold text-white text-[24px] tracking-[3px]">
            MAGNUM
          </span>
        </div>

        {/* Hero */}
        <div className="flex flex-col gap-5">
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[64px] leading-[68px]">
            Recupere seu<br />acesso agora.
          </h1>
          <p className="text-[#7a9ab5] text-[18px] leading-[28px]">Simples e seguro.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-[32px] h-[32px] bg-[#ff1f1f] rounded-[2px]" />
          <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[22px] tracking-wide">MAGNUM</span>
        </div>

        <div className="w-full max-w-[520px]">
          {sent ? (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="w-[72px] h-[72px] rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center text-[32px]">
                ✓
              </div>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none">
                E-mail enviado!
              </h2>
              <p className="text-[#7a9ab5] text-[15px] max-w-[400px]">
                Verifique sua caixa de entrada e siga o link para redefinir sua senha. O link é válido por 24 horas.
              </p>
              <Link href="/auth/login" className="text-[#ff1f1f] hover:text-[#ff4444] text-[14px] font-semibold transition-colors">
                ← Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-2">
                Recuperar senha
              </h2>
              <p className="text-[#7a9ab5] text-[15px] mb-6">
                Informe o e-mail cadastrado para receber o link de redefinição
              </p>

              {error && (
                <div className="bg-red-950/50 border border-red-800 text-red-300 text-[13px] px-4 py-3 rounded-[6px] mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7a9ab5] text-[13px] font-medium">E-mail cadastrado</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="seu@email.com"
                    className="w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-white/30 rounded-[6px] h-[48px] px-4 text-[15px] focus:outline-none focus:border-[#ff1f1f] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[16px] font-semibold h-[52px] rounded-[6px] transition-colors"
                >
                  {isPending ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>

              {/* Info box */}
              <div className="mt-5 bg-[#141d2c] border border-[#1c2a3e] rounded-[8px] p-4 flex gap-3">
                <span className="text-[#7a9ab5] text-[20px] shrink-0">ℹ</span>
                <p className="text-[#7a9ab5] text-[13px] leading-[20px]">
                  Você receberá um e-mail com o link para redefinir sua senha. O link é válido por 24 horas.
                </p>
              </div>

              <Link
                href="/auth/login"
                className="flex items-center gap-1 text-[#7a9ab5] hover:text-white text-[14px] mt-6 transition-colors"
              >
                ← Voltar para o login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
