import HeroManager from "./_HeroManager";
import type { HeroSlide, HeroConfig } from "./_HeroManager";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

const DEFAULT_CONFIG: HeroConfig = {
  heightDesktop: 600,
  heightTablet:  480,
  heightMobile:  360,
  autoplayMs:    6000,
  animation:     "slide",
};

async function getHeroData(): Promise<{ slides: HeroSlide[]; config: HeroConfig }> {
  try {
    const res = await fetch(
      `${BASE}/site_settings?key=in.(hero.slides,hero.config)&select=key,value`,
      { headers: HEADERS, cache: "no-store" }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return { slides: [], config: DEFAULT_CONFIG };

    const slidesRow = rows.find((r) => r.key === "hero.slides");
    const configRow = rows.find((r) => r.key === "hero.config");

    const slides = slidesRow?.value ? (JSON.parse(slidesRow.value) as HeroSlide[]) : [];
    const config = configRow?.value
      ? { ...DEFAULT_CONFIG, ...JSON.parse(configRow.value) as Partial<HeroConfig> }
      : DEFAULT_CONFIG;

    return { slides, config };
  } catch {
    return { slides: [], config: DEFAULT_CONFIG };
  }
}

export default async function AdminHeroPage() {
  const { slides, config } = await getHeroData();

  return (
    <div className="p-6 lg:p-10 max-w-[1000px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Hero
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            Gerencie os slides e configurações do hero da página inicial
          </p>
        </div>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />
      <HeroManager initialSlides={slides} initialConfig={config} />
    </div>
  );
}
