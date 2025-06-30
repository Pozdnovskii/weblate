import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "yxw40eqz",
  dataset: "production",
  useCdn: true,
  apiVersion: "2025-06-30",
});
