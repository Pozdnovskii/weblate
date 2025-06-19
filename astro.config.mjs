import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@assets": "/src/assets",
        "@components": "src/components",
      },
    },
  },
  site: "https://weblateweb.dev",
  integrations: [sitemap()],
});
