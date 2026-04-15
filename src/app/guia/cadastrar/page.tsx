import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuiaCadastrarForm from "./GuiaCadastrarForm";

export const metadata: Metadata = {
  title: "Cadastrar Empresa — Guia Comercial Magnum",
  description: "Cadastre sua empresa no maior diretório especializado do setor de armas, tiro esportivo e defesa do Brasil.",
};

export default function CadastrarPage() {
  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">

        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 py-4 border-b border-[#141d2c] bg-[#0a0e18] flex items-center gap-2 text-[13px]">
          <Link href="/guia" className="text-[#526888] hover:text-white transition-colors">Guia Comercial</Link>
          <span className="text-[#253750]">/</span>
          <span className="text-[#d4d4da]">Cadastrar empresa</span>
        </div>

        {/* Header */}
        <section className="px-5 lg:px-20 pt-10 pb-10 bg-[#0a0e18] border-b border-[#141d2c]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Guia Comercial</span>
          </div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[52px] leading-[0.95] mb-4">
            Cadastre sua empresa
          </h1>
          <p className="text-[#7a9ab5] text-[17px] leading-[28px] max-w-[520px]">
            Apareça para 45 mil leitores qualificados — atiradores, colecionadores e profissionais do setor.
            O cadastro básico é 100% gratuito.
          </p>
        </section>

        {/* Form + Benefits */}
        <section className="px-5 lg:px-20 py-12">
          <div className="flex flex-col xl:flex-row gap-12 items-start">

            <div className="flex-1">
              <GuiaCadastrarForm />
            </div>

            {/* Benefícios */}
            <div className="xl:w-[320px] shrink-0 flex flex-col gap-4 xl:sticky xl:top-24">
              <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
                <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">Por que cadastrar?</p>
                {[
                  { icon: "👁️", text: "45 mil leitores mensais qualificados" },
                  { icon: "🎯", text: "Público 100% do setor de armas e tiro" },
                  { icon: "🔍", text: "Apareça nas buscas por categoria e estado" },
                  { icon: "📱", text: "Perfil com contatos diretos (tel, WhatsApp, site)" },
                  { icon: "✅", text: "Cadastro gratuito, publicado em até 24h" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[#141d2c] last:border-0">
                    <span className="text-[16px] shrink-0">{item.icon}</span>
                    <p className="text-[#7a9ab5] text-[13px] leading-[18px]">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#0e1520] border border-[#ff1f1f]/20 rounded-[12px] p-5">
                <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">Quer mais destaque?</p>
                <p className="text-[#7a9ab5] text-[13px] leading-[20px] mb-4">
                  Com o plano Premium ou Destaque você aparece no topo, com logo, mapa e badge exclusivo.
                </p>
                <a href="mailto:publicidade@revistamagnum.com.br"
                  className="flex items-center justify-center gap-2 bg-[#ff1f1f]/10 hover:bg-[#ff1f1f]/20 border border-[#ff1f1f]/30 text-[#ff1f1f] text-[13px] font-semibold h-[40px] rounded-[6px] transition-colors">
                  Falar sobre planos pagos →
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
