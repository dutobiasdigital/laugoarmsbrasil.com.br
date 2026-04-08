"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 flex-col items-center justify-center p-12 border-r border-zinc-800">
        <div className="max-w-md text-center">
          <div className="text-4xl font-bold tracking-widest text-white mb-2 font-['Barlow_Condensed']">
            REVISTA MAGNUM
          </div>
          <div className="text-xs text-zinc-500 tracking-[0.3em] uppercase mb-12">
            O MUNDO DAS ARMAS EM SUAS MÃOS
          </div>
          <div className="w-16 h-0.5 bg-[#ff1f1f] mx-auto mb-8" />
          <p className="text-zinc-400 text-sm leading-relaxed">
            Acesse o maior acervo de publicações especializadas em armas,
            munições e legislação do Brasil.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <div className="text-2xl font-bold tracking-widest text-white font-['Barlow_Condensed']">
              REVISTA MAGNUM
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-1">
            Bem-vindo de volta
          </h1>
          <p className="text-zinc-400 text-sm mb-8">
            Entre na sua conta para acessar o acervo completo
          </p>

          {state?.error && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded mb-4">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="seu@email.com"
                className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff1f1f] focus:ring-1 focus:ring-[#ff1f1f]/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff1f1f] focus:ring-1 focus:ring-[#ff1f1f]/30 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/auth/esqueci-senha"
                className="text-sm text-zinc-400 hover:text-[#ff1f1f] transition-colors"
              >
                Esqueci a senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded text-sm transition-colors"
            >
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Não tem conta?{" "}
            <Link
              href="/auth/cadastro"
              className="text-[#ff1f1f] hover:text-[#ff4444] transition-colors font-medium"
            >
              Assine agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
