import { defineArrayMember, defineField, defineType } from "sanity";
import { EnvelopeIcon } from "@sanity/icons/Envelope";

/** The icons the site has for these; the site picks one by this value. */
const PLATFORMS = [
  { title: "Contra", value: "contra" },
  { title: "Upwork", value: "upwork" },
  { title: "GitHub", value: "github" },
  { title: "LinkedIn", value: "linkedin" },
  { title: "Telegram", value: "telegram" },
  { title: "Email", value: "email" },
];

/** Where to reach Ivan: the site's contact icons and the AI chat read it. */
export const contacts = defineType({
  name: "contacts",
  title: "Contacts",
  type: "document",
  icon: EnvelopeIcon,

  fields: [
    defineField({
      name: "links",
      title: "Links",
      description: "In the order shown on the site.",
      type: "array",
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              options: { list: PLATFORMS },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              description: "For email: mailto:address",
              type: "url",
              validation: (r) => r.required().uri({ scheme: ["https", "mailto"] }),
            }),
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        }),
      ],
    }),
  ],

  preview: {
    prepare() {
      return { title: "Contacts" };
    },
  },
});
