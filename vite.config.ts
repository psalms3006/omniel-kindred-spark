import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

/**
 * OMNIEL build configuration.
 *
 * This file previously delegated to a third-party wrapper package that
 * assembled the plugin list for us. It is now explicit, because every plugin
 * and resolver rule the site actually depends on should be visible and
 * auditable here rather than hidden inside a dependency.
 *
 * Plugin order matters and matches what the site was built and tested with:
 * Tailwind, then path resolution, then TanStack Start, then (on build only)
 * Nitro, then React last.
 */

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Stops anything under a `server/` directory, or the `server-only`
      // specifier, from being pulled into a client bundle. This is the guard
      // that keeps server secrets out of the browser, so it fails the build
      // rather than warning.
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      // Routes the bundled server entry through src/server.ts, our SSR error
      // wrapper. Nitro builds from this.
      server: { entry: "server" },
    }),
    // Nitro only participates in builds; adding it to the dev server breaks
    // HMR. The Cloudflare Workers preset is explicit rather than inferred, so
    // a stray NITRO_PRESET in the environment cannot silently retarget a
    // production build at Node.
    ...(command === "build"
      ? [
          nitro({
            preset: "cloudflare-module",
            cloudflare: {
              nodeCompat: true,
              // Deliberately off. Enabling it makes the generated config the
              // sole source of truth for the Worker and discards environment
              // variables held in Cloudflare, which is where this project's
              // secrets live. See DEPLOY.md for the deploy command.
              deployConfig: false,
            },
          }),
        ]
      : []),
    viteReact(),
  ],
  resolve: {
    alias: { "@": srcDir },
    // React and TanStack Query must resolve to exactly one copy. Duplicates
    // produce invalid-hook-call and cross-provider cache misses that are
    // painful to diagnose.
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  server: {
    host: "::",
    port: 8080,
  },
}));
