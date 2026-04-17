"use client";

import { useActionState, useState } from "react";
import { updatePassword } from "@/actions/profile";
import { requestPasswordReset } from "@/actions/profile";

export default function SenhaForm({ email }: { email: string }) {
  const [state, formAction, pending]           = useActionState(updatePassword, {});
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordReset, {});
  const [tab, setTab] = useState<"change" | "reset">("change");

  const INPUT = "w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-[#526888] rounded-[8px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#ff1f1f] focus:ring-1 focus:ring-[#ff1f1f]/20 transition-colors";
  const LABEL = "block text-[12px] font-semibold text-[#7a9ab5] uppercase tracking-[0.8px] mb-1.5";

  return (
    <section className="bg-[#0e1520] border border-[#141d2c] rounded-[14px] p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2 pb-1 border-b border-[#141d2c]">
        <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
        <h2 className="text-[#dce8ff] text-[16px] font-semibold">Senha</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#141d2c] rounded-[8px] p-1 w-fit gap-1">
        {(["change", "reset"] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-[6px] text-[13px] font-semibold transition-all ${
              tab === t ? "bg-[#0e1520] text-white shadow" : "text-[#526888] hover:text-[#7a9ab5]"
            }`}
          >
            {t === "change" ? "Alterar senha" : "Redefinir por e-mail"}
          </button>
        ))}
      </div>

      {/* ── Alterar senha ── */}
      {tab === "change" && (
        <form action={formAction} className="flex flex-col gap-4">
          {state?.success && (
            <div className="bg-[#0f381f] border border-[#22c55e]/30 text-[#22c55e] text-[14px] px-4 py-3 rounded-[8px]">
              {state.message}
            </div>
          )}
          {state?.error && (
            <div className="bg-[#2d0a0a] border border-[#ff6b6b]/30 text-[#ff6b6b] text-[14px] px-4 py-3 rounded-[8px]">
              {state.error}
            </div>
          )}
          <div>
            <label className={LABEL}>Nova senha</label>
            <input type="password" name="password" required minLength={8} placeholder="Mínimo 8 caracteres" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Confirmar nova senha</label>
            <input type="password" name="confirm" required minLength={8} placeholder="Repita a nova senha" className={INPUT} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white font-semibold h-[44px] px-8 rounded-[8px] text-[14px] transition-colors w-fit flex items-center gap-2"
          >
            {pending ? "Alterando..." : "Alterar senha"}
          </button>
        </form>
      )}

      {/* ── Redefinir por e-mail ── */}
      {tab === "reset" && (
        <form action={resetAction} className="flex flex-col gap-4">
          {resetState?.success ? (
            <div className="bg-[#0f381f] border border-[#22c55e]/30 text-[#22c55e] text-[14px] px-4 py-4 rounded-[8px] flex flex-col gap-1">
              <p className="font-semibold">Link enviado!</p>
              <p className="text-[#22c55e]/80">{resetState.message}</p>
            </div>
          ) : (
            <>
              {resetState?.error && (
                <div className="bg-[#2d0a0a] border border-[#ff6b6b]/30 text-[#ff6b6b] text-[14px] px-4 py-3 rounded-[8px]">
                  {resetState.error}
                </div>
              )}
              <div className="bg-[#141d2c] border border-[#1c2a3e] rounded-[10px] p-4">
                <p className="text-[#7a9ab5] text-[13px] leading-relaxed">
                  Um link de redefinição será enviado para <span className="text-white font-semibold">{email}</span>.
                  Clique no link recebido para criar uma nova senha.
                </p>
              </div>
              <input type="hidden" name="email" value={email} />
              <button
                type="submit"
                disabled={resetPending}
                className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] hover:text-white disabled:opacity-50 font-semibold h-[44px] px-8 rounded-[8px] text-[14px] transition-colors w-fit flex items-center gap-2"
              >
                {resetPending ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </>
          )}
        </form>
      )}
    </section>
  );
}
