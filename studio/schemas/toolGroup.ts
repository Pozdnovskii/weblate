import { defineArrayMember, defineField, defineType } from "sanity";
import { WrenchIcon } from "@sanity/icons/Wrench";
import { translatedField, DEFAULT_LOCALE } from "../lib/constants";

/** A row of the home page's Technologies & Tools section: logos and a caption. */
export const toolGroup = defineType({
  name: "toolGroup",
  title: "Tool Group",
  type: "document",
  icon: WrenchIcon,

  fields: [
    translatedField("caption", "Caption", { type: "text", rows: 3 }),
    defineField({
      name: "logos",
      title: "Logos",
      description: "None: the caption is shown on its own.",
      type: "array",
      // The site has an icon for each of these.
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          "Astro",
          "HTML",
          "CSS",
          "JavaScript",
          "Tailwind",
          "Sanity",
          "Cloudflare",
          "Vercel",
          "Webflow",
          "Webstudio",
          "Framer",
          "Anime.js",
          "GSAP",
          "Shopify",
          "Replo",
        ],
      },
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers appear first",
      initialValue: 100,
      validation: (r) => r.required(),
    }),
  ],

  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],

  preview: {
    select: { title: `caption.${DEFAULT_LOCALE}`, logos: "logos" },
    prepare: ({ title, logos }) => ({ title, subtitle: (logos as string[] | undefined)?.join(", ") }),
  },
});
