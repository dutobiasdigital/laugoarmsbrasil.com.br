"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NovaSenhaPage() {
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending,     setPending]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);
  const [ready,       setReady]       = useState(false);

  /**
   * Supabase pode enviar o recovery token de duas formas:
   * 1. PKCE  → /auth/callback trocou pelo code e já setou a sessão nos cookies
   * 2. Hash  → #access_token=...&type=recovery — precisamos setar a sessão aqui no client
   */
  useEffect(() => {
    const supabase = createClient();

    async function init() {
      // Tenta ler hash da URL (implicit flow)
      const hash   = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken  = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type         = params.get("type");

      if (accessToken && type === "recovery") {
        // Seta a sessão a partir dos tokens do hash
        const { error: sessErr } = await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken ?? "",
        });
        if (sessErr) {
          setError("Link inválido ou expirado. Solicite um novo link de recuperação.");
          setReady(true);
          return;
        }
        // Limpa o hash da URL sem recarregar a página
        window.history.replaceState(null, "", window.location.pathname);
      }

      // Verifica se há sessão ativa (via PKCE ou hash acima)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Sessão expirada ou link inválido. Solicite um novo link de recuperação.");
      }
      setReady(true);
    }

    init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({ password });

      if (updateErr) {
        setError(
          updateErr.message.includes("same password")
            ? "A nova senha não pode ser igual à senha atual."
            : "Erro ao atualizar a senha. Tente novamente."
        );
        return;
      }

      setSuccess(true);
      // Aguarda 2s e redireciona para minha conta
      setTimeout(() => { window.location.assign("/minha-conta"); }, 2000);
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setPending(false);
    }
  }

  const inputCls = "w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-white/30 rounded-[6px] h-[52px] px-4 text-[15px] focus:outline-none focus:border-[#ff1f1f] transition-colors";

  /* Força mínima da senha */
  const strength = !password ? 0
    : password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 4
    : password.length >= 10 && (/[A-Z]/.test(password) || /[0-9]/.test(password)) ? 3
    : password.length >= 8 ? 2
    : 1;

  const strengthLabels = ["", "Fraca", "Razoável", "Boa", "Forte"];
  const strengthColors = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

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
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[56px] leading-[60px]">
            Criar nova<br />senha segura.
          </h1>
          <p className="text-[#d4d4da] text-[17px] leading-[28px] max-w-[480px]">
            Escolha uma senha forte com pelo menos 8 caracteres. Recomendamos misturar letras maiúsculas, números e símbolos.
          </p>
          <div className="flex flex-col gap-3 mt-2">
            {[
              "Mínimo de 8 caracteres",
              "Letras maiúsculas e minúsculas",
              "Pelo menos um número ou símbolo",
            ].map((tip) => (
              <div key={tip} className="flex items-center gap-3">
                <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full shrink-0" />
                <span className="text-[#7a9ab5] text-[14px]">{tip}</span>
              </div>
            ))}
          </div>
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
            Redefinir senha
          </h2>
          <p className="text-[#7a9ab5] text-[15px] mb-6">Digite e confirme sua nova senha de acesso</p>
          <div className="bg-[#141d2c] h-px mb-6" />

          {/* Carregando */}
          {!ready && (
            <div className="flex items-center gap-3 text-[#7a9ab5] text-[14px] py-8 justify-center">
              <span className="w-[18px] h-[18px] border-2 border-[#1c2a3e] border-t-[#ff1f1f] rounded-full animate-spin" />
              Verificando link...
            </div>
          )}

          {/* Sucesso */}
          {success && (
            <div className="bg-green-950/50 border border-green-700 text-green-300 text-[14px] px-4 py-4 rounded-[6px] flex flex-col gap-1">
              <span className="font-semibold">✓ Senha atualizada com sucesso!</span>
              <span className="text-green-400/80 text-[13px]">Redirecionando para sua conta...</span>
            </div>
          )}

          {/* Erro sem formulário (link inválido) */}
          {ready && error && !password && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 text-[13px] px-4 py-4 rounded-[6px] flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
              <a
                href="/auth/esqueceu-senha"
                className="self-start text-[#ff1f1f] hover:text-[#ff4444] text-[13px] font-semibold transition-colors"
              >
                Solicitar novo link →
              </a>
            </div>
          )}

          {/* Formulário */}
          {ready && !success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {error && password && (
                <div className="bg-red-950/50 border border-red-800 text-red-300 text-[13px] px-4 py-3 rounded-[6px] flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Nova senha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#7a9ab5] text-[13px] font-medium">Nova senha</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    className={`${inputCls} pr-12`}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526888] hover:text-[#d4d4da] transition-colors p-1.5"
                    aria-label={showPass ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPass ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Barra de força */}
                {password && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1 flex-1">
                      {[1,2,3,4].map(n => (
                        <div key={n} className={`h-[3px] flex-1 rounded-full transition-colors ${strength >= n ? strengthColors[strength] : "bg-[#1c2a3e]"}`} />
                      ))}
                    </div>
                    <span className={`text-[11px] font-medium ${
                      strength === 1 ? "text-red-400" : strength === 2 ? "text-yellow-400" : strength === 3 ? "text-blue-400" : "text-green-400"
                    }`}>{strengthLabels[strength]}</span>
                  </div>
                )}
              </div>

              {/* Confirmar senha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#7a9ab5] text-[13px] font-medium">Confirmar nova senha</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    className={`${inputCls} pr-12 ${confirm && confirm !== password ? "border-red-700" : confirm && confirm === password ? "border-green-700" : ""}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526888] hover:text-[#d4d4da] transition-colors p-1.5"
                    aria-label={showConfirm ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showConfirm ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <p className="text-red-400 text-[12px]">As senhas não coincidem</p>
                )}
                {confirm && confirm === password && (
                  <p className="text-green-400 text-[12px]">✓ Senhas coincidem</p>
                )}
              </div>

              <button
                type="submit"
                disabled={pending || !ready}
                className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[16px] font-semibold h-[52px] rounded-[6px] transition-colors mt-1 flex items-center justify-center gap-2"
              >
                {pending ? (
                  <>
                    <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : "Salvar nova senha"}
              </button>
            </form>
          )}

          <p className="text-[#526888] text-[12px] text-center mt-6">
            🔒 Conexão segura · Dados protegidos com criptografia
          </p>
        </div>
      </div>
    </div>
  );
}
