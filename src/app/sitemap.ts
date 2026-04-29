import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/guia";

const PROJECT  = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE_URL = "https://laugoarmsbrasil.com.br";

async function getSeoSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?select=key,value&key=in.(seo.sitemap_enabled,seo.sitemap_editions,seo.sitemap_blog,seo.sitemap_guia_cats,seo.sitemap_guia_listings,seo.canonical_base)`,
      {
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
        next: { revalidate: 3600, tags: ["sitemap"] },
      }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return {};
    const obj: Record<string, string> = {};
    for (const r of rows) if (r.value) obj[r.key] = r.value;
    return obj;
  } catch { return {}; }
}

async function getActiveListingSlugs(): Promise<string[]> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/guide_listings?status=eq.ACTIVE&select=slug&order=createdAt.desc`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return Array.isArray(data) ? data.map((d: { slug: string }) => d.slug) : [];
  } catch { return []; }
}

async function getPublishedEditionSlugs(): Promise<string[]> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/editions?isPublished=eq.true&select=slug&order=publishedAt.desc`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return Array.isArray(data) ? data.map((d: { slug: string }) => d.slug) : [];
  } catch { return []; }
}

async function getPublishedArticleSlugs(): Promise<string[]> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/articles?status=eq.PUBLISHED&select=slug&order=publishedAt.desc`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return Array.isArray(data) ? data.map((d: { slug: string }) => d.slug) : [];
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cfg = await getSeoSettings();
  const base = cfg["seo.canonical_base"] || BASE_URL;

  // Sitemap disabled → return empty (results in empty sitemap.xml)
  if (cfg["seo.sitemap_enabled"] === "false") return [];

  const includeEditions = cfg["seo.sitemap_editions"]      !== "false";
  const includeBlog     = cfg["seo.sitemap_blog"]          !== "false";
  const includeGuiaCats = cfg["seo.sitemap_guia_cats"]     !== "false";
  const includeListings = cfg["seo.sitemap_guia_listings"] !== "false";

  // Fetch only what's needed
  const [listingSlugs, editionSlugs, articleSlugs] = await Promise.all([
    includeListings ? getActiveListingSlugs()     : Promise.resolve([]),
    includeEditions ? getPublishedEditionSlugs()  : Promise.resolve([]),
    includeBlog     ? getPublishedArticleSlugs()  : Promise.resolve([]),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/edicoes`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/guia`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/guia/cadastrar`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/guia/busca`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.5 },
    { url: `${base}/assine`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/anuncie`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
    { url: `${base}/sobre`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${base}/contato`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = includeGuiaCats
    ? CATEGORIES.map(cat => ({
        url:             `${base}/guia/${cat.slug}`,
        lastModified:    new Date(),
        changeFrequency: "daily" as const,
        priority:        0.75,
      }))
    : [];

  const listingRoutes: MetadataRoute.Sitemap = listingSlugs.map(slug => ({
    url:             `${base}/guia/empresa/${slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.65,
  }));

  const editionRoutes: MetadataRoute.Sitemap = editionSlugs.map(slug => ({
    url:             `${base}/edicoes/${slug}`,
    lastModified:    new Date(),
    changeFrequency: "yearly" as const,
    priority:        0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map(slug => ({
    url:             `${base}/blog/${slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes, ...editionRoutes, ...articleRoutes];
}
