"use client";

/**
 * useRecaptcha — loads reCAPTCHA v3 script and exposes executeRecaptcha(action).
 *
 * Graceful degradation: if NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set,
 * executeRecaptcha returns "" and `enabled` is false.
 *
 * Usage:
 *   const { executeRecaptcha, enabled } = useRecaptcha();
 *   ...
 *   const token = await executeRecaptcha("login");
 *   // pass `token` as _recaptchaToken in your request body / formData
 */

import { useCallback, useEffect } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

export function useRecaptcha() {
  useEffect(() => {
    if (!SITE_KEY) return;
    // Already loaded
    if (document.querySelector(`script[data-recaptcha]`)) return;

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.dataset.recaptcha = "1";
    document.head.appendChild(script);
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string> => {
      if (!SITE_KEY) return "";
      return new Promise<string>((resolve) => {
        if (typeof window === "undefined" || !window.grecaptcha) {
          resolve("");
          return;
        }
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(SITE_KEY, {
              action,
            });
            resolve(token);
          } catch {
            resolve("");
          }
        });
      });
    },
    []
  );

  return { executeRecaptcha, enabled: !!SITE_KEY };
}
