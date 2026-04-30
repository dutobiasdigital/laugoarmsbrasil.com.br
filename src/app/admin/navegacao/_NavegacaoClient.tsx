"use client";

import { useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface MenuChild {
  id: string;
  label: string;
  url: string;
  isActive: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  url: string;
  isActive: boolean;
  children: MenuChild[];
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterCol {
  id: string;
  title: string;
  links: FooterLink[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function parseMenu(json: string): MenuItem[] {
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return [];
    return arr.map((item: Partial<MenuItem>) => ({
      id:       item.id       ?? uid(),
      label:    item.label    ?? "",
      url:      item.url      ?? "",
      isActive: item.isActive !== false,
      children: Array.isArray(item.children)
        ? item.children.map((c: Partial<MenuChild>) => ({
            id:       c.id       ?? uid(),
            label:    c.label    ?? "",
            url:      c.url      ?? "",
            isActive: c.isActive !== false,
          }))
        : [],
    }));
  } catch {
    return [];
  }
}

function parseFooter(json: string): FooterCol[] {
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr) || arr.length === 0) {
      return defaultFooterCols();
    }
    return arr.map((col: Partial<FooterCol>) => ({
      id:    col.id    ?? uid(),
      title: col.title ?? "",
      links: Array.isArray(col.links)
        ? col.links.map((l: Partial<FooterLink>) => ({
            id:    l.id    ?? uid(),
            label: l.label ?? "",
            url:   l.url   ?? "",
          }))
        : [],
    }));
  } catch {
    return defaultFooterCols();
  }
}

function defaultFooterCols(): FooterCol[] {
  return [
    { id: uid(), title: "Empresa",  links: [] },
    { id: uid(), title: "Produtos", links: [] },
    { id: uid(), title: "Contato",  links: [] },
  ];
}

// ── Styles ──────────────────────────────────────────────────────────────────

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[36px] px-3 text-[13px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#CB0A0E]";

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  menuJson:   string;
  footerJson: string;
}

export default function NavegacaoClient({ menuJson, footerJson }: Props) {
  const [tab, setTab] = useState<"menu" | "footer">("menu");

  // ── Menu state ──
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => parseMenu(menuJson));
  const [menuSaving, setMenuSaving]   = useState(false);
  const [menuSuccess, setMenuSuccess] = useState(false);
  const [menuError, setMenuError]     = useState<string | null>(null);

  // ── Footer state ──
  const [footerCols, setFooterCols] = useState<FooterCol[]>(() => parseFooter(footerJson));
  const [footerSaving, setFooterSaving]   = useState(false);
  const [footerSuccess, setFooterSuccess] = useState(false);
  const [footerError, setFooterError]     = useState<string | null>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // Menu handlers
  // ──────────────────────────────────────────────────────────────────────────

  function addMenuItem() {
    setMenuItems((prev) => [
      ...prev,
      { id: uid(), label: "", url: "", isActive: true, children: [] },
    ]);
  }

  function updateMenuItem(id: string, field: keyof Omit<MenuItem, "id" | "children">, value: string | boolean) {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeMenuItem(id: string) {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  }

  function moveMenuItem(idx: number, dir: -1 | 1) {
    const next = [...menuItems];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setMenuItems(next);
  }

  function addChild(parentId: string) {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === parentId
          ? { ...item, children: [...item.children, { id: uid(), label: "", url: "", isActive: true }] }
          : item
      )
    );
  }

  function updateChild(
    parentId: string,
    childId: string,
    field: keyof Omit<MenuChild, "id">,
    value: string | boolean
  ) {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === parentId
          ? {
              ...item,
              children: item.children.map((c) =>
                c.id === childId ? { ...c, [field]: value } : c
              ),
            }
          : item
      )
    );
  }

  function removeChild(parentId: string, childId: string) {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === parentId
          ? { ...item, children: item.children.filter((c) => c.id !== childId) }
          : item
      )
    );
  }

  const saveMenu = useCallback(async () => {
    setMenuSaving(true);
    setMenuError(null);
    setMenuSuccess(false);

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "nav.menu": JSON.stringify(menuItems) }),
    });

    const data = await res.json();
    setMenuSaving(false);
    if (!res.ok) {
      setMenuError(data.error || "Erro ao salvar menu.");
    } else {
      setMenuSuccess(true);
      setTimeout(() => setMenuSuccess(false), 3000);
    }
  }, [menuItems]);

  // ──────────────────────────────────────────────────────────────────────────
  // Footer handlers
  // ──────────────────────────────────────────────────────────────────────────

  function updateColTitle(colId: string, title: string) {
    setFooterCols((prev) =>
      prev.map((col) => (col.id === colId ? { ...col, title } : col))
    );
  }

  function addLink(colId: string) {
    setFooterCols((prev) =>
      prev.map((col) =>
        col.id === colId
          ? { ...col, links: [...col.links, { id: uid(), label: "", url: "" }] }
          : col
      )
    );
  }

  function updateLink(colId: string, linkId: string, field: "label" | "url", value: string) {
    setFooterCols((prev) =>
      prev.map((col) =>
        col.id === colId
          ? {
              ...col,
              links: col.links.map((l) =>
                l.id === linkId ? { ...l, [field]: value } : l
              ),
            }
          : col
      )
    );
  }

  function removeLink(colId: string, linkId: string) {
    setFooterCols((prev) =>
      prev.map((col) =>
        col.id === colId
          ? { ...col, links: col.links.filter((l) => l.id !== linkId) }
          : col
      )
    );
  }

  const saveFooter = useCallback(async () => {
    setFooterSaving(true);
    setFooterError(null);
    setFooterSuccess(false);

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "nav.footer": JSON.stringify(footerCols) }),
    });

    const data = await res.json();
    setFooterSaving(false);
    if (!res.ok) {
      setFooterError(data.error || "Erro ao salvar footer.");
    } else {
      setFooterSuccess(true);
      setTimeout(() => setFooterSuccess(false), 3000);
    }
  }, [footerCols]);

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[860px]">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#1c2a3e]">
        {(["menu", "footer"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-[40px] px-5 text-[13px] font-semibold border-b-2 transition-colors ${
              tab === t
                ? "border-[#CB0A0E] text-white"
                : "border-transparent text-[#7a9ab5] hover:text-white"
            }`}
          >
            {t === "menu" ? "Menu Principal" : "Footer"}
          </button>
        ))}
      </div>

      {/* ── Menu Tab ── */}
      {tab === "menu" && (
        <div>
          {menuError && (
            <div className="bg-[#2d0a0a] border border-[#CB0A0E] rounded-[8px] px-4 py-3 mb-4 text-[#ff6b6b] text-[13px]">
              {menuError}
            </div>
          )}
          {menuSuccess && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-[8px] px-4 py-3 mb-4 text-green-400 text-[13px]">
              Menu salvo com sucesso!
            </div>
          )}

          <div className="flex flex-col gap-3 mb-5">
            {menuItems.length === 0 && (
              <p className="text-[#526888] text-[13px] py-4 text-center">Nenhum item no menu. Adicione abaixo.</p>
            )}
            {menuItems.map((item, idx) => (
              <div key={item.id} className="bg-[#0d1520] border border-[#1c2a3e] rounded-[8px] p-4">
                {/* Item row */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#526888] text-[11px] font-mono w-[20px] text-center">{idx + 1}</span>
                  <input
                    value={item.label}
                    onChange={(e) => updateMenuItem(item.id, "label", e.target.value)}
                    className={inputCls + " flex-1"}
                    placeholder="Label"
                  />
                  <input
                    value={item.url}
                    onChange={(e) => updateMenuItem(item.id, "url", e.target.value)}
                    className={inputCls + " flex-1"}
                    placeholder="URL  ex: /loja"
                  />
                  {/* Toggle ativo */}
                  <button
                    type="button"
                    onClick={() => updateMenuItem(item.id, "isActive", !item.isActive)}
                    title={item.isActive ? "Ativo — clique para desativar" : "Inativo — clique para ativar"}
                    className={`shrink-0 w-[32px] h-[32px] rounded-[6px] flex items-center justify-center text-[11px] font-bold transition-colors ${
                      item.isActive
                        ? "bg-green-900/40 text-green-400 border border-green-700/50"
                        : "bg-zinc-800/40 text-zinc-500 border border-zinc-700/40"
                    }`}
                  >
                    {item.isActive ? "ON" : "OFF"}
                  </button>
                  {/* Move up/down */}
                  <button
                    type="button"
                    onClick={() => moveMenuItem(idx, -1)}
                    disabled={idx === 0}
                    className="shrink-0 w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#7a9ab5] hover:text-white hover:bg-[#1c2a3e] disabled:opacity-30 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveMenuItem(idx, 1)}
                    disabled={idx === menuItems.length - 1}
                    className="shrink-0 w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#7a9ab5] hover:text-white hover:bg-[#1c2a3e] disabled:opacity-30 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* Add sub-item */}
                  <button
                    type="button"
                    onClick={() => addChild(item.id)}
                    title="Adicionar sub-item"
                    className="shrink-0 w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#7a9ab5] hover:text-white hover:bg-[#1c2a3e] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                  </button>
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeMenuItem(item.id)}
                    className="shrink-0 w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#526888] hover:text-red-400 hover:bg-[#1c2a3e] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Sub-items */}
                {item.children.length > 0 && (
                  <div className="ml-[28px] mt-2 flex flex-col gap-2 border-l border-[#1c2a3e] pl-3">
                    {item.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-2">
                        <input
                          value={child.label}
                          onChange={(e) => updateChild(item.id, child.id, "label", e.target.value)}
                          className={inputCls + " flex-1"}
                          placeholder="Label sub-item"
                        />
                        <input
                          value={child.url}
                          onChange={(e) => updateChild(item.id, child.id, "url", e.target.value)}
                          className={inputCls + " flex-1"}
                          placeholder="URL"
                        />
                        <button
                          type="button"
                          onClick={() => updateChild(item.id, child.id, "isActive", !child.isActive)}
                          title={child.isActive ? "Ativo" : "Inativo"}
                          className={`shrink-0 w-[32px] h-[32px] rounded-[6px] flex items-center justify-center text-[11px] font-bold transition-colors ${
                            child.isActive
                              ? "bg-green-900/40 text-green-400 border border-green-700/50"
                              : "bg-zinc-800/40 text-zinc-500 border border-zinc-700/40"
                          }`}
                        >
                          {child.isActive ? "ON" : "OFF"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeChild(item.id, child.id)}
                          className="shrink-0 w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#526888] hover:text-red-400 hover:bg-[#1c2a3e] transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={addMenuItem}
              className="bg-[#141d2c] border border-[#1c2a3e] hover:border-[#526888] text-[#d4d4da] text-[13px] h-[40px] px-5 rounded-[6px] transition-colors"
            >
              + Adicionar item
            </button>
            <button
              type="button"
              onClick={saveMenu}
              disabled={menuSaving}
              className="bg-[#CB0A0E] hover:bg-[#a80009] disabled:opacity-50 text-white text-[14px] font-semibold h-[40px] px-7 rounded-[6px] transition-colors"
            >
              {menuSaving ? "Salvando..." : "Salvar Menu"}
            </button>
          </div>
        </div>
      )}

      {/* ── Footer Tab ── */}
      {tab === "footer" && (
        <div>
          {footerError && (
            <div className="bg-[#2d0a0a] border border-[#CB0A0E] rounded-[8px] px-4 py-3 mb-4 text-[#ff6b6b] text-[13px]">
              {footerError}
            </div>
          )}
          {footerSuccess && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-[8px] px-4 py-3 mb-4 text-green-400 text-[13px]">
              Footer salvo com sucesso!
            </div>
          )}

          <div className="grid grid-cols-3 gap-5 mb-5">
            {footerCols.map((col) => (
              <div key={col.id} className="bg-[#0d1520] border border-[#1c2a3e] rounded-[8px] p-4">
                <div className="mb-3">
                  <label className="block text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] mb-1.5">
                    Título da Coluna
                  </label>
                  <input
                    value={col.title}
                    onChange={(e) => updateColTitle(col.id, e.target.value)}
                    className={inputCls + " w-full"}
                    placeholder="Ex: Empresa"
                  />
                </div>

                <div className="flex flex-col gap-2 mb-3">
                  {col.links.map((link) => (
                    <div key={link.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          value={link.label}
                          onChange={(e) => updateLink(col.id, link.id, "label", e.target.value)}
                          className={inputCls + " flex-1 text-[12px]"}
                          placeholder="Label"
                        />
                        <button
                          type="button"
                          onClick={() => removeLink(col.id, link.id)}
                          className="shrink-0 w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#526888] hover:text-red-400 hover:bg-[#141d2c] transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </div>
                      <input
                        value={link.url}
                        onChange={(e) => updateLink(col.id, link.id, "url", e.target.value)}
                        className={inputCls + " w-full text-[12px]"}
                        placeholder="URL  ex: /sobre"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addLink(col.id)}
                  className="w-full h-[32px] border border-dashed border-[#1c2a3e] hover:border-[#526888] rounded-[6px] text-[#526888] hover:text-[#7a9ab5] text-[12px] transition-colors"
                >
                  + Adicionar link
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={saveFooter}
            disabled={footerSaving}
            className="bg-[#CB0A0E] hover:bg-[#a80009] disabled:opacity-50 text-white text-[14px] font-semibold h-[40px] px-7 rounded-[6px] transition-colors"
          >
            {footerSaving ? "Salvando..." : "Salvar Footer"}
          </button>
        </div>
      )}
    </div>
  );
}
