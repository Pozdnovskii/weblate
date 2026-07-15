import { defineField, defineType } from "sanity";
import { WrenchIcon } from "@sanity/icons";

export const tool = defineType({
  name: "tool",
  title: "Tool",
  type: "document",
  icon: WrenchIcon,

  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
  ],

  preview: {
    select: { title: "name" },
  },
});
