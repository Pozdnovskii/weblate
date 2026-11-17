import { defineField, defineType } from "sanity";
import { CommentIcon } from "@sanity/icons/Comment";
import { translatedField, DEFAULT_LOCALE } from "../lib/constants";

/** A client review. */
export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  icon: CommentIcon,

  fields: [
    translatedField("text", "Text", { type: "text", rows: 4 }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers appear first",
      initialValue: 100,
      validation: (r) => r.required(),
    }),
  ],

  orderings: [
    {
      title: "Order",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],

  preview: {
    select: { title: `text.${DEFAULT_LOCALE}` },
  },
});
