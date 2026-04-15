import HeroManager from "./_HeroManager";

export const dynamic = "force-dynamic";

interface HeroSlide {
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

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const res = await fetch(
      `${BASE}/site_settings?key=like.hero.%&select=key,value`,
      { headers: HEADERS, cache: "no-store" }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return [];

    const slidesRow = rows.find((r) => r.key === "hero.slides");
    if (!slidesRow?.value) return [];

    const parsed = JSON.parse(slidesRow.value);
    if (!Array.isArray(parsed)) return [];
    return parsed as HeroSlide[];
  } catch {
    return [];
  }
}

export default async function AdminHeroPage() {
  const slides = await getHeroSlides();

  return (
    <div className="p-6 lg:p-10 max-w-[1000px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Hero
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            Gerencie os slides do hero da página inicial
          </p>
        </div>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />
      <HeroManager initialSlides={slides} />
    </div>
  );
}
