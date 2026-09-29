# OMNIEL voice agent

The voice behind "Talk to OMNIEL" on the website. A standalone Node service
built on [LiveKit Agents](https://docs.livekit.io/agents/). It is deliberately
not part of the website's Cloudflare Worker: it holds a live audio session for
the length of each conversation, which a Worker is not built to do.

## How the pieces fit

```
Visitor's browser ──(1) POST /api/livekit/token──▶ Website (Cloudflare Worker)
       │                                              │ issues a token for a private room,
       │                                              │ with a dispatch for agent "omniel"
       │◀─────────────────────────────────────────────┘
       │
       ├──(2) joins the room, mic on ──▶ LiveKit Cloud ──(3) dispatches ──▶ this agent
       │                                                                     │
       │◀──(5) RPC "omniel.action": navigate / open form / fill form ────────┤
       │                                                                     │
Website ◀──(4) POST /api/agent/tools (x-agent-secret): search, enquiry ──────┘
```

- Speech-to-text (Deepgram Flux), the model (GPT-4.1 mini) and the voice
  (Cartesia Sonic 3) all run through LiveKit Inference, so LiveKit's own keys
  are the only AI credentials needed. Change them in `src/main.ts`.
- Facts come only from the live website, via `search_website`. The agent has
  no copy of the site content.
- Enquiries go through the website's own pipeline (`submit_enquiry`), with the
  same validation and the same required `confirmation: true` as the form.
- On-page actions run in the visitor's browser (`src/lib/voice/rpc-bridge.ts`
  in the website) and report back whether they worked.

## Configuration

| Variable | Where from |
| --- | --- |
| `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | LiveKit Cloud project, Settings > Keys. The same three are set on the website. |
| `SITE_URL` | The website the agent serves, e.g. `https://omniel.com.ng`. |
| `AGENT_SHARED_SECRET` | Any long random string; the identical value must be set on the website. |

Copy `.env.example` to `.env` for local runs. On LiveKit Cloud, the
LiveKit values are provided automatically and the other two are set as secrets.

## Run locally

```sh
npm install
npm run dev
```

The website must be reachable at `SITE_URL` for the tools to work (run it with
`npm run dev` at the repository root and set `SITE_URL=http://localhost:3000`,
or point at production).

## Deploy to LiveKit Cloud

With the [LiveKit CLI](https://docs.livekit.io/home/cli/) installed:

```sh
lk cloud auth
lk agent create --secrets-file .env
```

`lk agent create` builds the `Dockerfile` here, registers the agent, and writes
`livekit.toml`. Later releases are `lk agent deploy`; secrets change with
`lk agent update-secrets --secrets-file .env`.

Any host that runs Docker or Node 20+ works too: `npm run build`, then
`npm start`. The agent only makes outbound connections, so it needs no
public port.
