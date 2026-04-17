import Link from "next/link";

export default function WelcomeBanner() {
  return (
    <section className="hero-metal relative overflow-hidden min-h-[580px] lg:min-h-[660px] flex items-center">

      {/* ── Grade decorativa ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#7a9ab5 0,transparent 1px,transparent 64px),repeating-linear-gradient(90deg,#7a9ab5 0,transparent 1px,transparent 64px)" }} />

      {/* ── Glow vermelho — centro esquerda ───────────────────── */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-10 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,31,31,0.09) 0%, transparent 65%)" }} />

      {/* ── Glow azul-aço — inferior direita ──────────────────── */}
      <div className="absolute -bottom-20 right-[10%] w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(122,154,181,0.04) 0%, transparent 70%)" }} />

      {/* ── Stripe vermelha vertical ──────────────────────────── */}
      <div className="hidden lg:block absolute left-[calc(5rem-1px)] top-[15%] bottom-[15%] w-[2px] rounded-full pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent, rgba(255,31,31,0.5) 20%, rgba(255,31,31,0.5) 80%, transparent)" }} />

      {/* ── Layout principal ──────────────────────────────────── */}
      <div className="relative z-10 w-full px-5 lg:px-20 py-14 lg:py-20 flex items-center gap-12">

        {/* ── Coluna esquerda — conteúdo ────────────────────────── */}
        <div className="flex-1 max-w-[640px]">

          {/* Label */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-bold tracking-[2.5px] uppercase">
              Fundada em 1986 &nbsp;·&nbsp; Lançamento Digital
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-['Barlow_Condensed'] font-extrabold leading-[0.90] mb-6 select-none">
            <span className="block text-white" style={{ fontSize: "clamp(60px, 8.5vw, 110px)" }}>
              40 Anos.
            </span>
            <span className="block text-white" style={{ fontSize: "clamp(60px, 8.5vw, 110px)" }}>
              Uma Só
            </span>
            <span className="block text-[#ff1f1f]" style={{ fontSize: "clamp(60px, 8.5vw, 110px)" }}>
              — Fonte.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-[#7a9ab5] text-[16px] leading-relaxed max-w-[480px] mb-8">
            Para quem leva armas a sério.<br />
            Desde antes de qualquer portal existir.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap mb-9">
            <Link
              href="/edicoes"
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-bold px-7 py-3.5 rounded transition-colors"
            >
              Ver as 207 Edições →
            </Link>
            <Link
              href="/assine"
              className="text-[#7a9ab5] hover:text-white text-[14px] font-semibold px-6 py-3.5 rounded transition-all"
              style={{ border: "1px solid rgba(28,42,62,0.9)", background: "rgba(255,255,255,0.02)" }}
            >
              Ver planos
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center flex-wrap gap-0">
            {[
              { value: "207",  label: "Edições\nno acervo"    },
              { value: "40",   label: "Anos de\nhistória"     },
              { value: "1986", label: "Fundada em\nSão Paulo" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 first:pl-0"
                style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(20,29,44,1)" }}
              >
                <span className="font-['Barlow_Condensed'] font-extrabold text-white leading-none"
                  style={{ fontSize: "clamp(28px, 3vw, 38px)" }}>
                  {stat.value}
                </span>
                <span className="text-[#526888] text-[11px] leading-snug whitespace-pre-line">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Coluna direita — decoração tipográfica (desktop) ─── */}
        <div className="hidden lg:flex flex-col items-end justify-center shrink-0 select-none pointer-events-none" style={{ width: "38%" }}>

          {/* Watermark "MAGNUM" vertical */}
          <div className="relative flex flex-col items-end">

            {/* Grande número decorativo */}
            <span
              className="font-['Barlow_Condensed'] font-extrabold text-white leading-none"
              style={{ fontSize: "clamp(140px, 18vw, 240px)", opacity: 0.06, letterSpacing: "-4px" }}
            >
              207
            </span>

            {/* Badge central visível */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              {/* Anel decorativo */}
              <div className="w-[180px] h-[180px] rounded-full flex flex-col items-center justify-center gap-1"
                style={{ border: "1px solid rgba(28,42,62,0.7)", background: "rgba(7,10,18,0.5)" }}>
                <span className="font-['Barlow_Condensed'] font-extrabold text-white text-[56px] leading-none">40</span>
                <span className="text-[#ff1f1f] text-[11px] font-bold tracking-[3px] uppercase">Anos</span>
                <div className="w-8 h-[1px] bg-[#1c2a3e] my-0.5" />
                <span className="text-[#526888] text-[10px] font-semibold tracking-[1.5px]">1986 · 2026</span>
              </div>

              {/* Linha decorativa superior */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <span className="text-[#1c2a3e] text-[9px] font-bold tracking-[3px] uppercase">Maior Acervo</span>
                <div className="w-[1px] h-5 bg-[#1c2a3e]" />
              </div>

              {/* Linha decorativa inferior */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <div className="w-[1px] h-5 bg-[#1c2a3e]" />
                <span className="text-[#1c2a3e] text-[9px] font-bold tracking-[3px] uppercase">Digital do Brasil</span>
              </div>
            </div>
          </div>

          {/* Hashtag */}
          <span className="text-[#1c2a3e] text-[11px] font-semibold tracking-[2px] uppercase mt-8">
            #RevistaMagnum
          </span>
        </div>

      </div>

      {/* ── Hashtag mobile ────────────────────────────────────── */}
      <div className="lg:hidden absolute bottom-4 right-5 z-10">
        <span className="text-[#1c2a3e] text-[11px] font-semibold tracking-[1.5px] uppercase">
          #RevistaMagnum
        </span>
      </div>

    </section>
  );
}
