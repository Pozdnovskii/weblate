import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,

  fields: [
    defineField({
      name: "heroBg",
      title: "Hero Background",
      type: "image",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "chatKnowledge",
      title: "AI chat: about Ivan",
      description:
        "Facts the site's AI chat may tell visitors beyond the pages: who Ivan is, prices, availability, reviews. English; the chat answers in the visitor's language. Not shown on the site.",
      type: "text",
      rows: 30,
    }),
  ],

  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
