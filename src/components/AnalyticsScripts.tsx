"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
  }
}

interface Props {
  gaId: string;
  gtmId: string;
  gAdsId: string;
  gAdsLabel: string;
  pixelId: string;
  hotjarId: string;
  clarityId: string;
}

export default function AnalyticsScripts({
  gaId, gtmId, gAdsId, gAdsLabel, pixelId, hotjarId, clarityId,
}: Props) {
  const pathname    = usePathname();
  const isFirstRender = useRef(true);

  /* ── Rastreamento de navegação SPA ─────────────────────
     GA4 captura a 1ª view automaticamente (gtag config).
     Para navegações client-side do App Router, enviamos
     manualmente a partir da 2ª mudança de rota.          */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // GA4 — page_view em navegação SPA
    if (gaId && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_path:     pathname,
        page_title:    document.title,
        page_location: window.location.href,
      });
    }
    // GTM — dataLayer push
    if (gtmId && typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({ event: "pageview", page: pathname });
    }
  }, [pathname, gaId, gtmId]);

  /* ── Não rastrear o admin ────────────────────────────── */
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* ── Google Tag Manager ── */}
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {/* ── Google Analytics 4 (sem GTM) ── */}
      {gaId && !gtmId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${gaId}',{
  send_page_view:true,
  cookie_domain:'auto',
  cookie_expires:63072000,
  link_attribution:true,
  allow_google_signals:true,
  allow_ad_personalization_signals:true
});`}
          </Script>
        </>
      )}

      {/* ── Google Ads (sem GTM) ── */}
      {gAdsId && !gtmId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gAdsId}`}
            strategy="afterInteractive"
          />
          <Script id="gads-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${gAdsId}');${
  gAdsLabel
    ? `gtag('event','conversion',{'send_to':'${gAdsId}/${gAdsLabel}'});`
    : ""
}`}
          </Script>
        </>
      )}

      {/* ── Meta Pixel (sem GTM) ── */}
      {pixelId && !gtmId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      )}

      {/* ── Hotjar ── */}
      {hotjarId && (
        <Script id="hotjar" strategy="afterInteractive">
          {`(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${hotjarId},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      )}

      {/* ── Microsoft Clarity ── */}
      {clarityId && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
        </Script>
      )}
    </>
  );
}
