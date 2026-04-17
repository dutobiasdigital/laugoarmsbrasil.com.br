import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow_Condensed, Oswald, Bebas_Neue, Montserrat, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import AccessLogger from "@/components/AccessLogger";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["400","600","700"] });
const bebasNeue = Bebas_Neue({ variable: "--font-bebas-neue", subsets: ["latin"], weight: ["400"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["400","600","700","800"] });
const playfairDisplay = Playfair_Display({ variable: "--font-playfair-display", subsets: ["latin"], weight: ["400","600","700"] });

export const metadata: Metadata = {
  title: "Revista Magnum — O Mundo das Armas em Suas Mãos",
  description: "O maior acervo de publicações especializadas em armas, munições e legislação do Brasil.",
  icons: { icon: "/logo.png" },
};

/* ── Lê settings do Supabase (cache 60s) ───────────────────── */
async function getSiteSettings(): Promise<Record<string, string>> {
  const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
  const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?select=key,value`,
      {
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
        next: { revalidate: 60 }, // cache 60s — settings não mudam com frequência
      }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return {};
    const obj: Record<string, string> = {};
    for (const r of rows) if (r.value) obj[r.key] = r.value;
    return obj;
  } catch { return {}; }
}

function buildDesignCss(cfg: Record<string, string>): string {
  const fontKeyMap: Record<string, string> = {
    barlow:     "'Barlow Condensed',sans-serif",
    oswald:     "'Oswald',sans-serif",
    bebas:      "'Bebas Neue',sans-serif",
    montserrat: "'Montserrat',sans-serif",
    playfair:   "'Playfair Display',serif",
  };
  const fontKey = cfg["brand.font_heading"] || "barlow";
  const fontHeading = fontKeyMap[fontKey] ?? fontKeyMap.barlow;

  const darkVars = [
    `--brand:${cfg["brand.color_primary"] || "#ff1f1f"}`,
    `--brand-hover:${cfg["brand.color_hover"] || "#cc0000"}`,
    `--bg-base:${cfg["brand.dark.bg_base"] || "#070a12"}`,
    `--bg-subtle:${cfg["brand.dark.bg_subtle"] || "#0a0f1a"}`,
    `--bg-card:${cfg["brand.dark.bg_card"] || "#0e1520"}`,
    `--bg-elevated:${cfg["brand.dark.bg_elevated"] || "#141d2c"}`,
    `--border:${cfg["brand.dark.border"] || "#141d2c"}`,
    `--border-mid:${cfg["brand.dark.border_mid"] || "#1c2a3e"}`,
    `--text-primary:${cfg["brand.dark.text"] || "#d4d4da"}`,
    `--text-heading:${cfg["brand.dark.text_heading"] || "#dce8ff"}`,
    `--text-muted:${cfg["brand.dark.text_muted"] || "#7a9ab5"}`,
    `--text-subtle:${cfg["brand.dark.text_subtle"] || "#526888"}`,
    `--font-heading:${fontHeading}`,
  ].join(";");

  const lightVars = [
    `--bg-base:${cfg["brand.light.bg_base"] || "#f1f5f9"}`,
    `--bg-subtle:${cfg["brand.light.bg_subtle"] || "#f8fafc"}`,
    `--bg-card:${cfg["brand.light.bg_card"] || "#ffffff"}`,
    `--bg-elevated:${cfg["brand.light.bg_elevated"] || "#e2e8f0"}`,
    `--border:${cfg["brand.light.border"] || "#cbd5e1"}`,
    `--border-mid:${cfg["brand.light.border_mid"] || "#94a3b8"}`,
    `--text-primary:${cfg["brand.light.text"] || "#334155"}`,
    `--text-heading:${cfg["brand.light.text_heading"] || "#1e293b"}`,
    `--text-muted:${cfg["brand.light.text_muted"] || "#475569"}`,
    `--text-subtle:${cfg["brand.light.text_subtle"] || "#64748b"}`,
  ].join(";");

  return `:root{${darkVars}}html.light{${lightVars}}`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cfg = await getSiteSettings();

  const gtmId              = cfg["integrations.gtm_id"]               ?? "";
  const ga4Id              = cfg["integrations.ga4_id"]               ?? "";
  const gAdsId             = cfg["integrations.google_ads_id"]        ?? "";
  const gAdsLabel          = cfg["integrations.google_ads_label"]     ?? "";
  const pixelId            = cfg["integrations.meta_pixel_id"]        ?? "";
  const hotjarId           = cfg["integrations.hotjar_id"]            ?? "";
  const clarityId          = cfg["integrations.clarity_id"]           ?? "";
  const recaptchaSiteKey   = cfg["integrations.recaptcha_site_key"]   ?? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
  const gSearchConsole     = cfg["integrations.google_search_console"] ?? "";
  const bingVerification   = cfg["integrations.bing_verification"]    ?? "";

  return (
    <html
      lang={cfg["site.language"] ?? "pt-BR"}
      className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} ${oswald.variable} ${bebasNeue.variable} ${montserrat.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* ── Design System — CSS vars from DB (brand, colors, fonts) ── */}
        <style dangerouslySetInnerHTML={{ __html: buildDesignCss(cfg) }} />

        {/* ── reCAPTCHA v3 site key (lido pelo useRecaptcha hook) ── */}
        {recaptchaSiteKey && <meta name="rcsk" content={recaptchaSiteKey} />}

        {/* ── Google Search Console verification ── */}
        {gSearchConsole && <meta name="google-site-verification" content={gSearchConsole} />}

        {/* ── Bing Webmaster Tools verification ── */}
        {bingVerification && <meta name="msvalidate.01" content={bingVerification} />}

        {/* ── Google Tag Manager ── */}
        {gtmId && (
          <Script id="gtm-head" strategy="beforeInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}

        {/* ── Google Analytics 4 (standalone, sem GTM) ── */}
        {ga4Id && !gtmId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`}
            </Script>
          </>
        )}

        {/* ── Google Ads (standalone, sem GTM) ── */}
        {gAdsId && !gtmId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gAdsId}`} strategy="afterInteractive" />
            <Script id="gads-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gAdsId}');${gAdsLabel ? `gtag('event','conversion',{'send_to':'${gAdsId}/${gAdsLabel}'});` : ""}`}
            </Script>
          </>
        )}

        {/* ── Meta Pixel (standalone, sem GTM) ── */}
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
      </head>

      <body className="min-h-full flex flex-col">
        {/* ── GTM noscript ── */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0" width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        <CartProvider>
          <ThemeProvider>
            <AccessLogger />
            <CartDrawer />
            {children}
            <ScrollToTop />
          </ThemeProvider>
        </CartProvider>
      </body>
    </html>
  );
}
