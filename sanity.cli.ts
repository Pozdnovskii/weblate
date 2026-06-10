import { defineCliConfig } from "sanity/cli";
import path from "path";

export default defineCliConfig({
  api: {
    projectId: "64abwet3",
    dataset: "production",
  },
  deployment: {
    appId: "jute1j65w6k7z9zftppy2vzd",
  },
  vite: {
    resolve: {
      alias: {
        "@studio": path.resolve("./studio"),
        "@i18n": path.resolve("./src/i18n"),
      },
    },
  },
});
