import type { D1Database } from "./store";

/**
 * Access to Cloudflare Worker bindings from inside a route handler.
 *
 * String environment variables arrive in `process.env` (nodejs_compat
 * populates it), but object bindings such as D1 do not — they only exist on
 * the Worker's `env` argument. Nitro's Cloudflare module handler assigns that
 * to `globalThis.__env__` on every request, which is the documented way to
 * reach bindings from code that is not holding the fetch handler's arguments.
 *
 * Returns undefined off-platform (local `vite dev`, unit tests) so callers can
 * degrade deliberately instead of crashing.
 */

type CloudflareEnv = Record<string, unknown> & {
  ENQUIRIES_DB?: D1Database;
};

export function getCloudflareEnv(): CloudflareEnv | undefined {
  const env = (globalThis as { __env__?: CloudflareEnv }).__env__;
  return env && typeof env === "object" ? env : undefined;
}

/** The D1 binding, or undefined when running somewhere it does not exist. */
export function getEnquiriesDb(): D1Database | undefined {
  return getCloudflareEnv()?.ENQUIRIES_DB;
}

/**
 * Reads a string config value.
 *
 * Checks the Worker env first and falls back to `process.env`, so the same
 * code works under `wrangler dev`, under `vite dev` with a .env file, and in
 * production.
 */
export function getConfig(name: string): string | undefined {
  const fromBinding = getCloudflareEnv()?.[name];
  if (typeof fromBinding === "string" && fromBinding !== "") return fromBinding;
  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  return fromProcess && fromProcess !== "" ? fromProcess : undefined;
}

/** Best-effort visitor IP, used only to improve Turnstile scoring. */
export function getRemoteIp(request: Request): string | undefined {
  return request.headers.get("cf-connecting-ip") ?? undefined;
}
