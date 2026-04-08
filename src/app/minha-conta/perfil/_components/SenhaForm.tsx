"use client";

import { useActionState } from "react";
import { updatePassword } from "@/actions/profile";

export default function SenhaForm() {
  const [state, formAction, pending] = useActionState(updatePassword, {});

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">
        Alterar senha
      </h2>

      {state?.success && (
        <div className="bg-green-950/50 border border-green-800 text-green-300 text-sm px-4 py-3 rounded mb-4">
          {state.message}
        </div>
      )}
      {state?.error && (
        <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded mb-4">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Nova senha
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff1f1f] focus:ring-1 focus:ring-[#ff1f1f]/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Confirmar nova senha
          </label>
          <input
            type="password"
            name="confirm"
            required
            minLength={8}
            placeholder="Repita a nova senha"
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff1f1f] focus:ring-1 focus:ring-[#ff1f1f]/30 transition-colors"
          />
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={pending}
            className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded text-sm transition-colors"
          >
            {pending ? "Alterando..." : "Alterar senha"}
          </button>
        </div>
      </form>
    </div>
  );
}
