/**
 * Everything the agent needs from its environment, read once at startup.
 *
 * LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET are read by the LiveKit
 * worker itself; they are checked here only so a missing one fails at boot
 * with a clear message instead of on the first call.
 */
export type AgentConfig = {
  /** The website the agent reads from and submits to, e.g. https://omniel.com.ng */
  siteUrl: string;
  /** Sent as `x-agent-secret`; must equal AGENT_SHARED_SECRET on the website. */
  sharedSecret: string;
};

const REQUIRED = [
  "LIVEKIT_URL",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "SITE_URL",
  "AGENT_SHARED_SECRET",
] as const;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AgentConfig {
  const missing = REQUIRED.filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  return { siteUrl: env["SITE_URL"]!, sharedSecret: env["AGENT_SHARED_SECRET"]! };
}
