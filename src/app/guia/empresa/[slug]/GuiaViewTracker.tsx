"use client";

import { useEffect } from "react";

export default function GuiaViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch("/api/guia/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);
  return null;
}
