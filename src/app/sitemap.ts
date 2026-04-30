import type { MetadataRoute } from "next";

const PROJECT  = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE_URL = "https://laugoarmsbrasil.com.br";

async function isSitemapEnabled(): Promise<boolean> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=eq.seo.sitemap_enabled&select=value&limit=1`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, next: { revalidate: 3600 } }
    );
    const rows: { value: string | null }[] = await res.json();
    return rows?.[0]?.value !== "false";
  } catch { return true; }
}

async function getProductSlugs(): Promise<string[]> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/shop_products?isActive=eq.true&select=slug&order=name.asc`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return Array.isArray(data) ? data.map((d: { slug: string }) => d.slug) : [];
  } catch { return []; }
}

async function getCategorySlugs(): Promise<string[]> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/shop_categories?isActive=eq.true&select=slug&order=sortOrder.asc`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return Array.isArray(data) ? data.map((d: { slug: string }) => d.slug) : [];
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const enabled = await isSitemapEnabled();
  if (!enabled) return [];

  const [productSlugs, categorySlugs] = await Promise.all([
    getProductSlugs(),
    getCategorySlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/loja`,      lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/sobre`,     lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE_URL}/contato`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE_URL}/anuncie`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map(slug => ({
    url:             `${BASE_URL}/loja/categoria/${slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map(slug => ({
    url:             `${BASE_URL}/loja/produto/${slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
