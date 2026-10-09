import { cfBeaconConfig } from "@/lib/analytics";

export function CloudflareAnalytics() {
  const config = cfBeaconConfig();
  if (!config) return null;

  return <script defer src={config.src} data-cf-beacon={config.data} />;
}
