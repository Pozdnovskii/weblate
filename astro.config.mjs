import { defineConfig, fontProviders, svgoOptimizer, passthroughImageService } from "astro/config";
import { fileURLToPath } from "url";
import path from "path";

import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

import sitemap from "@astrojs/sitemap";
import sanity from "@sanity/astro";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  i18n: {
    locales: ["en", "bg", "es"],
    defaultLocale: "en",
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@styles": path.resolve(__dirname, "./src/styles"),
      },
    },
    optimizeDeps: {
      exclude: ["@sanity/client"],
      include: ["@sanity/eventsource"],
    },
  },
  site: "https://weblateweb.dev",
  trailingSlash: "never",
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-US", bg: "bg-BG", es: "es-ES" },
      },
    }),
    sanity({
      projectId: "64abwet3",
      dataset: "production",
      apiVersion: "2026-06-10",
      useCdn: false,
    }),
  ],
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Space Grotesk",
      cssVariable: "--font-space-grotesk",
      fallbacks: ["sans-serif"],
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/SpaceGrotesk-Regular.woff2"],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Space Mono",
      cssVariable: "--font-space-mono",
      fallbacks: ["monospace"],
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/SpaceMono-Regular.woff2"],
          },
        ],
      },
    },
  ],
  adapter: cloudflare(),
});

