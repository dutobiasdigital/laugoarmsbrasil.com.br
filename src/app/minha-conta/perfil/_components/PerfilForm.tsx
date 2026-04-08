"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/profile";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

export default function PerfilForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, {});

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">
        Dados pessoais
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
            Nome completo
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={profile.name}
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff1f1f] focus:ring-1 focus:ring-[#ff1f1f]/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-500 rounded px-4 py-2.5 text-sm cursor-not-allowed"
          />
          <p className="text-xs text-zinc-600 mt-1">O e-mail não pode ser alterado.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Telefone <span className="text-zinc-500 font-normal">(opcional)</span>
          </label>
          <input
            type="tel"
            name="phone"
            defaultValue={profile.phone ?? ""}
            placeholder="(11) 99999-9999"
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff1f1f] focus:ring-1 focus:ring-[#ff1f1f]/30 transition-colors"
          />
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={pending}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded text-sm transition-colors"
          >
            {pending ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
