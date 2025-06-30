import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: "yxw40eqz",
  dataset: "production",
  useCdn: true,
  apiVersion: "2025-06-30",
});

const builder = imageUrlBuilder(client);

export function urlForImg(source) {
  return builder.image(source);
}
