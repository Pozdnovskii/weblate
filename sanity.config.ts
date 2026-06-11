import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { CogIcon, ComposeIcon, RocketIcon } from "@sanity/icons";

import { thought } from "@studio/schemas/thought";
import { project } from "@studio/schemas/project";
import { siteSettings } from "@studio/schemas/siteSettings";

export default defineConfig({
  name: "weblate",
  title: "Weblate",
  projectId: "64abwet3",
  dataset: "production",
  basePath: "/studio",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Projects")
              .icon(RocketIcon)
              .child(
                S.documentTypeList("project")
                  .title("Projects")
                  .defaultOrdering([{ field: "order", direction: "asc" }]),
              ),
            S.listItem()
              .title("Thoughts")
              .icon(ComposeIcon)
              .child(S.documentTypeList("thought").title("Thoughts")),
            S.listItem()
              .title("Site Settings")
              .icon(CogIcon)
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: [thought, project, siteSettings],
  },
});
