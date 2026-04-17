"use client";

import { useEffect } from "react";

export default function GuiaViewTracker({ id }: { id: string }) {
  useEffect(() => {
    fetch("/api/guia/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }, [id]);
  return null;
}
