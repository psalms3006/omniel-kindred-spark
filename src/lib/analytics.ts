/**
 * Cloudflare Web Analytics.
 *
 * WHY CLOUDFLARE WEB ANALYTICS
 *
 * The privacy policy promises a site that does not track people. Cloudflare
 * Web Analytics is cookieless, sets no client-side state, and does not
 * fingerprint or follow visitors across sites, so it can be added without a
 * consent banner or a cookie notice. It also reports Core Web Vitals, which is
 * the measurement the site's own performance claims should eventually rest on.

 * Production only. Local development and preview builds never send page views
 * into the live analytics property.
 */



export const CF_BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";

export type CfBeaconConfig = {
  src: string;
  data: string;
};

/**
 * Resolve the beacon configuration, or `null` when analytics should not load.
 *
 * Returns `null` outside a production build, and `null` when no token is
 * configured. `spa: true` is explicit rather than relied on as a default, so a
 * change in Cloudflare's behaviour cannot silently disable route tracking.
 */
export function cfBeaconConfig(): CfBeaconConfig | null {
  const token = (import.meta.env["VITE_CF_BEACON_TOKEN"] as string | undefined)?.trim();
  if (!token || !import.meta.env.PROD) return null;
  return {
    src: CF_BEACON_SRC,
    data: JSON.stringify({ token, spa: true }),
  };
}
