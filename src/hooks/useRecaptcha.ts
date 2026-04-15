"use client";

/**
 * useRecaptcha — loads reCAPTCHA v3 and exposes executeRecaptcha(action).
 *
 * Reads the site key from:
 *   1. process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY  (build-time env var)
 *   2. <meta name="rcsk"> injected by layout.tsx    (runtime, from site_settings)
 *
 * Graceful degradation: if no key is found, executeRecaptcha returns ""
 * and `enabled` is false — forms work normally without reCAPTCHA.
 */

import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

function resolveKey(): string {
  // 1. Build-time env var
  if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  }
  // 2. Meta tag set by layout.tsx from site_settings (runtime)
  if (typeof document !== "undefined") {
    return (
      document.querySelector('meta[name="rcsk"]')?.getAttribute("content") ?? ""
    );
  }
  return "";
}

export function useRecaptcha() {
  const [siteKey, setSiteKey] = useState("");

  useEffect(() => {
    const key = resolveKey();
    if (!key) return;
    setSiteKey(key);

    // Already loaded
    if (document.querySelector("script[data-recaptcha]")) return;

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${key}`;
    script.async = true;
    script.dataset.recaptcha = "1";
    document.head.appendChild(script);
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string> => {
      const key = siteKey || resolveKey();
      if (!key) return "";
      return new Promise<string>((resolve) => {
        if (typeof window === "undefined" || !window.grecaptcha) {
          resolve("");
          return;
        }
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(key, { action });
            resolve(token);
          } catch {
            resolve("");
          }
        });
      });
    },
    [siteKey]
  );

  return { executeRecaptcha, enabled: !!siteKey };
}
