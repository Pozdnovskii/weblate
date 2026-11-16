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
    defineField({
      name: "chatOffTopic",
      title: "AI chat: off-topic questions",
      description:
        "How the chat answers questions that have nothing to do with Ivan's work: tone, examples, limits. English; empty means a plain reply that the chat covers only Ivan's work.",
      type: "text",
      rows: 12,
    }),
  ],

  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
