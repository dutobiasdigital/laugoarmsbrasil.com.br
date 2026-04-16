"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  indent?: boolean;
};

type Section = {
  title?: string;
  items: NavItem[];
};

const SECTIONS: Section[] = [
  // ── Topo (no section title)
  {
    items: [
      { href: "/admin",               label: "Painel",       exact: true },
      { href: "/admin/pagamentos",    label: "Pagamentos" },
      { href: "/admin/visualizacoes", label: "Visualizações" },
    ],
  },

  // ── USUÁRIOS — only sub-items (no top-level link)
  {
    title: "Usuários",
    items: [
      { href: "/admin/assinantes",           label: "Assinantes",   indent: true },
      { href: "/admin/empresas",             label: "Empresas",     indent: true },
      { href: "/admin/anunciantes",          label: "Anunciantes",  indent: true, exact: true },
      { href: "/admin/solicitacoes",         label: "Solicitações", indent: true },
      { href: "/admin/anunciantes/pipeline", label: "Pipeline",     indent: true },
    ],
  },

  // ── PUBLICIDADE — only sub-items
  {
    title: "Publicidade",
    items: [
      { href: "/admin/guia",    label: "Guia",    indent: true },
      { href: "/admin/anuncios", label: "Banners", indent: true },
    ],
  },

  // ── LOJA — only sub-items
  {
    title: "Loja",
    items: [
      { href: "/admin/loja/pedidos",    label: "Pedidos",    indent: true },
      { href: "/admin/loja/categorias", label: "Categorias", indent: true },
      { href: "/admin/loja/produtos",   label: "Produtos",   indent: true },
    ],
  },

  // ── PLANOS — only sub-items
  {
    title: "Planos",
    items: [
      { href: "/admin/planos",        label: "Assinatura Online", indent: true, exact: true },
      { href: "/admin/planos/guia",   label: "Guia Magnum",       indent: true },
      { href: "/admin/planos/banner", label: "Banners",           indent: true },
    ],
  },

  // ── CONTEÚDOS — only sub-items
  {
    title: "Conteúdos",
    items: [
      { href: "/admin/edicoes",    label: "Edições",    indent: true },
      { href: "/admin/artigos",    label: "Artigos",    indent: true },
      { href: "/admin/categorias", label: "Categorias", indent: true },
    ],
  },

  // ── PÁGINAS — only sub-items
  {
    title: "Páginas",
    items: [
      { href: "/admin/paginas",      label: "Listar",    indent: true },
      { href: "/admin/paginas/nova", label: "Adicionar", indent: true },
      { href: "/admin/paginas/menu", label: "Menu",      indent: true },
    ],
  },

  // ── MÍDIAS — only sub-items
  {
    title: "Mídias",
    items: [
      { href: "/admin/midias",            label: "Listar",     indent: true },
      { href: "/admin/midias/nova",       label: "Adicionar",  indent: true },
      { href: "/admin/midias/categorias", label: "Categorias", indent: true },
    ],
  },

  // ── SESSÕES — only sub-items
  {
    title: "Sessões",
    items: [
      { href: "/admin/sessoes",            label: "Listar",     indent: true },
      { href: "/admin/sessoes/nova",       label: "Adicionar",  indent: true },
      { href: "/admin/sessoes/categorias", label: "Categorias", indent: true },
    ],
  },

  // ── CONFIGURAÇÕES — single item, no indent
  {
    title: "Configurações",
    items: [
      { href: "/admin/configuracoes", label: "Configurações" },
    ],
  },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {SECTIONS.map((section, si) => (
        <div key={si}>
          {section.title && (
            <p className="text-[#526888] text-[10px] font-bold tracking-[1.5px] uppercase px-3 mt-5 mb-1">
              {section.title}
            </p>
          )}
          {section.items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 py-[7px] rounded-[8px] text-[14px] mb-0.5 transition-colors ${
                  item.indent ? "pl-6 pr-3 text-[13px]" : "px-3"
                } ${
                  isActive
                    ? "bg-[#260a0a] border border-[#ff1f1f] text-white font-semibold"
                    : "text-[#7a9ab5] hover:text-white hover:bg-[#141d2c]"
                }`}
              >
                {item.indent && (
                  <span className={`text-[10px] ${isActive ? "text-[#ff1f1f]" : "text-[#526888]"}`}>
                    ›
                  </span>
                )}
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
