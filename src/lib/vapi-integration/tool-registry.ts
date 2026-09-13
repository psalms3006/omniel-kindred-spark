/**
 * OMNIEL tool/action registry.
 *
 * This is the one place that defines every tool Vapi is allowed to call.
 * Two consumers read from it:
 *  - tool-handlers.ts, to know which tool-call names to accept from Vapi and
 *    to log invocations consistently.
 *  - scripts/configure-vapi.ts, which pushes these definitions to the Vapi
 *    account over the API. Do not configure tools by hand in the dashboard:
 *    that is how the account ended up with a tool named "function_tool" that
 *    nothing could ever dispatch. Edit this file, then run the script.
 *
 * Adding a tool later (client or server) means adding one entry here plus
 * one handler function — nothing about this file's shape needs to change,
 * which is the "don't rewrite the architecture" property the spec asked for.
 */

export type JsonSchema = {
  type: "object";
  properties: Record<string, { type: string; description: string; enum?: readonly string[] }>;
  required?: readonly string[];
};

export type ToolDefinition = {
  name: string;
  description: string;
  /** Where the tool actually executes. Client tools run in-browser via
   *  tool-handlers.ts and are given no server URL, which is what makes Vapi
   *  deliver them to the Web SDK. Server tools carry their own server URL
   *  pointing at /api/vapi/webhook and never reach the browser, so they do
   *  not appear in CLIENT_TOOL_NAMES below. */
  executionLocation: "client" | "server";
  parameters: JsonSchema;
  requiresUserConfirmation: boolean;
};

export const TOOL_REGISTRY: readonly ToolDefinition[] = [
  {
    name: "navigate_to_page",
    description:
      "Navigate the visitor to a top-level OMNIEL page (no specific section). Use for general 'go to the X page' requests.",
    executionLocation: "client",
    requiresUserConfirmation: false,
    parameters: {
      type: "object",
      properties: {
        page: {
          type: "string",
          description: "Which page to open.",
          enum: [
            "home",
            "about",
            "products",
            "careers",
            "contact",
            "research",
            "technology",
            "privacy",
            "terms",
          ],
        },
      },
      required: ["page"],
    },
  },
  {
    name: "navigate_to_section",
    description:
      "Navigate to and scroll to a specific named section of the site (more precise than navigate_to_page — use when the visitor names a specific part of a page, e.g. the ecosystem overview or the comparison table).",
    executionLocation: "client",
    requiresUserConfirmation: false,
    parameters: {
      type: "object",
      properties: {
        section: {
          type: "string",
          description: "Which section to scroll to.",
          enum: [
            "products",
            "about",
            "ecosystem",
            "compare",
            "reality",
            "belief",
            "vision",
            "team",
            "directions",
            "offline",
            "per-product",
            "future",
          ],
        },
      },
      required: ["section"],
    },
  },
  {
    name: "open_product",
    description: "Open a specific OMNIEL product's page (NOVA, VYREN, ARVO, or KIWI).",
    executionLocation: "client",
    requiresUserConfirmation: false,
    parameters: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The product to open.",
          enum: ["nova", "vyren", "arvo", "kiwi"],
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "navigate_to_product_section",
    description:
      "Open a specific OMNIEL product's page and scroll to one of its sections (capabilities or audience). Use instead of navigate_to_section when the visitor names a section on a specific product's own page.",
    executionLocation: "client",
    requiresUserConfirmation: false,
    parameters: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The product whose page to open.",
          enum: ["nova", "vyren", "arvo", "kiwi"],
        },
        section: {
          type: "string",
          description: "Which section of that product's page to scroll to.",
          enum: ["capabilities", "audience"],
        },
      },
      required: ["slug", "section"],
    },
  },
  {
    name: "open_form",
    description:
      "Open a specific enquiry form (contact, partnerships, investment, or careers) and scroll to it. Use before fill_form.",
    executionLocation: "client",
    requiresUserConfirmation: false,
    parameters: {
      type: "object",
      properties: {
        formId: {
          type: "string",
          description: "Which form to open.",
          enum: ["contact", "partnerships", "investment", "careers"],
        },
      },
      required: ["formId"],
    },
  },
  {
    name: "fill_form",
    description:
      "Populate fields on a form that is already open (call open_form first). Does not submit the form — the visitor still reviews and submits it themselves, or asks the assistant to submit_enquiry on their behalf after confirming.",
    executionLocation: "client",
    requiresUserConfirmation: false,
    parameters: {
      type: "object",
      properties: {
        formId: {
          type: "string",
          description: "Which open form to fill.",
          enum: ["contact", "partnerships", "investment", "careers"],
        },
        name: { type: "string", description: "Visitor's name." },
        email: { type: "string", description: "Visitor's email address." },
        category: { type: "string", description: "Category/area, if the form has one." },
        message: { type: "string", description: "The enquiry message body." },
      },
      required: ["formId"],
    },
  },
  {
    name: "submit_enquiry",
    description:
      "Submit an enquiry on the visitor's behalf, sending it to OMNIEL by email. ONLY call this after the visitor has explicitly confirmed they want it sent — ask 'Would you like me to submit this enquiry?' first and wait for a yes.",
    executionLocation: "server",
    requiresUserConfirmation: true,
    parameters: {
      type: "object",
      properties: {
        formId: {
          type: "string",
          description: "Which kind of enquiry this is.",
          enum: ["contact", "partnerships", "investment", "careers"],
        },
        name: { type: "string", description: "Visitor's name." },
        email: { type: "string", description: "Visitor's email address." },
        category: { type: "string", description: "Category/area, if relevant." },
        message: { type: "string", description: "The enquiry message body." },
        confirmation: {
          type: "boolean",
          description: "Must be true — only set after the visitor has explicitly confirmed.",
        },
      },
      required: ["formId", "name", "email", "message", "confirmation"],
    },
  },
  {
    name: "search_website",
    description:
      "Read what the OMNIEL website says right now. USE THIS FIRST, before answering from memory, for any question about OMNIEL's people and team members, products (NOVA, VYREN, ARVO, KIWI), technology, research, careers, or contact details. The website is the newest source and may describe people or details added after your knowledge base was written. Answer order is strict: (1) call this tool and answer from what it returns; (2) if it returns nothing relevant, use your knowledge base; (3) if neither has the answer, say plainly that the information is not publicly available and offer to pass the question to OMNIEL. Never fill a gap with a guess. Keep spoken answers to two or three sentences and offer to open the page.",
    executionLocation: "server",
    requiresUserConfirmation: false,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "What to look up, in the visitor's own words. For a person, use their name. For a topic, use the key words, e.g. 'offline capability' or 'open roles'.",
        },
        page: {
          type: "string",
          description:
            "Optional. Restrict the lookup to one page when the visitor names it explicitly.",
          enum: [
            "/",
            "/about",
            "/products",
            "/products/nova",
            "/products/vyren",
            "/products/arvo",
            "/products/kiwi",
            "/technology",
            "/research",
            "/careers",
            "/contact",
            "/privacy",
            "/terms",
          ],
        },
      },
      required: ["query"],
    },
  },
] as const;

export const CLIENT_TOOL_NAMES = TOOL_REGISTRY.filter((t) => t.executionLocation === "client").map(
  (t) => t.name,
);
