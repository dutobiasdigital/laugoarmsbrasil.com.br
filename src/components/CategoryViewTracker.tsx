"use client";

import { useEffect, useRef } from "react";

/**
 * CategoryViewTracker — dispara um POST no endpoint com a categoria informada.
 * Só registra a visualização quando o componente monta (ou seja, quando o usuário
 * clica em uma categoria para filtrar — o URL muda e o componente re-monta).
 *
 * Usage:
 *   <CategoryViewTracker category="Armas de Defesa" endpoint="/api/blog/categoria/view" />
 *   <CategoryViewTracker category="armeiros" endpoint="/api/guia/categoria/view" />
 */
export default function CategoryViewTracker({
  category,
  endpoint,
}: {
  category: string;
  endpoint: string;
}) {
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (!category || prev.current === category) return;
    prev.current = category;
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    }).catch(() => {});
  }, [category, endpoint]);

  return null;
}
