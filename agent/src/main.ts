import "dotenv/config";
import { fileURLToPath } from "node:url";
import { type JobContext, ServerOptions, cli, defineAgent, voice } from "@livekit/agents";
import { loadConfig } from "./config.js";
import { createTools } from "./tools.js";

/**
 * The OMNIEL voice agent.
 *
 * A LiveKit worker: it registers with LiveKit under the name "omniel" and is
 * dispatched into a room whenever the website's token route
 * (src/routes/api/livekit/token.ts) issues a token for one. Each visitor gets
 * their own room and their own job.
 *
 * Speech-to-text, the model, and the voice all run through LiveKit Inference,
 * so the only credentials are LiveKit's own. Deepgram Flux decides when the
 * visitor has finished speaking, which keeps turn-taking natural without a
 * separate turn-detection model.
 */

/** Must match AGENT_NAME in src/routes/api/livekit/token.ts. */
const AGENT_NAME = "omniel";

const INSTRUCTIONS = `You are OMNIEL's voice guide on the OMNIEL website. You speak with visitors in real time.

Voice: calm, warm, precise, unhurried. Speak in plain sentences — no lists, markdown, or emoji. Keep answers to two or three sentences, then offer to go further or to open the relevant page.

Facts: for anything about OMNIEL — its people, products (NOVA, VYREN, ARVO, KIWI), technology, research, careers, or contact details — call search_website first and answer only from what it returns. If it has nothing, say the information is not publicly available and offer to pass the question to the OMNIEL team. Never guess or invent.

Moving around the site: when a visitor wants to see something, use the navigation tools, then briefly say what is now on screen.

Enquiries: open the right form, fill it in as the visitor tells you the details so they can see it, spell the email address back, then ask "Would you like me to send this?" Only call submit_enquiry after a clear yes, with confirmation set to true. Report exactly what the tool says happened.`;

export default defineAgent({
  entry: async (ctx: JobContext) => {
    const config = loadConfig();
    await ctx.connect();

    const session = new voice.AgentSession({
      stt: "deepgram/flux-general-en",
      llm: "openai/gpt-4.1-mini",
      tts: "cartesia/sonic-3",
      turnHandling: { turnDetection: "stt" },
      // Product names a general speech model would otherwise mishear.
      keytermsOptions: { keyterms: ["OMNIEL", "NOVA", "VYREN", "ARVO", "KIWI"] },
    });

    await session.start({
      agent: new voice.Agent({
        instructions: INSTRUCTIONS,
        tools: createTools(config, ctx.room),
      }),
      room: ctx.room,
    });

    session.generateReply({
      instructions: "Greet the visitor in one short sentence and ask how you can help.",
    });
  },
});

// Fail at boot, not on the first call, if the environment is incomplete.
loadConfig();

cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url), agentName: AGENT_NAME }));
