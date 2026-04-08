import { signup } from "@/actions/auth";
import Link from "next/link";

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold tracking-widest text-white mb-1 font-['Barlow_Condensed']">
            REVISTA MAGNUM
          </div>
          <div className="text-xs text-zinc-500 tracking-[0.2em] uppercase">
            Criar conta
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === 1
                    ? "bg-[#ff1f1f] text-white"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {step}
              </div>
              {step < 3 && <div className="w-8 h-px bg-zinc-700" />}
            </div>
          ))}
        </div>

        <form action={signup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="João da Silva"
              className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff1f1f] focus:ring-1 focus:ring-[#ff1f1f]/30 transition-colors"
            />
          </div>

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
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff1f1f] focus:ring-1 focus:ring-[#ff1f1f]/30 transition-colors"
            />
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-0.5 accent-[#ff1f1f]"
            />
            <label htmlFor="terms" className="text-xs text-zinc-400 leading-relaxed">
              Concordo com os{" "}
              <Link href="/termos" className="text-[#ff1f1f] hover:underline">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="text-[#ff1f1f] hover:underline">
                Política de Privacidade
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] text-white font-semibold py-2.5 px-6 rounded text-sm transition-colors mt-2"
          >
            Criar conta
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Já tem conta?{" "}
          <Link
            href="/auth/login"
            className="text-[#ff1f1f] hover:text-[#ff4444] transition-colors font-medium"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
