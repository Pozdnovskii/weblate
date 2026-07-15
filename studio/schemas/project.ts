import { defineArrayMember, defineField, defineType } from "sanity";
import { RocketIcon } from "@sanity/icons";
import { translatedField } from "../lib/constants";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: RocketIcon,

  groups: [
    { name: "main", title: "Main" },
    { name: "translated", title: "Translated" },
    { name: "media", title: "Media" },
  ],

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "main",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "link",
      title: "Link",
      type: "url",
      group: "main",
      validation: (r) =>
        r.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),

    defineField({
      name: "order",
      title: "Order",
      type: "number",
      group: "main",
      description: "Lower numbers appear first",
      initialValue: 100,
    }),

    defineField({
      name: "tools",
      title: "Tools",
      type: "array",
      group: "main",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tool" }] })],
    }),

    translatedField("description", "Description", {
      type: "text",
      rows: 4,
      group: "translated",
    }),

    defineField({
      name: "services",
      title: "Services",
      type: "array",
      group: "main",
      of: [defineArrayMember({ type: "reference", to: [{ type: "service" }] })],
    }),

    defineField({
      name: "desktopImage",
      title: "Desktop Image",
      type: "image",
      group: "media",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),

    defineField({
      name: "mobileImage",
      title: "Mobile Image",
      type: "image",
      group: "media",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
  ],

  orderings: [
    {
      title: "Order asc",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],

  preview: {
    select: { title: "title", media: "desktopImage", subtitle: "link" },
  },
});
