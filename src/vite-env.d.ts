/// <reference types="vite/client" />

/**
 * Vite inlines every `VITE_`-prefixed variable into the browser bundle, so
 * anything declared here is public by definition — never put a secret in one.
 * Declaring them turns a typo into a type error instead of a silent
 * `undefined` at runtime.
 *
 * Server-only secrets (RESEND_API_KEY, RESEND_FROM_EMAIL, OMNIEL_ENQUIRY_EMAIL)
 * are deliberately absent: they are read from `process.env` on the server and
 * must never be exposed to the client.
 */
interface ImportMetaEnv {
  readonly VITE_CF_BEACON_TOKEN?: string;
  readonly VITE_VAPI_PUBLIC_KEY?: string;
  readonly VITE_VAPI_ASSISTANT_ID?: string;
}
