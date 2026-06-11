import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  __experimental_actions: ["update", "publish", "discardDraft"],

  fields: [
    defineField({
      name: "heroBg",
      title: "Hero Background",
      type: "image",
      validation: (r) => r.required(),
    }),
  ],

  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
