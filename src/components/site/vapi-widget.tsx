import { useEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import type Vapi from "@vapi-ai/web";
import { ClientOnly } from "./client-only";
import { cn } from "@/lib/utils";
import { createActionDispatcher } from "@/lib/vapi-integration/actions";
import { attachToolHandlers } from "@/lib/vapi-integration/tool-handlers";

/**
 * Why this SDK isn't imported from npm directly, and isn't loaded from
 * Vapi's official jsDelivr CDN embed either — both were tried and both
 * failed in production, for two different, unrelated reasons:
 *
 * 1. npm import (`import Vapi from "@vapi-ai/web"`): this project's bundler
 *    (Rolldown, via Vite 8 — new, still rough) mis-resolves the browser
 *    polyfill for Node's `events` builtin that the SDK's CJS build requires,
 *    so `class VapiEventEmitter extends events_1.default` throws "Class
 *    extends value #<Object> is not a constructor" before any app code runs.
 *
 * 2. Vapi's official CDN embed (cdn.jsdelivr.net/gh/VapiAI/html-script-tag):
 *    sidesteps bug #1 (loaded as a plain <script>, outside the bundler
 *    entirely) but that repo hardcodes an old `@vapi-ai/web@2.2.5`, which
 *    pulls a `@daily-co/daily-js` version Daily's own servers now reject
 *    mid-call ("daily-js version 0.85.0 is no longer supported") — calls
 *    connect, then get ejected. Confirmed via production console logs.
 *
 * Fix: bundle the *current* `@vapi-ai/web` (which now depends on a
 * supported daily-js) ourselves with esbuild — a different, well-tested
 * bundler whose CJS interop doesn't hit bug #1 — and ship the output as a
 * static asset at /vendor/vapi-web-sdk.js, loaded via a plain <script> tag
 * so this project's own bundler never touches it either. Verified end-to-end
 * in a real DOM environment before shipping; see the deliverable notes for
 * the rebuild command if @vapi-ai/web needs bumping again later.
 */
const SCRIPT_SRC = "/vendor/vapi-web-sdk.js";

declare global {
  interface Window {
    OmnielVapiCtor?: typeof Vapi;
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadVapiScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.OmnielVapiCtor) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load the voice assistant script."));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

/* The states the assistant can actually be in, and which the interface has to
   distinguish. "active" alone was not enough: a visitor could not tell whether
   OMNIEL was listening to them or talking to them, which is the one thing a
   voice interface must make obvious. */
type CallState = "idle" | "loading" | "connecting" | "listening" | "speaking" | "error";

const STATE_LABEL: Record<CallState, string> = {
  idle: "Talk to OMNIEL",
  loading: "Starting…",
  connecting: "Connecting…",
  listening: "Listening",
  speaking: "OMNIEL is speaking",
  error: "Try again",
};

function VapiWidgetInner() {
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);
  const detachRef = useRef<() => void>(() => {});
  const [state, setState] = useState<CallState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const publicKey = import.meta.env["VITE_VAPI_PUBLIC_KEY"] as string | undefined;
  const assistantId = import.meta.env["VITE_VAPI_ASSISTANT_ID"] as string | undefined;

  useEffect(() => {
    return () => detachRef.current();
  }, []);

  if (!publicKey || !assistantId) {
    console.warn(
      "[VAPI ERROR] VITE_VAPI_PUBLIC_KEY / VITE_VAPI_ASSISTANT_ID not set — voice assistant disabled.",
    );
    return null;
  }

  async function ensureClient(): Promise<Vapi> {
    if (vapiRef.current) return vapiRef.current;
    await loadVapiScript();
    const Ctor = window.OmnielVapiCtor;
    if (!Ctor)
      throw new Error("Voice assistant script loaded but did not register its constructor.");
    const vapi = new Ctor(publicKey as string);
    detachRef.current = attachToolHandlers(vapi, createActionDispatcher(router));
    vapi.on("call-start", () => {
      console.log("[VAPI CONNECTED]");
      setState("listening");
    });
    vapi.on("call-end", () => setState("idle"));
    // Distinguishes "OMNIEL is talking" from "OMNIEL is waiting for you".
    vapi.on("speech-start", () => setState("speaking"));
    vapi.on("speech-end", () => setState("listening"));
    vapi.on("call-start-failed", (event: unknown) => {
      console.error("[VAPI ERROR] call-start-failed", event);
      setState("error");
      setErrorMessage("Couldn't connect the call. Check your network and try again.");
    });
    vapi.on("error", (err: unknown) => {
      console.error("[VAPI ERROR]", err);
      setState("error");
      setErrorMessage("Couldn't connect the call. Check your network and try again.");
    });
    vapiRef.current = vapi;
    return vapi;
  }

  async function handleClick() {
    if (isLive) {
      vapiRef.current?.stop();
      setState("idle");
      return;
    }
    setErrorMessage(null);
    setState("loading");
    try {
      const vapi = await ensureClient();
      setState("connecting");
      await vapi.start(assistantId as string);
    } catch (err) {
      console.error("[VAPI ERROR] failed to load or start the voice assistant", err);
      setState("error");
      setErrorMessage("Voice assistant couldn't load. Try refreshing the page.");
    }
  }

  const isBusy = state === "loading" || state === "connecting";
  const isLive = state === "listening" || state === "speaking";

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Announced to screen readers, so a non-sighted visitor knows whether
          OMNIEL is listening or speaking without watching a dot. */}
      <p className="sr-only" role="status" aria-live="polite">
        {STATE_LABEL[state]}
      </p>

      {errorMessage && (
        <p className="panel max-w-[15rem] rounded-2xl px-4 py-3 text-right text-xs leading-relaxed text-muted-foreground">
          {errorMessage}
        </p>
      )}

      {isLive && (
        <p className="panel rounded-full px-4 py-2 text-xs text-muted-foreground">
          {state === "speaking" ? "OMNIEL is speaking" : "Listening…"}
        </p>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={isBusy}
        aria-label={isLive ? "End the call with OMNIEL" : "Talk to OMNIEL"}
        className={cn(
          // Sized for a thumb (44px minimum), and built from OMNIEL's own
          // tokens rather than a raw Tailwind palette, so it reads as part of
          // the site instead of a pasted-on third-party widget.
          "group flex h-14 items-center gap-3 rounded-full px-5 text-sm font-medium",
          "transition-[transform,background-color,border-color] duration-[var(--motion-base)]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60",
          "hover:-translate-y-0.5 active:translate-y-0",
          isLive
            ? "border border-hairline bg-surface-strong text-foreground backdrop-blur-xl"
            : "bg-primary text-primary-foreground",
        )}
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
          {/* One pulse, only while OMNIEL is actually speaking: motion that
              reports state rather than decorating. */}
          {state === "speaking" && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ion)] opacity-70" />
          )}
          <span
            className={cn(
              "relative inline-flex h-2.5 w-2.5 rounded-full",
              state === "error" ? "bg-destructive" : isLive ? "bg-[var(--ion)]" : "bg-current",
            )}
          />
        </span>
        {isLive ? "End call" : STATE_LABEL[state]}
      </button>
    </div>
  );
}

/** Public entry point — mount once near the root. Renders nothing during SSR/hydration. */
export function VapiWidget() {
  return (
    <ClientOnly>
      <VapiWidgetInner />
    </ClientOnly>
  );
}
