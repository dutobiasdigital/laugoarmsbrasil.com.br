import Link from "next/link";

export default function WelcomeBanner() {
  return (
    <section className="relative overflow-hidden min-h-[600px] lg:min-h-[700px] flex items-center">

      {/* ── Fundo escuro base ─────────────────────────────────── */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(150deg, #06080f 0%, #0c0f1a 25%, #080b14 55%, #060810 100%)" }} />

      {/* ── Glow vermelho principal — centro-esquerda ─────────── */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-20 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,31,31,0.16) 0%, rgba(200,0,0,0.07) 35%, transparent 68%)" }} />

      {/* ── Glow vermelho secundário — inferior esquerda ──────── */}
      <div className="absolute bottom-0 left-0 w-[450px] h-[350px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 100%, rgba(160,0,0,0.10) 0%, transparent 65%)" }} />

      {/* ── Forma escultórica — superior direita (3D blob) ───── */}
      <div className="absolute top-0 right-0 w-[55%] h-[110%] pointer-events-none overflow-hidden">
        {/* Blob 1 — principal */}
        <div className="absolute -top-[10%] right-[-5%] w-[480px] h-[520px]"
          style={{
            background: "radial-gradient(ellipse at 45% 40%, #131a28 0%, #0a0e18 45%, transparent 72%)",
            borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%",
            filter: "blur(2px)",
            transform: "rotate(-15deg) scale(1.2)",
          }} />
        {/* Blob 2 — sombra interna */}
        <div className="absolute top-[5%] right-[2%] w-[360px] h-[380px]"
          style={{
            background: "radial-gradient(ellipse at 50% 45%, #0d1320 0%, #080c14 50%, transparent 75%)",
            borderRadius: "40% 60% 65% 35% / 50% 60% 40% 50%",
            filter: "blur(6px)",
            transform: "rotate(8deg)",
          }} />
        {/* Reflexo claro no topo do blob */}
        <div className="absolute top-[3%] right-[12%] w-[180px] h-[80px]"
          style={{
            background: "radial-gradient(ellipse, rgba(30,42,65,0.5) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(12px)",
            transform: "rotate(-20deg)",
          }} />
      </div>

      {/* ── Streak de luz — inferior esquerda ────────────────── */}
      <div className="absolute bottom-[10%] left-[8%] w-[280px] h-[2px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(122,154,181,0.15), transparent)", filter: "blur(1px)", transform: "rotate(-8deg)" }} />
      <div className="absolute bottom-[13%] left-[5%] w-[180px] h-[1px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,31,31,0.12), transparent)", filter: "blur(1px)", transform: "rotate(-8deg)" }} />

      {/* ── Grade decorativa ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#7a9ab5 0,transparent 1px,transparent 64px),repeating-linear-gradient(90deg,#7a9ab5 0,transparent 1px,transparent 64px)" }} />

      {/* ── Linha vermelha vertical ───────────────────────────── */}
      <div className="hidden lg:block absolute left-[calc(5rem-1px)] top-[18%] bottom-[18%] w-[2px] rounded-full pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent, rgba(255,31,31,0.55) 20%, rgba(255,31,31,0.55) 80%, transparent)" }} />

      {/* ── Conteúdo ──────────────────────────────────────────── */}
      <div className="relative z-10 w-full px-5 lg:px-20 py-16 lg:py-20">
        <div className="max-w-[800px]">

          {/* Label */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-bold tracking-[2.5px] uppercase">
              Fundada em 1986 &nbsp;·&nbsp; Lançamento Digital
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-['Barlow_Condensed'] font-extrabold leading-[0.90] mb-7 select-none">
            <span className="block text-white" style={{ fontSize: "clamp(72px, 11vw, 130px)" }}>
              40 Anos.
            </span>
            <span className="block text-white" style={{ fontSize: "clamp(72px, 11vw, 130px)" }}>
              Uma Só
            </span>
            <span className="block text-[#ff1f1f]" style={{ fontSize: "clamp(72px, 11vw, 130px)" }}>
              — Fonte.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-[#7a9ab5] text-[16px] lg:text-[18px] leading-relaxed max-w-[500px] mb-9">
            Para quem leva armas a sério.<br />
            Desde antes de qualquer portal existir.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap mb-10">
            <Link
              href="/edicoes"
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-bold px-8 py-3.5 rounded transition-colors"
            >
              Ver as 207 Edições →
            </Link>
            <Link
              href="/assine"
              className="text-[#7a9ab5] hover:text-white text-[14px] font-semibold px-7 py-3.5 rounded transition-all"
              style={{ border: "1px solid rgba(28,42,62,0.9)", background: "rgba(255,255,255,0.02)" }}
            >
              Ver planos de assinatura
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-0 flex-wrap">
            {[
              { value: "207",    label: "Edições\nno acervo"         },
              { value: "40",     label: "Anos de\nhistória"           },
              { value: "145+62", label: "Regulares\n+ Especiais"      },
              { value: "1986",   label: "Fundada\nem São Paulo"       },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 first:pl-0"
                style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(20,29,44,0.9)" }}
              >
                <span className="font-['Barlow_Condensed'] font-extrabold text-white leading-none"
                  style={{ fontSize: "clamp(26px, 3.5vw, 38px)" }}>
                  {stat.value}
                </span>
                <span className="text-[#526888] text-[11px] leading-snug whitespace-pre-line">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hashtag rodapé ────────────────────────────────────── */}
      <div className="absolute bottom-5 right-6 lg:right-20 z-10">
        <span className="text-[#1c2a3e] text-[12px] font-semibold tracking-[1.5px] uppercase">
          #RevistaMagnum
        </span>
      </div>
    </section>
  );
}
