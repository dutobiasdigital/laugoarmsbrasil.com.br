"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface HeroSlide {
  id: string;
  active: boolean;
  order: number;
  background: {
    type: "gradient" | "image";
    gradient?: string;
    imageUrl?: string;
  };
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  text?: string;
  button1: { label: string; href: string };
  button2?: { label: string; href: string } | null;
  photo?: {
    url: string;
    layout: "right" | "left" | "overlay";
  } | null;
}

interface HeroSliderProps {
  slides: HeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = () => {
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  const goTo = (i: number) => {
    stopAutoplay();
    setCurrent(i);
    startAutoplay();
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  if (!slides.length) return null;

  return (
    <div className="relative overflow-hidden lg:h-[600px]">
      {slides.map((slide, i) => {
        const isGradient = slide.background.type === "gradient";
        const photoLayout = slide.photo?.layout ?? null;

        const sectionStyle: React.CSSProperties = isGradient
          ? { background: slide.background.gradient }
          : {
              backgroundImage: `url(${slide.background.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            };

        const isReversed = photoLayout === "left";
        const isOverlay = photoLayout === "overlay";

        return (
          <div
            key={slide.id}
            className={`${i === 0 ? "relative" : "absolute inset-0"} transition-all duration-700 ease-in-out ${
              i === current
                ? "opacity-100 translate-x-0 z-10"
                : i < current
                ? "opacity-0 -translate-x-full z-0"
                : "opacity-0 translate-x-full z-0"
            }`}
          >
            <section
              className={`relative flex items-center px-5 lg:px-20 py-16 lg:py-0 lg:h-[600px] gap-6 overflow-hidden ${isReversed ? "flex-row-reverse" : ""}`}
              style={sectionStyle}
            >
              {/* Dark overlay for image backgrounds */}
              {!isGradient && (
                <div className="absolute inset-0 bg-black/50" />
              )}

              {/* Overlay layout: photo as background */}
              {isOverlay && slide.photo && (
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundImage: `url(${slide.photo.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/60" />
                </div>
              )}

              {/* Background grid decoration */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, #7a9ab5 0px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #7a9ab5 0px, transparent 1px, transparent 60px)",
                }}
              />

              {/* Red glow */}
              <div
                className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
                style={{ background: "radial-gradient(circle, #ff1f1f 0%, transparent 70%)" }}
              />

              {/* Text content */}
              <div
                className={`flex flex-col gap-5 flex-1 max-w-[680px] relative z-10 ${
                  isOverlay ? "mx-auto text-center items-center" : ""
                }`}
              >
                {slide.subtitle && (
                  <div className="inline-flex items-center gap-2 self-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff1f1f] animate-pulse" />
                    <span className="text-[#ff1f1f] text-[10px] font-bold tracking-[2px] uppercase">
                      {slide.subtitle}
                    </span>
                  </div>
                )}
                <div className="font-['Barlow_Condensed'] font-extrabold leading-[1.0]">
                  <p className={`text-[#dce8ff] text-5xl lg:text-[68px] ${slide.titleHighlight ? "line-clamp-1" : "line-clamp-2"}`}>
                    {slide.title}
                  </p>
                  {slide.titleHighlight && (
                    <p className="text-[#ff1f1f] text-5xl lg:text-[68px] line-clamp-1">
                      {slide.titleHighlight}
                    </p>
                  )}
                </div>
                {slide.text && (
                  <p className="text-[#7a9ab5] text-[15px] leading-relaxed max-w-xl">{slide.text}</p>
                )}
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  <Link
                    href={slide.button1.href}
                    className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold px-7 py-3 rounded transition-colors"
                  >
                    {slide.button1.label}
                  </Link>
                  {slide.button2 && (
                    <Link
                      href={slide.button2.href}
                      className="border border-[#1c2a3e] hover:border-[#7a9ab5]/50 text-[#7a9ab5] hover:text-white text-[14px] font-semibold px-6 py-3 rounded transition-colors"
                    >
                      {slide.button2.label}
                    </Link>
                  )}
                </div>
              </div>

              {/* Photo for right/left layouts */}
              {slide.photo && !isOverlay && (
                <div className="hidden lg:block relative shrink-0 w-[260px] z-10">
                  <div
                    className="absolute inset-0 scale-[1.15] blur-2xl opacity-30 rounded-xl"
                    style={{ background: "linear-gradient(145deg, #ff1f1f20, #1c2a3e, #070a12)" }}
                  />
                  <div className="card-metal-border relative">
                    <div className="bg-[#0e1520] rounded-[13px] overflow-hidden aspect-[3/4]">
                      <img
                        src={slide.photo.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        );
      })}

      {/* Navigation controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center text-[20px] transition-colors"
            aria-label="Slide anterior"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center text-[20px] transition-colors"
            aria-label="Próximo slide"
          >
            ›
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir para slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-[#ff1f1f]"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
