import { useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile widget.
 *
 * Renders nothing and reports "not configured" when VITE_TURNSTILE_SITE_KEY is
 * absent, so local development without a key still works and the form simply
 * submits without a token. The server decides whether a missing token is
 * acceptable; the client never makes that call.
 *
 * The script is loaded once per page, on demand, rather than in the document
 * head, so a visitor who never opens a form never downloads it.
 */

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  theme: "auto" | "light" | "dark";
  appearance: "always" | "execute" | "interaction-only";
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileRenderOptions) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed to load."));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export type TurnstileFieldProps = {
  /** Called with the solved token, or null when it expires or errors. */
  onToken: (token: string | null) => void;
  /** Bumping this resets the widget, which a token must do after each submit. */
  resetKey: number;
};

export function TurnstileField({ onToken, resetKey }: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  const [failed, setFailed] = useState(false);
  const siteKey = import.meta.env["VITE_TURNSTILE_SITE_KEY"] as string | undefined;

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => {
            setFailed(true);
            onTokenRef.current(null);
          },
          theme: "auto",
          // Most visitors never see anything; the challenge only appears when
          // Cloudflare decides the request needs one.
          appearance: "interaction-only",
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      if (id && window.turnstile) {
        try {
          window.turnstile.remove(id);
        } catch {
          // Removing an already-removed widget throws. Nothing to do about it.
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  // Reset after a submit so the next one gets a fresh token. Turnstile tokens
  // are single use; reusing one is rejected by the verification endpoint.
  useEffect(() => {
    if (resetKey === 0) return;
    const id = widgetIdRef.current;
    if (id && window.turnstile) {
      window.turnstile.reset(id);
      onTokenRef.current(null);
    }
  }, [resetKey]);

  if (!siteKey) return null;

  return (
    <div>
      <div ref={containerRef} />
      {failed ? (
        <p className="text-xs text-muted-foreground">
          The human-verification check could not load. You can still send the form, or email us
          directly if it does not go through.
        </p>
      ) : null}
    </div>
  );
}
