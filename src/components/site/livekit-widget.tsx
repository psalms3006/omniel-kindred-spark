import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import type { Participant, RemoteTrack, Room } from "livekit-client";
import { cn } from "@/lib/utils";
import { createActionDispatcher } from "@/lib/voice/actions";
import { AGENT_ACTION_RPC, runAgentAction } from "@/lib/voice/rpc-bridge";

/**
 * "Talk to OMNIEL" — the voice assistant's only on-page surface.
 *
 * Nothing happens until the visitor presses the button: no connection, no
 * microphone prompt, and livekit-client is not even downloaded (it is
 * imported on click), so visitors who never talk pay nothing for it.
 *
 * Pressing it asks /api/livekit/token for a private room, joins it with the
 * microphone on, and LiveKit dispatches the agent (agent/, a separate Node
 * service) into the same room. The agent speaks through a real audio track
 * and reports its own state through the `lk.agent.state` participant
 * attribute, which is what drives the listening / thinking / speaking UI.
 * On-page actions arrive as RPCs and run through the action dispatcher.
 */

type CallState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error";

/** Attribute LiveKit agents publish on their participant to report what they are doing. */
const AGENT_STATE_ATTRIBUTE = "lk.agent.state";

function agentStateToCallState(value: string | undefined): CallState | null {
  if (value === "listening" || value === "thinking" || value === "speaking") return value;
  if (value === "initializing") return "connecting";
  return null;
}

function describeMicError(err: unknown): string | null {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotFoundError") return "No microphone was found. Connect one and try again.";
  if (name === "NotAllowedError" || name === "PermissionDeniedError")
    return "Microphone access was blocked. Allow it in your browser to talk to OMNIEL.";
  return null;
}

export function LiveKitWidget() {
  const router = useRouter();
  const dispatcher = useMemo(() => createActionDispatcher(router), [router]);
  const roomRef = useRef<Room | null>(null);
  const audioHostRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<CallState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Leave the room if the widget unmounts mid-call (e.g. a full reload).
  useEffect(() => () => void roomRef.current?.disconnect(), []);

  async function start() {
    setState("connecting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/livekit/token", { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as {
        token?: string;
        serverUrl?: string;
        error?: string;
      };
      if (!response.ok || !body.token || !body.serverUrl) {
        throw new Error(body.error ?? "The voice assistant is not available right now.");
      }

      const { Room, RoomEvent, Track } = await import("livekit-client");
      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      const syncAgentState = (participant: Participant) => {
        const next = agentStateToCallState(participant.attributes[AGENT_STATE_ATTRIBUTE]);
        if (next) setState(next);
      };

      room
        .on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
          if (track.kind !== Track.Kind.Audio) return;
          const element = track.attach();
          audioHostRef.current?.appendChild(element);
        })
        .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
          track.detach().forEach((element) => element.remove());
        })
        .on(RoomEvent.ParticipantAttributesChanged, (_changed, participant) => {
          if (participant !== room.localParticipant) syncAgentState(participant);
        })
        .on(RoomEvent.Disconnected, () => {
          roomRef.current = null;
          room.unregisterRpcMethod(AGENT_ACTION_RPC);
          setState((current) => (current === "error" ? current : "idle"));
        });

      room.registerRpcMethod(AGENT_ACTION_RPC, (data) => runAgentAction(data.payload, dispatcher));

      await room.connect(body.serverUrl, body.token);
      // Inside the click's user gesture, so browsers allow the agent's audio to play.
      await room.startAudio();

      try {
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (err) {
        await room.disconnect();
        throw new Error(describeMicError(err) ?? "The microphone could not be started.");
      }

      setState("listening");
    } catch (err) {
      console.error("[voice] could not start a session", err);
      await roomRef.current?.disconnect();
      roomRef.current = null;
      setErrorMessage(
        err instanceof Error ? err.message : "The voice assistant is not available right now.",
      );
      setState("error");
    }
  }

  async function stop() {
    await roomRef.current?.disconnect();
  }

  const isBusy = state === "connecting";
  const isLive = state === "listening" || state === "thinking" || state === "speaking";
  const liveLabel =
    state === "speaking" ? "OMNIEL is speaking" : state === "thinking" ? "Thinking…" : "Listening…";

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* The agent's voice plays from elements attached here. */}
      <div ref={audioHostRef} hidden />

      {/* Announced to screen readers, so a non-sighted visitor knows whether
          OMNIEL is listening or speaking without watching a dot. */}
      <p className="sr-only" role="status" aria-live="polite">
        {isLive ? liveLabel : state === "connecting" ? "Connecting" : "Talk to OMNIEL"}
      </p>

      {errorMessage && (
        <p className="panel max-w-[15rem] rounded-2xl px-4 py-3 text-right text-xs leading-relaxed text-muted-foreground">
          {errorMessage}
        </p>
      )}

      {isLive && (
        <p className="panel rounded-full px-4 py-2 text-xs text-muted-foreground">{liveLabel}</p>
      )}

      <button
        type="button"
        onClick={isLive ? stop : start}
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
        {isLive ? "End call" : state === "connecting" ? "Connecting…" : "Talk to OMNIEL"}
      </button>
    </div>
  );
}
