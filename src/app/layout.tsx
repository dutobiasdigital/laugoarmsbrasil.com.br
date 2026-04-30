import type { Metadata } from "next";
import { Archivo, JetBrains_Mono, Oswald, Bebas_Neue, Montserrat, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import AccessLogger from "@/components/AccessLogger";
import ScrollToTop from "@/components/ScrollToTop";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["400","600","700"] });
const bebasNeue = Bebas_Neue({ variable: "--font-bebas-neue", subsets: ["latin"], weight: ["400"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["400","600","700","800"] });
const playfairDisplay = Playfair_Display({ variable: "--font-playfair-display", subsets: ["latin"], weight: ["400","600","700"] });

export const metadata: Metadata = {
  title: "Laúgo Arms Brasil — Catálogo de Produtos",
  description: "Catálogo oficial de produtos Laúgo Arms Brasil.",
};

/* ── Lê settings do Supabase (cache 60s) ───────────────────── */
async function getSiteSettings(): Promise<Record<string, string>> {
  const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
  const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!PROJECT) return {};
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?select=key,value`,
      {
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
        cache: "no-store",
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
    archivo:    "'Archivo',sans-serif",
    oswald:     "'Oswald',sans-serif",
    bebas:      "'Bebas Neue',sans-serif",
    montserrat: "'Montserrat',sans-serif",
    playfair:   "'Playfair Display',serif",
    barlow:     "'Archivo',sans-serif", // fallback legacy → Archivo
  };
  const fontKey = cfg["brand.font_heading"] || "archivo";
  const fontHeading = fontKeyMap[fontKey] ?? fontKeyMap.archivo;

  const darkVars = [
    `--brand:${cfg["brand.color_primary"] || "#CB0A0E"}`,
    `--brand-hover:${cfg["brand.color_hover"] || "#A00810"}`,
    `--bg-base:${cfg["brand.dark.bg_base"] || "#0A0A0B"}`,
    `--bg-subtle:${cfg["brand.dark.bg_subtle"] || "#111113"}`,
    `--bg-card:${cfg["brand.dark.bg_card"] || "#16161A"}`,
    `--bg-elevated:${cfg["brand.dark.bg_elevated"] || "#1C1C21"}`,
    `--border:${cfg["brand.dark.border"] || "#26262C"}`,
    `--border-mid:${cfg["brand.dark.border_mid"] || "#3A3A42"}`,
    `--text-primary:${cfg["brand.dark.text"] || "#B8B8C0"}`,
    `--text-heading:${cfg["brand.dark.text_heading"] || "#F4F4F6"}`,
    `--text-muted:${cfg["brand.dark.text_muted"] || "#8A8A95"}`,
    `--text-subtle:${cfg["brand.dark.text_subtle"] || "#5C5C66"}`,
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
      className={`${archivo.variable} ${jetbrainsMono.variable} ${oswald.variable} ${bebasNeue.variable} ${montserrat.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* ── Design System — CSS vars from DB (brand, colors, fonts) ── */}
        <style dangerouslySetInnerHTML={{ __html: buildDesignCss(cfg) }} />

        {/* ── Favicon dinâmico — lido do DB via brand.favicon ── */}
        {cfg["brand.favicon"]
          ? <link rel="icon" href={cfg["brand.favicon"]} />
          : <link rel="icon" href="/favicon.ico" />
        }

        {/* ── reCAPTCHA v3 site key (lido pelo useRecaptcha hook) ── */}
        {recaptchaSiteKey && <meta name="rcsk" content={recaptchaSiteKey} />}

        {/* ── Google Search Console verification ── */}
        {gSearchConsole && <meta name="google-site-verification" content={gSearchConsole} />}

        {/* ── Bing Webmaster Tools verification ── */}
        {bingVerification && <meta name="msvalidate.01" content={bingVerification} />}

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
        <AnalyticsScripts
          gaId={ga4Id}
          gtmId={gtmId}
          gAdsId={gAdsId}
          gAdsLabel={gAdsLabel}
          pixelId={pixelId}
          hotjarId={hotjarId}
          clarityId={clarityId}
        />
      </body>
    </html>
  );
}
