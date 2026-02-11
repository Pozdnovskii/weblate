import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const thoughts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/thoughts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
  }),
});

export const collections = { thoughts };
