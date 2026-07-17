import { defineCliConfig } from "sanity/cli";
import path from "path";

export default defineCliConfig({
  api: {
    projectId: "64abwet3",
    dataset: "production",
  },
  studioHost: "weblate",
  deployment: {
    appId: "vl6i9w06ktyrsfqccrajy9fn",
  },
  vite: {
    resolve: {
      alias: {
        "@studio": path.resolve("."),
        "@i18n": path.resolve("../src/i18n"),
      },
    },
  },
  // Types are generated into src/lib/ so the site's existing @lib alias resolves
  // them. Run via `pnpm sanity-typegen` from the repo root — never a bare
  // `sanity schema extract`, which drops --enforce-required-fields silently.
  typegen: {
    enabled: true,
    path: "../src/**/*.{ts,tsx}",
    schema: "schema.json",
    generates: "../src/lib/sanity.types.ts",
  },
});
