import { createClient } from "@sanity/client";

// Read-only Sanity client for the public site. Configured directly here (no
// @sanity/astro integration — that one exists for the embedded Studio and
// visual editing, neither of which this site uses, and it drags the whole
// `sanity` package into the frontend via mandatory peers).
//
// useCdn: false is deliberate — the site is static, so every read happens at
// build time and a freshly published edit must land in the very next build.
export const sanityClient = createClient({
  projectId: "64abwet3",
  dataset: "production",
  apiVersion: "2026-06-10",
  useCdn: false,
  perspective: "published",
});
