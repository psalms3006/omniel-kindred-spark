import type { D1Database } from "./store";

/**
 * Access to Cloudflare Worker bindings from inside a route handler.
 *
 * Nitro attaches the Worker environment to the request as
 * `request.runtime.cloudflare.env` and also publishes it as
 * `globalThis.__env__` for code that does not hold the request. String
 * environment variables may additionally arrive in `process.env` when
 * `nodejs_compat` is enabled.
 *
 * Reading the request-scoped copy first matters: it is the exact environment
 * Cloudflare passed to this invocation, so a route can never see a stale
 * module-level environment from another request or test.
 */

type CloudflareEnv = Record<string, unknown> & {
  ENQUIRIES_DB?: D1Database;
};

type RequestWithRuntime = Request & {
  runtime?: {
    cloudflare?: {
      env?: CloudflareEnv;
    };
  };
};

export function getCloudflareEnv(request?: Request): CloudflareEnv | undefined {
  const requestEnv = (request as RequestWithRuntime | undefined)?.runtime?.cloudflare?.env;
  if (requestEnv && typeof requestEnv === "object" && Object.keys(requestEnv).length > 0) {
    return requestEnv;
  }

  const env = (globalThis as { __env__?: CloudflareEnv }).__env__;
  return env && typeof env === "object" ? env : undefined;
}

/** The D1 binding, or undefined when running somewhere it does not exist. */
export function getEnquiriesDb(request?: Request): D1Database | undefined {
  return getCloudflareEnv(request)?.ENQUIRIES_DB ?? getCloudflareEnv()?.ENQUIRIES_DB;
}

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

/**
 * Reads a string config value from the request-scoped Worker env, then the
 * published Worker env, then `process.env` for local development and tests.
 *
 * Returns undefined rather than throwing so callers can report a deliberate
 * configuration error instead of crashing the whole route.
 */
export function getConfig(name: string, request?: Request): string | undefined {
  const fromRequest = asNonEmptyString(getCloudflareEnv(request)?.[name]);
  if (fromRequest) return fromRequest;

  const env = (globalThis as { __env__?: CloudflareEnv }).__env__;
  const fromGlobal = asNonEmptyString(env?.[name]);
  if (fromGlobal) return fromGlobal;

  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  return asNonEmptyString(fromProcess);
}

/** Best-effort visitor IP, used only to improve Turnstile scoring. */
export function getRemoteIp(request: Request): string | undefined {
  return request.headers.get("cf-connecting-ip") ?? undefined;
}
