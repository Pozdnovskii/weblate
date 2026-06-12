import { defineConfig, fontProviders, svgoOptimizer } from "astro/config";
import { fileURLToPath } from "url";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";
import sanity from "@sanity/astro";

export default defineConfig({
  i18n: {
    locales: ["en", "bg", "es"],
    defaultLocale: "en",
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
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
  image: {
    layout: "constrained",
    domains: ["cdn.sanity.io"],
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        webp: { effort: 6, quality: 80 },
        avif: { effort: 9, quality: 70 },
      },
    },
  },
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
});
