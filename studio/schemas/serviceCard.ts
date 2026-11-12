import { defineField, defineType } from "sanity";
import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { translatedField, DEFAULT_LOCALE } from "../lib/constants";

/**
 * A card of the home page's Services section. Not the `service` tags that
 * projects reference: those are short labels, these are the offer itself.
 */
export const serviceCard = defineType({
  name: "serviceCard",
  title: "Service Card",
  type: "document",
  icon: BlockContentIcon,

  fields: [
    translatedField("title", "Title"),
    translatedField("text", "Text", {
      type: "text",
      rows: 8,
      description: "A blank line starts a new paragraph.",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: [
          { title: "Code", value: "code" },
          { title: "Migration", value: "migration" },
          { title: "Upgrade", value: "upgrade" },
          { title: "Design", value: "design" },
        ],
      },
      validation: (r) => r.required(),
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
    select: { title: `title.${DEFAULT_LOCALE}`, subtitle: "icon" },
  },
});
