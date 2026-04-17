"use client";

import { useEffect, useRef } from "react";

/**
 * ViewTracker — dispara um POST no endpoint informado uma única vez por montagem.
 * Usado para registrar visualizações de artigos, produtos, etc.
 *
 * Usage:
 *   <ViewTracker endpoint="/api/articles/meu-artigo/view" />
 */
export default function ViewTracker({ endpoint }: { endpoint: string }) {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    fetch(endpoint, { method: "POST" }).catch(() => {});
  }, [endpoint]);

  return null;
}
