import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://weblateweb.dev",
  integrations: [sitemap()],
  experimental: {
    fonts: [
      {
        provider: "local",
        name: "Space Grotesk",
        cssVariable: "--font-space-grotesk",
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/SpaceGrotesk-Regular.woff2"],
          },
          {
            weight: 500,
            style: "normal",
            src: ["./src/assets/fonts/SpaceGrotesk-Medium.woff2"],
          },
        ],

        fallbacks: ["sans-serif"],
      },
      {
        provider: "local",
        name: "Space Mono",
        cssVariable: "--font-space-mono",
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/SpaceMono-Regular.woff2"],
          },
        ],

        fallbacks: ["monospace"],
      },
    ],
  },
});
