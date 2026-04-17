"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

const SLIDES = [
  {
    label: "207 Edições · Acervo Digital Completo",
    lines: ["O Maior", "Acervo", "do Brasil."],
    lineColors: ["text-white", "text-white", "text-[#ff1f1f]"],
    sub: "40 anos de conteúdo técnico reunidos\nnuma só plataforma. Leia quando quiser.",
    cta: { href: "/edicoes", label: "Explorar o Acervo →" },
    ctaSecondary: { href: "/edicoes?tipo=SPECIAL", label: "Ver Edições Especiais" },
  },
  {
    label: "Guia Comercial · Empresas do Setor",
    lines: ["Armas.", "Acessórios.", "Empresas."],
    lineColors: ["text-white", "text-white", "text-[#ff1f1f]"],
    sub: "Encontre armeiros, clubes de tiro,\nimportadores e distribuidoras perto de você.",
    cta: { href: "/guia", label: "Acessar o Guia →" },
    ctaSecondary: { href: "/loja", label: "Ver a Loja" },
  },
  {
    label: "Assinatura Digital · Acesso Imediato",
    lines: ["Assine.", "Acesse.", "Agora."],
    lineColors: ["text-white", "text-white", "text-[#ff1f1f]"],
    sub: "Acervo completo liberado na hora.\nSem frete. Sem espera. Direto no seu celular.",
    cta: { href: "/assine", label: "Ver Planos de Assinatura →" },
    ctaSecondary: { href: "/edicoes", label: "Conhecer o Acervo" },
  },
];

const STATS = [
  { value: "207",  label: "Edições\nno acervo"    },
  { value: "40",   label: "Anos de\nhistória"     },
  { value: "1986", label: "Fundada em\nSão Paulo" },
];

export default function WelcomeBanner() {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  // Auto-advance a cada 10s
  useEffect(() => {
    const timer = setInterval(() => next(), 10000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="hero-metal relative overflow-hidden min-h-[380px] lg:min-h-[420px] flex items-center">

      {/* ── Grade decorativa ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#7a9ab5 0,transparent 1px,transparent 64px),repeating-linear-gradient(90deg,#7a9ab5 0,transparent 1px,transparent 64px)" }} />

      {/* ── Glow vermelho — centro ────────────────────────────── */}
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,31,31,0.07) 0%, transparent 65%)" }} />

      {/* ── Layout principal — centrado ───────────────────────── */}
      <div className="relative z-10 w-full px-5 lg:px-20 py-6 lg:py-8 flex flex-col items-center">

        {/* ── Conteúdo — fade puro por key ─────────────────────── */}
        <div
          key={current}
          className="animate-fade-slide-in w-full max-w-[600px] text-center"
        >
          {/* Label */}
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-bold tracking-[2.5px] uppercase">
              {slide.label}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-['Barlow_Condensed'] font-extrabold leading-[0.90] mb-5 select-none">
            {slide.lines.map((line, i) => (
              <span key={i} className={`block ${slide.lineColors[i]}`}
                style={{ fontSize: "clamp(52px, 7vw, 96px)" }}>
                {line}
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <p className="text-[#7a9ab5] text-[15px] leading-relaxed mb-6 whitespace-pre-line">
            {slide.sub}
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-7">
            <Link
              href={slide.cta.href}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-bold px-7 py-3.5 rounded transition-colors"
            >
              {slide.cta.label}
            </Link>
            <Link
              href={slide.ctaSecondary.href}
              className="text-[#7a9ab5] hover:text-white text-[14px] font-semibold px-6 py-3.5 rounded transition-all"
              style={{ border: "1px solid rgba(28,42,62,0.9)", background: "rgba(255,255,255,0.02)" }}
            >
              {slide.ctaSecondary.label}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center flex-wrap gap-0">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 first:pl-0"
                style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(20,29,44,1)" }}
              >
                <span className="font-['Barlow_Condensed'] font-extrabold text-white leading-none"
                  style={{ fontSize: "clamp(24px, 2.8vw, 34px)" }}>
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

      {/* ── Controles — centrados ─────────────────────────────── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">

        {/* Setinha esquerda */}
        <button
          onClick={prev}
          className="slider-nav-btn w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ border: "1px solid rgba(28,42,62,0.9)", background: "rgba(7,10,18,0.6)", color: "#526888" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#526888")}
          aria-label="Slide anterior"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2L4 6l4 4" />
          </svg>
        </button>

        {/* Bolinhas de paginação */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width:  i === current ? "20px" : "6px",
                height: "6px",
                background: i === current ? "#ff1f1f" : "rgba(82,104,136,0.5)",
              }}
            />
          ))}
        </div>

        {/* Setinha direita */}
        <button
          onClick={next}
          className="slider-nav-btn w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ border: "1px solid rgba(28,42,62,0.9)", background: "rgba(7,10,18,0.6)", color: "#526888" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#526888")}
          aria-label="Próximo slide"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
        </button>

      </div>

      {/* ── Hashtag ───────────────────────────────────────────── */}
      <div className="absolute bottom-5 right-6 lg:right-10 z-10">
        <span className="text-[#1c2a3e] text-[11px] font-semibold tracking-[2px] uppercase">
          #RevistaMagnum
        </span>
      </div>

    </section>
  );
}
