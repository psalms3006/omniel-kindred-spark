import { createFileRoute } from "@tanstack/react-router";
import { SignJWT } from "jose";
import { getConfig } from "@/lib/automation/runtime-env";

/**
 * POST /api/livekit/token
 *
 * Starts a voice session: returns a LiveKit access token for a room that
 * belongs to this visitor alone, plus the LiveKit server URL to connect to.
 *
 * The room name and identity are generated here, never taken from the
 * request, so one visitor can never join another's conversation. The token
 * also carries a dispatch instruction (`roomConfig.agents`), which is what
 * makes LiveKit send the OMNIEL agent into the room as soon as the visitor
 * joins — there is no separate "start the agent" call.
 *
 * Fails closed with 503 when LiveKit is not configured, so the widget can say
 * the assistant is unavailable rather than hang.
 */

/** Must match `agentName` in agent/src/main.ts. */
const AGENT_NAME = "omniel";

/** Long enough to connect; an established session outlives the token. */
const TOKEN_TTL_SECONDS = 10 * 60;

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/**
 * Only this site's own pages may start a session. A token is a metered
 * resource (speech, model, and voice minutes), so a request from another
 * origin is refused rather than paid for.
 */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export const Route = createFileRoute("/api/livekit/token")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOrigin(request)) return json({ error: "Forbidden." }, 403);

        const apiKey = getConfig("LIVEKIT_API_KEY");
        const apiSecret = getConfig("LIVEKIT_API_SECRET");
        const serverUrl = getConfig("LIVEKIT_URL");
        if (!apiKey || !apiSecret || !serverUrl) {
          console.error(
            "MISSING REQUIRED CONFIGURATION: LIVEKIT_API_KEY / LIVEKIT_API_SECRET / LIVEKIT_URL",
          );
          return json({ error: "The voice assistant is not available right now." }, 503);
        }

        const id = crypto.randomUUID();
        const roomName = `omniel-${id}`;
        const identity = `visitor-${id}`;

        try {
          const token = await new SignJWT({
            name: "Visitor",
            video: {
              room: roomName,
              roomJoin: true,
              canPublish: true,
              canSubscribe: true,
              canPublishData: true,
            },
            roomConfig: { agents: [{ agentName: AGENT_NAME }] },
          })
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .setIssuer(apiKey)
            .setSubject(identity)
            .setNotBefore("0s")
            .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
            .sign(new TextEncoder().encode(apiSecret));

          return json({ token, serverUrl, roomName }, 200);
        } catch (err) {
          console.error("[livekit] token signing failed", err);
          return json({ error: "The voice assistant is not available right now." }, 500);
        }
      },
    },
  },
});
