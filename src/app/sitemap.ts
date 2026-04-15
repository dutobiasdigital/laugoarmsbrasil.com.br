import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/guia";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE_URL = "https://revistamagnum.com.br";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listingSlugs, editionSlugs] = await Promise.all([
    getActiveListingSlugs(),
    getPublishedEditionSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/edicoes`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE_URL}/guia`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/guia/cadastrar`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/guia/busca`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.5 },
    { url: `${BASE_URL}/assine`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/anuncie`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE_URL}/sobre`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE_URL}/contato`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
    url:             `${BASE_URL}/guia/${cat.slug}`,
    lastModified:    new Date(),
    changeFrequency: "daily" as const,
    priority:        0.75,
  }));

  const listingRoutes: MetadataRoute.Sitemap = listingSlugs.map(slug => ({
    url:             `${BASE_URL}/guia/empresa/${slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.65,
  }));

  const editionRoutes: MetadataRoute.Sitemap = editionSlugs.map(slug => ({
    url:             `${BASE_URL}/edicoes/${slug}`,
    lastModified:    new Date(),
    changeFrequency: "yearly" as const,
    priority:        0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes, ...editionRoutes];
}
