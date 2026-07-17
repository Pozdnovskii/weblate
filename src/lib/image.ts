import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { sanityClient } from "./sanity";

// Sanity CDN URL builder. Unlike a hand-built `asset->url + "?w=N"`, this applies
// the hotspot/crop the editor set in Studio — but only when the source is the raw
// image object (asset._ref + hotspot), not a bare URL string, and only where
// Sanity itself does the cropping.
//
// Where the crop happens matters: Astro's <Image> (Sharp, at build time) crops
// centred whenever it gets both width and height, and knows nothing about
// hotspot. So hotspot reaches the page only for the thoughts card and og:image,
// which ask Sanity for a cropped rendition; the thought hero and heroBg are
// cropped by Sharp afterwards regardless.
const builder = createImageUrlBuilder(sanityClient);
export const urlFor = (source: SanityImageSource) => builder.image(source);
