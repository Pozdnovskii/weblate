import { defineType } from "sanity";
import { TagIcon } from "@sanity/icons";
import { translatedField, DEFAULT_LOCALE } from "../lib/constants";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  icon: TagIcon,

  fields: [translatedField("title", "Title")],

  preview: {
    select: { title: `title.${DEFAULT_LOCALE}` },
  },
});
