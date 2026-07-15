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
});
