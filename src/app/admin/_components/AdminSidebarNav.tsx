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
  // ── Topo ────────────────────────────────────────────────────────────
  {
    items: [
      { href: "/admin",               label: "Dashboard",    exact: true },
      { href: "/admin/pagamentos",    label: "Pagamentos" },
      { href: "/admin/visualizacoes", label: "Visualizações" },
    ],
  },

  // ── USUÁRIOS ─────────────────────────────────────────────────────────
  {
    title: "Usuários",
    items: [
      { href: "/admin/usuarios",               label: "Usuários",     exact: true },
      { href: "/admin/assinantes",             label: "Assinantes",   indent: true },
      { href: "/admin/empresas",               label: "Empresas",     indent: true },
      { href: "/admin/anunciantes",            label: "Anunciantes",  indent: true, exact: true },
      { href: "/admin/solicitacoes",           label: "Solicitações", indent: true },
      { href: "/admin/anunciantes/pipeline",   label: "Pipeline",     indent: true },
    ],
  },

  // ── ANUNCIANTES ───────────────────────────────────────────────────────
  {
    title: "Anunciantes",
    items: [
      { href: "/admin/guia",    label: "Guia Magnum" },
      { href: "/admin/anuncios", label: "Banners", indent: true },
    ],
  },

  // ── LOJA ─────────────────────────────────────────────────────────────
  {
    title: "Loja",
    items: [
      { href: "/admin/loja/pedidos",    label: "Pedidos" },
      { href: "/admin/loja/categorias", label: "Categorias", indent: true },
      { href: "/admin/loja/produtos",   label: "Produtos",   indent: true },
    ],
  },

  // ── PLANOS ────────────────────────────────────────────────────────────
  {
    title: "Planos",
    items: [
      { href: "/admin/planos",        label: "Assinatura Magnum Online", exact: true },
      { href: "/admin/planos/guia",   label: "Guia Magnum",              indent: true },
      { href: "/admin/planos/banner", label: "Banner",                   indent: true },
    ],
  },

  // ── CONTEÚDO ──────────────────────────────────────────────────────────
  {
    title: "Conteúdo",
    items: [
      { href: "/admin/edicoes",    label: "Edições" },
      { href: "/admin/artigos",    label: "Artigos",    indent: true },
      { href: "/admin/categorias", label: "Categorias", indent: true },
    ],
  },

  // ── PÁGINAS ───────────────────────────────────────────────────────────
  {
    title: "Páginas",
    items: [
      { href: "/admin/paginas",      label: "Listar / Adicionar" },
      { href: "/admin/paginas/menu", label: "Menu", indent: true },
    ],
  },

  // ── MÍDIAS ────────────────────────────────────────────────────────────
  {
    title: "Mídias",
    items: [
      { href: "/admin/midias",            label: "Listar" },
      { href: "/admin/midias/nova",       label: "Adicionar Mídia",    indent: true },
      { href: "/admin/midias/categorias", label: "Categorias",         indent: true },
    ],
  },

  // ── SESSÕES ───────────────────────────────────────────────────────────
  {
    title: "Sessões",
    items: [
      { href: "/admin/hero",         label: "Hero" },
      { href: "/admin/galeria",      label: "Galeria",    indent: true },
      { href: "/admin/formularios",  label: "Formulários", indent: true },
    ],
  },

  // ── CONFIGURAÇÕES ─────────────────────────────────────────────────────
  {
    title: "Configurações",
    items: [
      { href: "/admin/configuracoes", label: "Configurações", exact: true },
      { href: "/admin/design",        label: "Design System", indent: true },
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
