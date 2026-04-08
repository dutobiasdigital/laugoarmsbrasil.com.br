import { forgotPassword } from "@/actions/auth";
import Link from "next/link";

export default function EsqueciSenhaPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold tracking-widest text-white mb-1 font-['Barlow_Condensed']">
            REVISTA MAGNUM
          </div>
          <div className="text-xs text-zinc-500 tracking-[0.2em] uppercase">
            Recuperar senha
          </div>
        </div>

        <p className="text-zinc-400 text-sm mb-6 text-center">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        <form action={forgotPassword} className="space-y-4">
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

          <button
            type="submit"
            className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] text-white font-semibold py-2.5 px-6 rounded text-sm transition-colors"
          >
            Enviar link de recuperação
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          <Link
            href="/auth/login"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
