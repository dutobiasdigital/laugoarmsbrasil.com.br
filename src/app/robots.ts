import type { MetadataRoute } from "next";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE_URL = "https://revistamagnum.com.br";

async function getSeoSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?select=key,value&key=in.(seo.robots_txt,seo.indexing_enabled,seo.canonical_base,seo.sitemap_enabled)`,
      {
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
        next: { revalidate: 300, tags: ["robots"] },
      }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return {};
    const obj: Record<string, string> = {};
    for (const r of rows) if (r.value) obj[r.key] = r.value;
    return obj;
  } catch { return {}; }
}

type RobotsRule = {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
};

/** Parses a raw robots.txt string into structured rules + sitemap list. */
function parseRobotsTxt(text: string): { rules: RobotsRule[]; sitemaps: string[] } {
  const rules: RobotsRule[] = [];
  const sitemaps: string[] = [];

  // Split into blocks separated by blank lines
  const blocks = text.split(/\n[ \t]*\n/);

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("#"));

    const userAgents: string[] = [];
    const allows: string[]     = [];
    const disallows: string[]  = [];

    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const directive = line.slice(0, colonIdx).trim().toLowerCase();
      const value     = line.slice(colonIdx + 1).trim();

      if (directive === "user-agent")  userAgents.push(value);
      else if (directive === "allow")  { if (value) allows.push(value); }
      else if (directive === "disallow") disallows.push(value); // empty string = allow all, still valid
      else if (directive === "sitemap") { if (value) sitemaps.push(value); }
    }

    if (userAgents.length) {
      const rule: RobotsRule = {
        userAgent: userAgents.length === 1 ? userAgents[0] : userAgents,
      };
      if (allows.length)    rule.allow    = allows.length    === 1 ? allows[0]    : allows;
      if (disallows.length) rule.disallow = disallows.length === 1 ? disallows[0] : disallows;
      rules.push(rule);
    }
  }

  return { rules, sitemaps };
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const cfg            = await getSeoSettings();
  const base           = cfg["seo.canonical_base"] || BASE_URL;
  const sitemapEnabled = cfg["seo.sitemap_enabled"] !== "false";
  const sitemapUrl     = `${base}/sitemap.xml`;

  // ── Custom robots.txt configured by admin ──
  const customText = cfg["seo.robots_txt"]?.trim();
  if (customText) {
    const { rules, sitemaps } = parseRobotsTxt(customText);
    if (rules.length) {
      const sitemap = sitemaps.length
        ? (sitemaps.length === 1 ? sitemaps[0] : sitemaps)
        : sitemapEnabled ? sitemapUrl : undefined;

      return {
        rules: rules.length === 1 ? rules[0] : rules,
        ...(sitemap ? { sitemap } : {}),
      };
    }
  }

  // ── Auto-generate from indexing settings ──
  const indexingEnabled = cfg["seo.indexing_enabled"] !== "false";

  if (!indexingEnabled) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/checkout", "/conta", "/loja/carrinho"],
    },
    ...(sitemapEnabled ? { sitemap: sitemapUrl } : {}),
  };
}
