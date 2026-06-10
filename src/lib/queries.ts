import { sanityClient } from "sanity:client";
import type { Locale } from "@i18n/ui";
import type { TextBlock } from "@lib/portableText";

type PortableTextImage = {
  _key: string;
  _type: "image";
  asset: { url: string };
  alt?: string;
  caption?: string;
};

export type ThoughtBodyBlock = TextBlock | PortableTextImage;

const LOCALES: Locale[] = ["en", "bg", "es"];

export type SanityImage = {
  url: string | null;
  alt?: string | null;
};

export type ThoughtCard = {
  slug: string;
  title: string;
  description: string;
  date: string;
  mainImage: SanityImage;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Thought = ThoughtCard & {
  enSlug: string;
  slugs: Partial<Record<Locale, string>>;
  metaTitle?: string | null;
  metaDescription?: string | null;
  updatedAt: string | null;
  body: ThoughtBodyBlock[] | null;
  faq: FaqItem[] | null;
};

export type ThoughtPath = {
  enSlug: string;
  slugs: Partial<Record<Locale, string>>;
};

const slugsProjection = () =>
  LOCALES.map((l) => `"${l}": slug.${l}.current`).join(", ");

const cardProjection = (lang: Locale) => `{
  "slug":        coalesce(slug.${lang}.current, slug.en.current),
  "title":       coalesce(title.${lang}, title.en),
  "description": coalesce(description.${lang}, description.en),
  "date":        date,
  "mainImage": {
    "url": mainImage.asset->url,
    "alt": coalesce(mainImage.alt.${lang}, mainImage.alt.en)
  }
}`;

export async function getThoughtCards(
  lang: Locale,
  { excludeEnSlug, limit }: { excludeEnSlug?: string; limit?: number } = {},
): Promise<ThoughtCard[]> {
  const filter = excludeEnSlug
    ? `*[_type == "thought" && defined(slug.en.current) && slug.en.current != $excludeEnSlug]`
    : `*[_type == "thought" && defined(slug.en.current)]`;
  const slice = limit != null ? `[0...$limit]` : ``;
  return sanityClient.fetch(
    `${filter} | order(date desc)${slice} ${cardProjection(lang)}`,
    { excludeEnSlug, limit },
  );
}

export async function getThoughtPaths(): Promise<ThoughtPath[]> {
  return sanityClient.fetch(
    `*[_type == "thought" && defined(slug.en.current)]{
      "enSlug": slug.en.current,
      "slugs":  { ${slugsProjection()} }
    }`,
  );
}

export async function getThought(
  lang: Locale,
  enSlug: string,
): Promise<Thought | null> {
  return sanityClient.fetch(
    `*[_type == "thought" && slug.en.current == $enSlug][0]{
      "enSlug":      slug.en.current,
      "slug":        coalesce(slug.${lang}.current, slug.en.current),
      "slugs":       { ${slugsProjection()} },
      "title":       coalesce(title.${lang}, title.en),
      "description": coalesce(description.${lang}, description.en),
      "metaTitle":   coalesce(metaTitle.${lang}, metaTitle.en),
      "metaDescription": coalesce(metaDescription.${lang}, metaDescription.en),
      "date":        date,
      "updatedAt":   _updatedAt,
      "mainImage": {
        "url": mainImage.asset->url,
        "alt": coalesce(mainImage.alt.${lang}, mainImage.alt.en)
      },
      "body":        coalesce(body.${lang}, body.en)[]{
        ...,
        _type == "image" => { ..., "asset": asset->{ url } }
      },
      "faq":         faq[]{
        "question": coalesce(question.${lang}, question.en),
        "answer":   coalesce(answer.${lang}, answer.en)
      }
    }`,
    { enSlug },
  );
}

export type Project = {
  _id: string;
  title: string;
  link: string | null;
  description: string;
  services: string[];
  tools: string[];
  desktopImage: { url: string; width: number; height: number };
  mobileImage: { url: string; width: number; height: number };
};

export async function getProjects(lang: Locale): Promise<Project[]> {
  return sanityClient.fetch(
    `*[_type == "project"] | order(order asc, _createdAt asc) {
      _id,
      title,
      link,
      "description": coalesce(description.${lang}, description.en),
      "services":    coalesce(services.${lang}, services.en, []),
      tools,
      "desktopImage": desktopImage.asset->{
        "url": url,
        "width": metadata.dimensions.width,
        "height": metadata.dimensions.height
      },
      "mobileImage": mobileImage.asset->{
        "url": url,
        "width": metadata.dimensions.width,
        "height": metadata.dimensions.height
      }
    }`,
  );
}

export function sanityImage(
  url: string | null | undefined,
  params: { w?: number; h?: number; q?: number; fit?: string } = {},
): string | null {
  if (!url) return null;
  const q = new URLSearchParams();
  if (params.w) q.set("w", String(params.w));
  if (params.h) q.set("h", String(params.h));
  q.set("q", String(params.q ?? 80));
  q.set("auto", "format");
  if (params.fit) q.set("fit", params.fit);
  return `${url}?${q.toString()}`;
}
