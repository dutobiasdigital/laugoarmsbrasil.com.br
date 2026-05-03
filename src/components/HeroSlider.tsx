"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface HeroConfig {
  heightDesktop: number;
  heightTablet:  number;
  heightMobile:  number;
  autoplayMs:    number;
  animation:     "slide" | "fade" | "slideUp";
}

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  heightDesktop: 600,
  heightTablet:  480,
  heightMobile:  360,
  autoplayMs:    6000,
  animation:     "slide",
};

export interface HeroSlide {
  id: string;
  active: boolean;
  order: number;
  background: {
    type: "gradient" | "image";
    gradient?: string;
    imageUrl?: string;
  };
  backgroundTablet?: string | null;
  backgroundMobile?: string | null;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  text?: string;
  button1?: { label: string; href: string } | null;
  button2?: { label: string; href: string } | null;
  photo?: { url: string; layout: "right" | "left" | "overlay" } | null;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  config?: Partial<HeroConfig>;
}

type BgDef = { type: "gradient" | "image"; gradient?: string; imageUrl?: string };

function bgStyle(bg: BgDef): React.CSSProperties {
  if (bg.type === "gradient") return { background: bg.gradient ?? "#070a12" };
  return { backgroundImage: `url(${bg.imageUrl ?? ""})`, backgroundSize: "cover", backgroundPosition: "center" };
}

function slideClass(i: number, cur: number, anim: HeroConfig["animation"]) {
  const active  = i === cur;
  const before  = i < cur;
  if (anim === "fade") return active ? "opacity-100 z-10" : "opacity-0 z-0";
  if (anim === "slideUp") {
    if (active) return "opacity-100 translate-y-0 z-10";
    return before ? "opacity-0 -translate-y-full z-0" : "opacity-0 translate-y-full z-0";
  }
  // slide (horizontal)
  if (active) return "opacity-100 translate-x-0 z-10";
  return before ? "opacity-0 -translate-x-full z-0" : "opacity-0 translate-x-full z-0";
}

export default function HeroSlider({ slides, config: cfgProp }: HeroSliderProps) {
  const cfg = { ...DEFAULT_HERO_CONFIG, ...cfgProp };
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoplay = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const startAutoplay = () => {
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), cfg.autoplayMs);
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, cfg.autoplayMs]);

  const goTo = (i: number) => { stopAutoplay(); setCurrent(i); startAutoplay(); };
  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  if (!slides.length) return null;

  return (
    <>
      {/* Responsive heights via scoped style */}
      <style>{`
        .hs-root { height: ${cfg.heightMobile}px; }
        @media(min-width:768px){ .hs-root { height: ${cfg.heightTablet}px; } }
        @media(min-width:1024px){ .hs-root { height: ${cfg.heightDesktop}px; } }
      `}</style>

      <div className="hs-root relative overflow-hidden">
        {slides.map((slide, i) => {
          const photoLayout = slide.photo?.layout ?? null;
          const isReversed  = photoLayout === "left";
          const isOverlay   = photoLayout === "overlay";

          // Responsive backgrounds
          const desktopBg = slide.background;
          const tabletBg: BgDef = slide.backgroundTablet
            ? { type: "image", imageUrl: slide.backgroundTablet }
            : slide.background;
          const mobileBg: BgDef = slide.backgroundMobile
            ? { type: "image", imageUrl: slide.backgroundMobile }
            : slide.background;

          const bgs = [
            { bg: mobileBg,  cls: "block md:hidden" },
            { bg: tabletBg,  cls: "hidden md:block lg:hidden" },
            { bg: desktopBg, cls: "hidden lg:block" },
          ];

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${slideClass(i, current, cfg.animation)}`}
            >
              <section
                className={`h-full relative flex items-center px-5 lg:px-20 py-10 lg:py-0 gap-6 overflow-hidden ${isReversed ? "flex-row-reverse" : ""}`}
              >
                {/* Responsive background layers */}
                {bgs.map(({ bg, cls }, idx) => (
                  <div key={idx} className={`absolute inset-0 ${cls}`} style={bgStyle(bg)}>
                    {bg.type === "image" && <div className="absolute inset-0 bg-black/50" />}
                  </div>
                ))}

                {/* Overlay layout — photo as full background */}
                {isOverlay && slide.photo && (
                  <div
                    className="absolute inset-0 z-0"
                    style={{ backgroundImage: `url(${slide.photo.url})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  >
                    <div className="absolute inset-0 bg-black/60" />
                  </div>
                )}

                {/* Grid decoration */}
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: "repeating-linear-gradient(0deg,#7a9ab5 0px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#7a9ab5 0px,transparent 1px,transparent 60px)" }}
                />
                {/* Red glow */}
                <div
                  className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06] pointer-events-none"
                  style={{ background: "radial-gradient(circle,#ff1f1f 0%,transparent 70%)" }}
                />

                {/* Text content */}
                <div className={`flex flex-col gap-5 flex-1 max-w-[680px] relative z-10 ${isOverlay ? "mx-auto text-center items-center" : ""}`}>
                  {slide.subtitle && (
                    <div className="inline-flex items-center gap-2 self-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff1f1f] animate-pulse" />
                      <span className="text-[#ff1f1f] text-[10px] font-bold tracking-[2px] uppercase">{slide.subtitle}</span>
                    </div>
                  )}
                  <div className="font-['Barlow_Condensed'] font-extrabold leading-[1.0]">
                    <p className={`text-[#dce8ff] text-5xl lg:text-[68px] ${slide.titleHighlight ? "line-clamp-1" : "line-clamp-2"}`}>
                      {slide.title}
                    </p>
                    {slide.titleHighlight && (
                      <p className="text-[#ff1f1f] text-5xl lg:text-[68px] line-clamp-1">{slide.titleHighlight}</p>
                    )}
                  </div>
                  {slide.text && (
                    <p className="text-[#7a9ab5] text-[15px] leading-relaxed max-w-xl">{slide.text}</p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap pt-1">
                    {slide.button1 && (
                      <Link href={slide.button1.href} className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold px-7 py-3 rounded transition-colors">
                        {slide.button1.label}
                      </Link>
                    )}
                    {slide.button2 && (
                      <Link href={slide.button2.href} className="border border-[#1c2a3e] hover:border-[#7a9ab5]/50 text-[#7a9ab5] hover:text-white text-[14px] font-semibold px-6 py-3 rounded transition-colors">
                        {slide.button2.label}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Photo for right/left layouts */}
                {slide.photo && !isOverlay && (
                  <div className="hidden lg:block relative shrink-0 w-[260px] z-10">
                    <div className="absolute inset-0 scale-[1.15] blur-2xl opacity-30 rounded-xl"
                      style={{ background: "linear-gradient(145deg,#ff1f1f20,#1c2a3e,#070a12)" }} />
                    <div className="card-metal-border relative">
                      <div className="bg-[#0e1520] rounded-[13px] overflow-hidden aspect-[3/4]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slide.photo.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          );
        })}

        {/* Controls */}
        {slides.length > 1 && (
          <>
            <button onClick={prev} aria-label="Slide anterior"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center text-[20px] transition-colors">
              ‹
            </button>
            <button onClick={next} aria-label="Próximo slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center text-[20px] transition-colors">
              ›
            </button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} aria-label={`Ir para slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-[#ff1f1f]" : "w-2 bg-white/30 hover:bg-white/60"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
