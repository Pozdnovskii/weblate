import { defineConfig, fontProviders } from "astro/config";
import { fileURLToPath } from "url";
import path from "path";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@styles": path.resolve(__dirname, "./src/styles"),
      },
    },
  },
  site: "https://weblateweb.dev",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/table") && !page.includes("/table-2"),
    }),
  ],
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  experimental: {
    svgo: true,
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
            {
              weight: 500,
              style: "normal",
              src: ["./src/assets/fonts/SpaceGrotesk-Medium.woff2"],
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
  },
});
