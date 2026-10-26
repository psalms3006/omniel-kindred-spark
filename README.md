# OMNIEL

<div align="center">

**Building intelligence without borders.**

The official web platform and intelligence ecosystem showcase for [OMNIEL](https://omniel.com.ng) — an early-stage frontier AI and technology initiative being built from Nigeria for a global audience.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154?style=flat-square)](https://tanstack.com/start)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-54_passing-brightgreen?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

[Overview](#overview) •
[Products](#product-ecosystem) •
[Architecture](#architecture--tech-stack) •
[Getting Started](#getting-started) •
[Environment Configuration](#environment-configuration) •
[Project Structure](#project-structure) •
[Design System](#design-system)

</div>

---

## Overview

OMNIEL was founded on the conviction that Africa shouldn't only participate in the technologies shaping the future — it should help define them.

This repository powers **omniel.com.ng**, delivering a calm, precise, and high-performance digital presence.

### Key Capabilities

- **Full-Stack SSR & Streaming**: Powered by [TanStack Start](https://tanstack.com/start) and [Nitro](https://nitro.unjs.io/) for near-instant first paint, file-based routing, and SEO optimization.
- **Interactive Vapi Voice Integration**: On-site voice agent widget with custom client-side tool execution (`open_product`, `fill_form`, automated navigation, and live assistance).
- **The Meridian Design System**: Bespoke, performant SVG orbital geometry symbolizing global reach without battery-draining canvas loops.
- **Fail-Closed Enquiry Pipeline**: Robust enquiry ingestion route (`/api/enquiry`) backed by schema validation (Zod) and verified Resend delivery.
- **Accessibility & Motion Discipline**: Built with Radix UI headless primitives, full `:focus-visible` compliance, strict `prefers-reduced-motion` fallbacks, and tokenized spring animations.

---

## Product Ecosystem

OMNIEL structures its systems around distinct problem spaces, led by its flagship personal intelligence assistant:

| Product               | Focus                    | Role                                                                                                  | Status           |
| --------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------- |
| **NOVA** _(Flagship)_ | Generalist Intelligence  | Productivity, computer automation, vision, voice/text, persistent context, and offline operation      | In development   |
| **VYREN**             | Specialist Intelligence  | Deep technical reasoning, code comprehension, systems engineering, and voice-first technical dialogue | In development   |
| **ARVO**              | Voice-First Intelligence | Hands-busy workflows, conversational memory, screen understanding, file control, and tool use / MCP   | In development   |
| **KIWI**              | Emerging Exploration     | Early-stage research initiative; specifications intentionally guarded until production validation     | Emerging project |

> **Content Integrity Rule**: All capabilities are represented accurately as in-development ambitions. The repository strictly excludes speculative benchmarks, unverified launch dates, or artificial partner claims.

---

## Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│   React 19  •  TanStack Router  •  Tailwind v4  •  Motion   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     HTTP / SSR Stream             WebRTC / WebSocket
               │                              │
               ▼                              ▼
┌──────────────────────────────┐  ┌───────────────────────────┐
│        Nitro Server          │  │      Vapi AI Voice        │
│  - File routes & SSR engine  │  │  - Interactive assistant  │
│  - /api/enquiry handler      │  │  - Browser tool dispatcher│
│  - Resend email transport    │  │    (navigation, form fill)│
└──────────────────────────────┘  └───────────────────────────┘
```

### Core Technologies

- **Runtime & Framework**: [React 19](https://react.dev/), [TanStack Start](https://tanstack.com/start), [TanStack Router](https://tanstack.com/router), [TanStack Query](https://tanstack.com/query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with native OKLCH design tokens (`@theme inline`), [Motion](https://motion.dev/) (Framer Motion v12)
- **UI Primitives**: Headless [Radix UI](https://www.radix-ui.com/) components, [Lucide React](https://lucide.dev/)
- **Voice Intelligence**: [@vapi-ai/web](https://vapi.ai/) with client-side function dispatching
- **Validation & Forms**: [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/)
- **Testing & Quality**: [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/), [ESLint 9](https://eslint.org/), [Prettier](https://prettier.io/)

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20.0.0` (or [Bun](https://bun.sh/) `>= 1.1`)
- **npm** or **bun**

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/omniel-kindred-spark.git
   cd omniel-kindred-spark
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or with bun
   bun install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   _(See [Environment Configuration](#environment-configuration) for required keys)._

4. **Launch development server:**
   ```bash
   npm run dev
   ```
   The site will be running locally at `http://localhost:3000` (or the port indicated in your console).

---

## Available Scripts

| Command           | Action                                                         |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Starts Vite dev server with hot module replacement (HMR)       |
| `npm run build`   | Compiles the production server and client assets with Nitro    |
| `npm run preview` | Previews the compiled production build locally                 |
| `npm test`        | Runs the full Vitest suite (SEO, enquiry pipeline, Vapi tools) |
| `npm run lint`    | Runs ESLint 9 checks across the codebase                       |
| `npm run format`  | Formats all source files with Prettier                         |

---

## Environment Configuration

Configure your `.env` file based on `.env.example`:

### Client Variables (Inlined via Vite)

| Variable                 | Description                                      | Required                                      |
| ------------------------ | ------------------------------------------------ | --------------------------------------------- |
| `VITE_VAPI_PUBLIC_KEY`   | Public API key for Vapi voice widget             | No (Voice widget disables cleanly if omitted) |
| `VITE_VAPI_ASSISTANT_ID` | Assistant ID configured in your Vapi dashboard   | No                                            |
| `VITE_CF_BEACON_TOKEN`   | Cloudflare Web Analytics token (production only) | No                                            |

### Server Variables (Never exposed to client)

| Variable                     | Description                                                                  | Required                        |
| ---------------------------- | ---------------------------------------------------------------------------- | ------------------------------- |
| `RESEND_API_KEY`             | Resend API key for outbound enquiries and waitlist email                     | Required for email features     |
| `RESEND_FROM_EMAIL`          | Verified sender address (e.g. `OMNIEL <noreply@omniel.com.ng>`)              | Required for email features     |
| `OMNIEL_ENQUIRY_EMAIL`       | Destination mailbox for inbound enquiries (defaults to `info@omniel.com.ng`) | Optional                        |
| `WAITLIST_TOKEN_SECRET`      | Secret used to sign NOVA waitlist confirmation links                         | Required for `/api/waitlist`    |
| `RESEND_WAITLIST_SEGMENT_ID` | Resend Segment for confirmed NOVA waitlist contacts                          | Optional; needed for broadcasts |

### Verifying Cloudflare Web Analytics

`VITE_CF_BEACON_TOKEN` is a **build-time** Vite variable, not a Worker runtime
secret. It must be present when `npm run build` runs and the site is deployed
again. Adding it under Cloudflare's runtime Variables and Secrets does nothing.
The token is public by design because the browser beacon needs it.

There are two supported setups; use one, not both:

- **Manual beacon (this code):** in Cloudflare → Web Analytics → `omniel.com.ng`
  → Manage site, choose **Enable with JS Snippet installation**, copy the token,
  and set it as `VITE_CF_BEACON_TOKEN` in the production **build** environment.
  The code renders the beacon with `spa: true`, so client-side route changes are
  counted.
- **Automatic beacon:** choose **Enable** in the same screen and leave
  `VITE_CF_BEACON_TOKEN` unset. Cloudflare injects the beacon at the edge.

Verify the manual setup on the live site:

```powershell
curl.exe -s https://omniel.com.ng/ | Select-String "beacon.min.js"
```

You should see the Cloudflare beacon `<script>` with a `data-cf-beacon` token.
In the browser's Network panel, loading the page should request
`static.cloudflareinsights.com/beacon.min.js` and then POST to
`cloudflareinsights.com/cdn-cgi/rum`. The Web Analytics dashboard normally
updates within a few minutes.

`npm run dev` deliberately does not load the beacon, and ad blockers can block
it. Cloudflare **Traffic** analytics and **Web Analytics** are separate: traffic
can appear in Traffic while Web Analytics stays empty if the beacon is missing.

### If the waitlist says it is not configured

A `503` from `/api/waitlist` means the running Worker is not receiving one of
`WAITLIST_TOKEN_SECRET`, `RESEND_API_KEY`, or `RESEND_FROM_EMAIL`. Add the values
under **Cloudflare → Workers & Pages → the Worker that serves omniel.com.ng
(`omniel-evolve`) → Settings → Variables and Secrets**, then create a new
deployment. These must be runtime variables/secrets, not Build variables, and
plain Worker secrets rather than Secrets Store bindings. Adding them to a
different Worker, a Pages project, or only to Lovable will not reach production.

Server routes read Worker bindings through `getConfig()` in
`src/lib/automation/runtime-env.ts`. Do not read secrets with `import.meta.env`,
and do not put them in `.env` for a Cloudflare deploy. The Worker logs print the
exact missing variable name.

### NOVA waitlist storage and updates

The waitlist is stored in **Resend Contacts**; there is no separate database to maintain.

Before the first signup, create these **Contact properties** in Resend (type `string`)
if they do not already exist. The Contacts API rejects writes that reference
undefined properties:

`source`, `status`, `intended_use`, `signed_up_at`, `confirmed_at`

If your Resend dashboard still shows **Audiences** instead of Contacts and
Segments, the account is on the legacy model. This code targets the current
global Contacts + Segments API. An Audience ID is not a Segment ID and will not
work here. Try `https://resend.com/contacts` and
`https://resend.com/segments` directly, or create the Segment and properties
with the API. If those endpoints are unavailable, ask Resend support to migrate
the account before switching the site on.

- Every signup is saved with `source=nova-waitlist`, `status=pending`, and `signed_up_at`, plus `intended_use` when one was provided.
- The visitor receives a double opt-in confirmation email. The team also receives a
  new-signup notification at `info@omniel.com.ng`.
- Confirming sets `status=confirmed` and `confirmed_at`. If
  `RESEND_WAITLIST_SEGMENT_ID` is set, the contact is added to that Segment **only
  after confirmation**, so a broadcast never reaches an unconfirmed address.
- To send an update, open Resend → **Broadcasts** → create a broadcast → choose the
  NOVA waitlist Segment. Only confirmed contacts are in it. If you already have
  confirmed contacts from before the Segment was configured, add them once from
  the Resend dashboard.
- To export the list, use Resend → Contacts. Contacts can also be filtered by
  `source` or `status` in the dashboard.

If `OMNIEL_ENQUIRY_EMAIL` is set in the hosting environment, set it to
`info@omniel.com.ng`; otherwise the code default is used.

---

## Project Structure

```
├── .env.example            # Environment variables template
├── DESIGN.md               # Visual language, tokens, and motion guidelines
├── package.json            # Scripts and dependency declarations
├── vitest.config.ts        # Vitest test configuration
├── src/
│   ├── routes/             # TanStack Start file-based routes
│   │   ├── __root.tsx      # Root document shell, navigation, footer, voice widget
│   │   ├── index.tsx       # Homepage hero, meridian motif, flagship showcase
│   │   ├── about.tsx       # Mission, philosophy, and background
│   │   ├── products.index.tsx  # Product ecosystem directory
│   │   ├── products.$slug.tsx  # Dynamic deep dives (NOVA, VYREN, ARVO, KIWI)
│   │   ├── technology.tsx  # Core technical pillars (Memory, Voice, Local, Tools)
│   │   ├── research.tsx    # Open science, safety, and roadmaps
│   │   ├── careers.tsx     # Culture, principles, and recruitment
│   │   ├── contact.tsx     # Validated enquiry form
│   │   └── api/
│   │       └── enquiry.ts  # Server endpoint for enquiry submissions
│   ├── components/
│   │   ├── site/           # Custom site components (Meridian, Nav, Footer, Vapi widget)
│   │   │   ├── atmosphere.tsx   # SVG meridian signature system
│   │   │   ├── primitives.tsx   # Design primitives (Shell, Panel, Reveal, Eyebrow)
│   │   │   ├── site-nav.tsx     # Responsive desktop/mobile header
│   │   │   └── vapi-widget.tsx  # Real-time voice interaction dock
│   │   └── ui/             # Radix UI and shared UI elements
│   └── lib/
│       ├── omniel.ts       # Canonical data model (products, principles, navigation)
│       ├── enquiry-handler.ts # Server-side Resend ingestion & validation
│       ├── seo.ts          # Metadata, OpenGraph, JSON-LD schema generators
│       └── vapi-integration/ # Client-side browser action dispatcher for voice
```

---

## Testing & Verification

The test suite covers schema validation, email handling, and client voice tools:

```bash
npm test
```

---

## License & Attribution

Internal platform code for **OMNIEL** (`omniel.com.ng`). All rights reserved.
Deployment managed via [Lovable](https://lovable.dev) / custom host.
