import { defineField, defineType } from "sanity";
import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";
import { translatedField, DEFAULT_LOCALE } from "../lib/constants";

/** An item of the home page's Principles & Approach section, under one of its tabs. */
export const principle = defineType({
  name: "principle",
  title: "Principle",
  type: "document",
  icon: CheckmarkCircleIcon,

  fields: [
    defineField({
      name: "group",
      title: "Tab",
      type: "string",
      options: {
        list: [
          { title: "Process", value: "process" },
          { title: "Quality", value: "quality" },
          { title: "Technical", value: "technical" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (r) => r.required(),
    }),
    translatedField("title", "Title"),
    translatedField("description", "Description", { type: "text", rows: 3 }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers appear first within the tab",
      initialValue: 100,
      validation: (r) => r.required(),
    }),
  ],

  orderings: [
    {
      title: "Tab, then order",
      name: "groupOrder",
      by: [
        { field: "group", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],

  preview: {
    select: { title: `title.${DEFAULT_LOCALE}`, subtitle: "group" },
  },
});
