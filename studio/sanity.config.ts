import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { CogIcon } from "@sanity/icons/Cog";
import { ComposeIcon } from "@sanity/icons/Compose";
import { RocketIcon } from "@sanity/icons/Rocket";
import { TagIcon } from "@sanity/icons/Tag";
import { WrenchIcon } from "@sanity/icons/Wrench";
import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";
import { EnvelopeIcon } from "@sanity/icons/Envelope";

import { thought } from "@studio/schemas/thought";
import { project } from "@studio/schemas/project";
import { siteSettings } from "@studio/schemas/siteSettings";
import { tool } from "@studio/schemas/tool";
import { service } from "@studio/schemas/service";
import { serviceCard } from "@studio/schemas/serviceCard";
import { toolGroup } from "@studio/schemas/toolGroup";
import { principle } from "@studio/schemas/principle";
import { contacts } from "@studio/schemas/contacts";
import { DEFAULT_LOCALE } from "@studio/lib/constants";

/** One document each, opened straight from the list: no delete, no duplicate. */
const SINGLETONS = new Set(["siteSettings", "contacts"]);

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
            S.divider(),
            S.listItem()
              .title("Home: Services")
              .icon(BlockContentIcon)
              .child(
                S.documentTypeList("serviceCard")
                  .title("Home: Services")
                  .defaultOrdering([{ field: "order", direction: "asc" }]),
              ),
            S.listItem()
              .title("Home: Tools")
              .icon(WrenchIcon)
              .child(
                S.documentTypeList("toolGroup")
                  .title("Home: Tools")
                  .defaultOrdering([{ field: "order", direction: "asc" }]),
              ),
            S.listItem()
              .title("Home: Principles")
              .icon(CheckmarkCircleIcon)
              .child(
                S.documentTypeList("principle")
                  .title("Home: Principles")
                  .defaultOrdering([
                    { field: "group", direction: "asc" },
                    { field: "order", direction: "asc" },
                  ]),
              ),
            S.divider(),
            S.listItem()
              .title("Contacts")
              .icon(EnvelopeIcon)
              .child(S.document().schemaType("contacts").documentId("contacts")),
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
      SINGLETONS.has(context.schemaType)
        ? prev.filter((action) => !["delete", "duplicate"].includes(action.action ?? ""))
        : prev,
  },

  schema: {
    types: [thought, project, siteSettings, contacts, tool, service, serviceCard, toolGroup, principle],
    // Singletons are not created from the "new document" menu.
    templates: (templates) => templates.filter((t) => !SINGLETONS.has(t.schemaType)),
  },
});
