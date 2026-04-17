/**
 * Lê configurações de módulos do site_settings.
 * Usado pelas páginas públicas para respeitar as configurações do admin.
 */

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export interface ModuleConfig {
  itemsPerPage:   number;
  infiniteScroll: boolean;
}

const DEFAULTS: Record<string, ModuleConfig> = {
  "revistas":  { itemsPerPage: 24, infiniteScroll: false },
  "blog":      { itemsPerPage: 12, infiniteScroll: false },
  "ecommerce": { itemsPerPage: 12, infiniteScroll: false },
  "guia":      { itemsPerPage: 24, infiniteScroll: false },
};

/** Chave do setting de quantidade conforme o módulo */
const QTD_KEY: Record<string, string> = {
  "revistas":  "edicoes_por_pagina",
  "blog":      "artigos_por_pagina",
  "ecommerce": "produtos_por_pagina",
  "guia":      "anunciantes_por_pagina",
};

/**
 * @param module - "revistas" | "blog" | "ecommerce" | "guia"
 */
export async function getModuleConfig(module: string): Promise<ModuleConfig> {
  const defaults = DEFAULTS[module] ?? { itemsPerPage: 12, infiniteScroll: false };
  const qtdKey   = `modulos.${module}.${QTD_KEY[module] ?? "itens_por_pagina"}`;
  const scrKey   = `modulos.${module}.scroll_infinito`;

  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=in.(${qtdKey},${scrKey})&select=key,value`,
      {
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
        next:    { revalidate: 60 },
      }
    );
    if (!res.ok) return defaults;
    const rows: { key: string; value: string }[] = await res.json();
    if (!Array.isArray(rows)) return defaults;

    const map: Record<string, string> = {};
    rows.forEach(r => { map[r.key] = r.value; });

    const qtdRaw = map[qtdKey];
    const scrRaw = map[scrKey];

    return {
      itemsPerPage:   qtdRaw ? Math.max(1, Math.min(200, parseInt(qtdRaw, 10))) : defaults.itemsPerPage,
      infiniteScroll: scrRaw === "true",
    };
  } catch {
    return defaults;
  }
}
