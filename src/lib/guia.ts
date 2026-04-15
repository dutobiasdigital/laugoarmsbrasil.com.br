export const CATEGORIES = [
  { value: "ARMAREIRO",    slug: "armareiros",               label: "Armareiros",              icon: "🔫", desc: "Lojas e revendas autorizadas de armas" },
  { value: "CLUBE_TIRO",   slug: "clubes-de-tiro",           label: "Clubes e Estandes",       icon: "🎯", desc: "Campos e polígonos de tiro esportivo" },
  { value: "MUNICOES",     slug: "municoes-acessorios",      label: "Munições e Acessórios",   icon: "💣", desc: "Distribuidoras e importadoras de munição" },
  { value: "CACA",         slug: "caca-pesca",               label: "Caça e Pesca Esportiva",  icon: "🦌", desc: "Ranchos, guias e outfitters" },
  { value: "JURIDICO",     slug: "assessoria-juridica",      label: "Assessoria Jurídica",     icon: "⚖️", desc: "Advogados especializados em legislação" },
  { value: "TREINAMENTO",  slug: "treinamento-tatico",       label: "Treinamento Tático",      icon: "🛡️", desc: "Instrutores, academias e cursos" },
  { value: "MANUTENCAO",   slug: "manutencao-reparos",       label: "Manutenção e Reparos",    icon: "🔧", desc: "Armeiros, oxidadores e customização" },
  { value: "IMPORTACAO",   slug: "importacao-exportacao",    label: "Importação / Exportação", icon: "📦", desc: "Representantes e importadoras de marcas" },
  { value: "TRANSPORTE",   slug: "transporte-especializado", label: "Transporte Especializado",icon: "🚛", desc: "Empresas habilitadas para carga de armas" },
  { value: "SEGURO",       slug: "seguros",                  label: "Seguros",                 icon: "🏥", desc: "Coberturas para coleções e armas" },
  { value: "OUTROS",       slug: "outros",                   label: "Outros",                  icon: "📋", desc: "Outros serviços do setor" },
] as const;

export const STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO",
  "MA","MG","MS","MT","PA","PB","PE","PI","PR",
  "RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

export const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  FREE:      { label: "Gratuito",  color: "bg-[#141d2c] text-[#526888]" },
  PREMIUM:   { label: "Premium",   color: "bg-[#1a1a40] text-[#818cf8]" },
  DESTAQUE:  { label: "Destaque",  color: "bg-[#260a0a] text-[#ff1f1f]" },
};

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendente",  color: "bg-[#1a1a0a] text-[#facc15]" },
  ACTIVE:    { label: "Ativo",     color: "bg-[#0f381f] text-[#22c55e]" },
  SUSPENDED: { label: "Suspenso",  color: "bg-[#141d2c] text-[#526888]" },
};

export function categoryBySlug(slug: string) {
  return CATEGORIES.find(c => c.slug === slug);
}

export function categoryByValue(value: string) {
  return CATEGORIES.find(c => c.value === value);
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
