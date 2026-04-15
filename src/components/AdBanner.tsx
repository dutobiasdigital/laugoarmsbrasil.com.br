"use client";

import { useState, useEffect, useRef } from "react";

/* ── Dimensões IAB ─────────────────────────────────────────── */
const SIZE_DIMS: Record<string, { w: number; h: number }> = {
  BILLBOARD:    { w: 970, h: 250 },
  LEADERBOARD:  { w: 728, h: 90  },
  MED_RECT:     { w: 300, h: 250 },
  HALF_PAGE:    { w: 300, h: 600 },
  LARGE_MOBILE: { w: 320, h: 100 },
};

interface Ad {
  id: string;
  name: string;
  advertiser: string;
  imageUrl: string;
  targetUrl: string;
  bannerSize: string;
}

interface AdBannerProps {
  position: string;
  bannerSize: string;
  className?: string;
}

function getOrCreateSessionId(): string {
  const key = "__mgn_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

function trackImpression(ad: Ad) {
  const key = `__mgn_imp_${ad.id}`;
  if (sessionStorage.getItem(key)) return; // já contou nesta sessão
  sessionStorage.setItem(key, "1");
  const sessionId = getOrCreateSessionId();
  fetch(`/api/ad/impression/${ad.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  }).catch(() => {});
}

export default function AdBanner({ position, bannerSize, className = "" }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [ready, setReady] = useState(false);
  const tracked = useRef(false);

  const dims = SIZE_DIMS[bannerSize] ?? { w: 300, h: 250 };

  useEffect(() => {
    fetch(`/api/ads?position=${position}&bannerSize=${bannerSize}`)
      .then((r) => r.json())
      .then((ads: Ad[]) => {
        if (Array.isArray(ads) && ads.length > 0) {
          // Sorteia aleatoriamente a cada visita/montagem
          const picked = ads[Math.floor(Math.random() * ads.length)];
          setAd(picked);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [position, bannerSize]);

  // Rastreia impressão uma vez por sessão, por anúncio
  useEffect(() => {
    if (ad && !tracked.current) {
      tracked.current = true;
      trackImpression(ad);
    }
  }, [ad]);

  /* ── Placeholder (carregando ou sem anúncio) ─────────────── */
  if (!ready || !ad) {
    return (
      <div className={`flex flex-col items-center gap-1.5 ${className}`}>
        <p className="text-[9px] font-semibold text-[#253750] tracking-[1.5px] uppercase">
          Publicidade
        </p>
        <div
          className="bg-[#0e1520] border border-[#141d2c] rounded"
          style={{ width: dims.w, height: dims.h, maxWidth: "100%" }}
        />
      </div>
    );
  }

  /* ── Anúncio ativo ───────────────────────────────────────── */
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <p className="text-[9px] font-semibold text-[#253750] tracking-[1.5px] uppercase">
        Publicidade
      </p>
      <a
        href={`/api/ad/click/${ad.id}?url=${encodeURIComponent(ad.targetUrl)}`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        title={ad.advertiser}
        style={{ display: "block", maxWidth: "100%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.imageUrl}
          alt={ad.name}
          width={dims.w}
          height={dims.h}
          className="rounded block"
          style={{ width: dims.w, height: "auto", maxWidth: "100%" }}
        />
      </a>
    </div>
  );
}
