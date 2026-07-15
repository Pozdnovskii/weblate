import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { CogIcon, ComposeIcon, RocketIcon, TagIcon, WrenchIcon } from "@sanity/icons";

import { thought } from "@studio/schemas/thought";
import { project } from "@studio/schemas/project";
import { siteSettings } from "@studio/schemas/siteSettings";
import { tool } from "@studio/schemas/tool";
import { service } from "@studio/schemas/service";
import { DEFAULT_LOCALE } from "@studio/lib/constants";

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
              .title("Tools")
              .icon(WrenchIcon)
              .child(
                S.documentTypeList("tool").title("Tools").defaultOrdering([
                  { field: "name", direction: "asc" },
                ]),
              ),
            S.listItem()
              .title("Services")
              .icon(TagIcon)
              .child(
                S.documentTypeList("service").title("Services").defaultOrdering([
                  { field: `title.${DEFAULT_LOCALE}`, direction: "asc" },
                ]),
              ),
            S.listItem()
              .title("Site Settings")
              .icon(CogIcon)
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
          ]),
    }),
    visionTool(),
  ],

  document: {
    actions: (prev, context) =>
      context.schemaType === "siteSettings"
        ? prev.filter((action) => !["delete", "duplicate"].includes(action.action ?? ""))
        : prev,
  },

  schema: {
    types: [thought, project, siteSettings, tool, service],
  },
});
