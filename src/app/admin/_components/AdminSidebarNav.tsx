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
  {
    items: [
      { href: "/admin", label: "Dashboard", exact: true },
    ],
  },
  {
    title: "Usuários",
    items: [
      { href: "/admin/usuarios", label: "Usuários" },
      { href: "/admin/assinantes", label: "Assinantes", indent: true },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { href: "/admin/edicoes", label: "Edições" },
      { href: "/admin/artigos", label: "Artigos" },
      { href: "/admin/categorias", label: "Categorias" },
    ],
  },
  {
    title: "Anunciantes",
    items: [
      { href: "/admin/anunciantes", label: "Empresas", exact: true },
      { href: "/admin/anunciantes/pipeline", label: "Pipeline", indent: true },
      { href: "/admin/anuncios", label: "Banners" },
    ],
  },
  {
    title: "Loja",
    items: [
      { href: "/admin/loja", label: "Loja", exact: true },
      { href: "/admin/loja/categorias", label: "Categorias", indent: true },
      { href: "/admin/loja/produtos", label: "Produtos", indent: true },
      { href: "/admin/loja/pedidos", label: "Pedidos", indent: true },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/admin/hero", label: "Hero" },
      { href: "/admin/design", label: "Design System" },
      { href: "/admin/planos", label: "Planos" },
      { href: "/admin/pagamentos", label: "Pagamentos" },
      { href: "/admin/solicitacoes", label: "Solicitações" },
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
            <p className="text-[#526888] text-[10px] font-bold tracking-[1.5px] uppercase px-3 mt-4 mb-1">
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
                className={`flex items-center gap-2.5 py-2 rounded-[8px] text-[14px] mb-0.5 transition-colors ${
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
