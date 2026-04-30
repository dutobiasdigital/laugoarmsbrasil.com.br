"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

type Child = { href: string; label: string; exact?: boolean };
type DirectEntry = { type: "link"; href: string; label: string; icon: React.ReactNode; exact?: boolean };
type SectionEntry = { type: "section"; key: string; label: string; icon: React.ReactNode; children: Child[] };
type NavEntry = DirectEntry | SectionEntry;

// ── Icons (Heroicons outline 24px) ─────────────────────────────────────────
function Ico({ path, title }: { path: string; title?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      className="w-[18px] h-[18px] shrink-0" aria-label={title}>
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  home:         <Ico path="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />,
  creditCard:   <Ico path="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />,
  chartBar:     <Ico path="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  users:        <Ico path="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
  megaphone:    <Ico path="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />,
  cart:         <Ico path="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />,
  layers:       <Ico path="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />,
  mapPin:       <Ico path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />,
  document:     <Ico path="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
  layout:       <Ico path="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
  photo:        <Ico path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
  cube:         <Ico path="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
  building:     <Ico path="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />,
  cog:          <Ico path="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  chevronLeft:  <Ico path="M15.75 19.5L8.25 12l7.5-7.5" />,
  chevronRight: <Ico path="M8.25 4.5l7.5 7.5-7.5 7.5" />,
  chevronDown:  <Ico path="M19.5 8.25l-7.5 7.5-7.5-7.5" />,
};

const NAV: NavEntry[] = [
  { type: "link", href: "/admin", label: "Painel", icon: ICONS.home, exact: true },
  { type: "section", key: "loja", label: "Loja", icon: ICONS.cart, children: [
    { href: "/admin/loja/produtos",   label: "Produtos" },
    { href: "/admin/loja/categorias", label: "Categorias" },
    { href: "/admin/loja/pedidos",    label: "Pedidos" },
  ]},
  { type: "link", href: "/admin/hero",       label: "Hero",      icon: ICONS.layout },
  { type: "link", href: "/admin/galerias",   label: "Galerias",  icon: ICONS.photo },
  { type: "link", href: "/admin/artigos",    label: "Artigos",   icon: ICONS.document },
  { type: "link", href: "/admin/navegacao",  label: "Navegação", icon: ICONS.layers },
  { type: "link", href: "/admin/midias",     label: "Mídias",    icon: ICONS.photo },
  { type: "link", href: "/admin/configuracoes", label: "Configurações", icon: ICONS.cog },
];

function isChildActive(pathname: string, children: Child[]) {
  return children.some((c) =>
    c.exact ? pathname === c.href : pathname.startsWith(c.href)
  );
}

export default function AdminSidebarNav({ collapsed, onToggle }: Props) {
  const pathname = usePathname();

  // Auto-open sections whose child is active
  const [open, setOpen] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    NAV.forEach((e) => {
      if (e.type === "section" && isChildActive(pathname, e.children)) {
        initial.add(e.key);
      }
    });
    return initial;
  });

  // Re-compute on route change
  useEffect(() => {
    NAV.forEach((e) => {
      if (e.type === "section" && isChildActive(pathname, e.children)) {
        setOpen((prev) => new Set([...prev, e.key]));
      }
    });
  }, [pathname]);

  function toggleSection(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const itemBase = "flex items-center gap-3 rounded-[8px] transition-colors duration-150 cursor-pointer select-none";
  const activeLink = "bg-[#1a0a0a] text-white border-l-2 border-[#ff1f1f]";
  const inactiveLink = "text-[#7a9ab5] hover:bg-[#141d2c] hover:text-white";

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable nav area */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
        {NAV.map((entry) => {
          if (entry.type === "link") {
            const active = entry.exact
              ? pathname === entry.href
              : pathname.startsWith(entry.href);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                title={collapsed ? entry.label : undefined}
                className={`${itemBase} h-[40px] ${collapsed ? "justify-center px-0" : "px-3"} ${active ? activeLink : inactiveLink}`}
              >
                {entry.icon}
                {!collapsed && <span className="text-[13px] font-medium truncate">{entry.label}</span>}
              </Link>
            );
          }

          // Section entry
          const isOpen = open.has(entry.key);
          const anyChildActive = isChildActive(pathname, entry.children);

          return (
            <div key={entry.key}>
              {/* Section header */}
              <button
                type="button"
                title={collapsed ? entry.label : undefined}
                onClick={() => !collapsed && toggleSection(entry.key)}
                className={`${itemBase} w-full h-[40px] ${collapsed ? "justify-center px-0" : "px-3 justify-between"} ${anyChildActive && collapsed ? "text-white" : anyChildActive ? "text-white" : inactiveLink}`}
              >
                <div className="flex items-center gap-3">
                  {entry.icon}
                  {!collapsed && <span className="text-[13px] font-medium">{entry.label}</span>}
                </div>
                {!collapsed && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    className={`w-[13px] h-[13px] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
              </button>

              {/* Sub-items — only when expanded sidebar + section open */}
              {!collapsed && isOpen && (
                <div className="ml-[14px] pl-[14px] border-l border-[#1c2a3e] mt-0.5 mb-1 space-y-0.5">
                  {entry.children.map((child) => {
                    const childActive = child.exact
                      ? pathname === child.href
                      : pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center h-[32px] px-2 rounded-[6px] text-[12px] transition-colors ${childActive ? "text-white font-semibold" : "text-[#7a9ab5] hover:text-white hover:bg-[#141d2c]"}`}
                      >
                        {childActive && <span className="w-[4px] h-[4px] rounded-full bg-[#ff1f1f] mr-2 shrink-0" />}
                        {!childActive && <span className="w-[4px] h-[4px] mr-2 shrink-0" />}
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center border-t border-[#141d2c] h-[44px] transition-colors text-[#526888] hover:text-white hover:bg-[#141d2c] ${collapsed ? "justify-center" : "justify-end px-4 gap-2"}`}
      >
        {!collapsed && <span className="text-[11px]">Recolher</span>}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          className="w-[16px] h-[16px]">
          <path d={collapsed ? "M8.25 4.5l7.5 7.5-7.5 7.5" : "M15.75 19.5L8.25 12l7.5-7.5"} />
        </svg>
      </button>
    </div>
  );
}
