import { defineQuery } from "groq";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "@lib/sanity";
import type { Locale } from "@i18n/ui";
import { pick, pickDeep } from "@i18n/utils";
import type { TextBlock } from "@lib/portableText";

// Every query below is one literal string, and the locale is chosen in JS
// afterwards rather than interpolated into the GROQ. Sanity TypeGen only
// evaluates literal constants inside template interpolation, so a projection
// built by a function (`cardProjection(lang)`) cannot be typed at all.
//
// A side effect: the three locales now issue byte-identical queries, so the ~20
// repeats of the cards query per build could collapse to one behind a memo.
// Not done here — the request count is unchanged either way (measured: 34).

type PortableTextImage = {
  _key: string;
  _type: "image";
  asset: { url: string };
  alt?: string;
  caption?: string;
};

export type ThoughtBodyBlock = TextBlock | PortableTextImage;

const LOCALES: Locale[] = ["en", "bg", "es"];

// The raw Sanity image object (asset ref + hotspot/crop), so `urlFor` can honour
// the hotspot. `alt` is resolved to a single locale in JS.
export type SanityImage = SanityImageSource & { alt?: string | null };

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

// ── Queries ───────────────────────────────────────────────────────────────────

export const THOUGHT_CARDS_QUERY = defineQuery(`
  *[_type == "thought" && defined(slug.en.current)] | order(date desc) {
    "enSlug": slug.en.current,
    slug,
    title,
    description,
    date,
    mainImage
  }
`);

export const THOUGHT_PATHS_QUERY = defineQuery(`
  *[_type == "thought" && defined(slug.en.current)]{
    "enSlug": slug.en.current,
    slug
  }
`);

// The per-locale body arrays are spelled out because GROQ cannot map over an
// object's values, and the inline image assets must be dereferenced for a URL.
export const THOUGHT_QUERY = defineQuery(`
  *[_type == "thought" && slug.en.current == $enSlug][0]{
    "enSlug": slug.en.current,
    slug,
    title,
    description,
    metaTitle,
    metaDescription,
    date,
    "updatedAt": _updatedAt,
    mainImage,
    "body": body{
      "en": en[]{ ..., _type == "image" => { ..., "asset": asset->{ url } } },
      "bg": bg[]{ ..., _type == "image" => { ..., "asset": asset->{ url } } },
      "es": es[]{ ..., _type == "image" => { ..., "asset": asset->{ url } } }
    },
    faq
  }
`);

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    "heroBg": { "url": heroBg.asset->url }
  }
`);

export const SERVICE_CARDS_QUERY = defineQuery(`
  *[_type == "serviceCard"] | order(order asc) { title, text, icon }
`);

export const TOOL_GROUPS_QUERY = defineQuery(`
  *[_type == "toolGroup"] | order(order asc) { caption, logos }
`);

export const PRINCIPLES_QUERY = defineQuery(`
  *[_type == "principle"] | order(order asc) { group, title, description }
`);

export const CONTACTS_QUERY = defineQuery(`
  *[_type == "contacts" && _id == "contacts"][0].links[]{ platform, url }
`);

/** Project websites: the only outside links the chat widget makes clickable. */
export const PROJECT_LINKS_QUERY = defineQuery(`
  *[_type == "project" && defined(link)].link
`);

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(order asc, _createdAt asc) {
    _id,
    title,
    link,
    description,
    "services": services[]->title,
    "tools": tools[]->name,
    "desktopImage": desktopImage{
      ...,
      "width":  asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    },
    "mobileImage": mobileImage{
      ...,
      "width":  asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  }
`);

// ── Fetchers ──────────────────────────────────────────────────────────────────

type SlugObject = { current?: string | null } | null;

/** Collects the per-locale slug object into { bg: "…", es: "…" }, dropping blanks. */
function toSlugs(
  slug: Partial<Record<Locale, SlugObject>> | null | undefined,
): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const l of LOCALES) {
    const current = slug?.[l]?.current;
    if (current) out[l] = current;
  }
  return out;
}

/**
 * Asserts a value the schema requires but the generated types still mark
 * nullable. translatedField() puts the `required()` on the `en` sub-field, not
 * on the wrapping object, so TypeGen cannot see that the object itself must
 * exist; same for image dimension metadata, which Sanity always fills in.
 *
 * Failing the build beats the alternative: these fields going missing renders
 * an empty title or a dimensionless <Image>, i.e. a broken page either way.
 */
function req<T>(value: T | null | undefined, what: string): T {
  if (value == null) throw new Error(`Sanity: missing required "${what}"`);
  return value;
}

export async function getThoughtCards(
  lang: Locale,
  { excludeEnSlug, limit }: { excludeEnSlug?: string; limit?: number } = {},
): Promise<ThoughtCard[]> {
  const rows = await sanityClient.fetch(THOUGHT_CARDS_QUERY);
  const kept = excludeEnSlug
    ? rows.filter((r) => r.enSlug !== excludeEnSlug)
    : rows;
  const sliced = limit != null ? kept.slice(0, limit) : kept;

  return sliced.map((row) => ({
    // enSlug and date are non-null here: the query filters on
    // defined(slug.en.current), and TypeGen narrows on that.
    slug: pickDeep(row.slug, lang, (s) => s?.current) ?? row.enSlug,
    title: req(pick(row.title, lang), "thought.title"),
    description: req(pick(row.description, lang), "thought.description"),
    date: row.date,
    mainImage: {
      ...row.mainImage,
      alt: pick(row.mainImage?.alt, lang),
    } as SanityImage,
  }));
}

export async function getThoughtPaths(): Promise<ThoughtPath[]> {
  const rows = await sanityClient.fetch(THOUGHT_PATHS_QUERY);
  return rows.map((r) => ({ enSlug: r.enSlug, slugs: toSlugs(r.slug) }));
}

export async function getThought(
  lang: Locale,
  enSlug: string,
): Promise<Thought | null> {
  const row = await sanityClient.fetch(THOUGHT_QUERY, { enSlug });
  if (!row) return null;

  const enSlugValue = req(row.enSlug, "thought.slug.en.current");
  return {
    enSlug: enSlugValue,
    slugs: toSlugs(row.slug),
    slug: pickDeep(row.slug, lang, (s) => s?.current) ?? enSlugValue,
    title: req(pick(row.title, lang), "thought.title"),
    description: req(pick(row.description, lang), "thought.description"),
    metaTitle: pick(row.metaTitle, lang),
    metaDescription: pick(row.metaDescription, lang),
    date: row.date,
    updatedAt: row.updatedAt,
    mainImage: {
      ...row.mainImage,
      alt: pick(row.mainImage?.alt, lang),
    } as SanityImage,
    body: pick(row.body, lang) as ThoughtBodyBlock[] | null,
    faq:
      row.faq?.map((item) => ({
        question: req(pick(item.question, lang), "faq.question"),
        answer: req(pick(item.answer, lang), "faq.answer"),
      })) ?? null,
  };
}

export type Project = {
  _id: string;
  title: string;
  link: string | null;
  description: string;
  services: string[];
  tools: string[];
  desktopImage: SanityImageSource & { width: number; height: number };
  mobileImage: SanityImageSource & { width: number; height: number };
};

export type SiteSettings = {
  heroBg: { url: string };
};

/**
 * Astro's <Image> demands width and height for a remote src, but Sanity only
 * ever *derives* dimension metadata, so the schema cannot require it and the
 * generated type stays `number | null`.
 */
function withDimensions<T extends { width: number | null; height: number | null }>(
  image: T,
  what: string,
): T & { width: number; height: number } {
  return {
    ...image,
    width: req(image.width, `${what}.width`),
    height: req(image.height, `${what}.height`),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  // The singleton may legitimately be absent from a fresh dataset; without it
  // the hero has no background, so fail loudly rather than render a broken page.
  const settings = req(
    await sanityClient.fetch(SITE_SETTINGS_QUERY),
    "siteSettings document",
  );
  return { heroBg: { url: req(settings.heroBg.url, "siteSettings.heroBg") } };
}

export async function getProjects(lang: Locale): Promise<Project[]> {
  const rows = await sanityClient.fetch(PROJECTS_QUERY);
  return rows.map((r) => ({
    _id: r._id,
    title: r.title,
    link: r.link,
    description: req(pick(r.description, lang), "project.description"),
    services: (r.services ?? []).map((s) => req(pick(s, lang), "service.title")),
    tools: r.tools ?? [],
    desktopImage: withDimensions(r.desktopImage, "project.desktopImage"),
    mobileImage: withDimensions(r.mobileImage, "project.mobileImage"),
  }));
}

// Every page renders the chat widget, so the build fetches this once.
let projectHosts: Promise<string[]> | undefined;

/** Hostnames of the project websites, for the chat widget's link allow-list. */
export function getProjectHosts(): Promise<string[]> {
  projectHosts ??= sanityClient.fetch(PROJECT_LINKS_QUERY).then((links) => [
    ...new Set(
      links.flatMap((link) => {
        try {
          return [new URL(link).hostname];
        } catch {
          return [];
        }
      }),
    ),
  ]);
  return projectHosts;
}

// ── Home page sections ────────────────────────────────────────────────────────

export type ServiceCard = {
  title: string;
  paragraphs: string[];
  icon: "code" | "migration" | "upgrade" | "design";
};

export async function getServiceCards(lang: Locale): Promise<ServiceCard[]> {
  const rows = await sanityClient.fetch(SERVICE_CARDS_QUERY);
  return rows.map((r) => ({
    title: req(pick(r.title, lang), "serviceCard.title"),
    paragraphs: req(pick(r.text, lang), "serviceCard.text").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    icon: req(r.icon, "serviceCard.icon"),
  }));
}

export type ToolGroup = { caption: string; logos: string[] };

export async function getToolGroups(lang: Locale): Promise<ToolGroup[]> {
  const rows = await sanityClient.fetch(TOOL_GROUPS_QUERY);
  return rows.map((r) => ({
    caption: req(pick(r.caption, lang), "toolGroup.caption"),
    logos: r.logos ?? [],
  }));
}

export type PrincipleGroup = "process" | "quality" | "technical";
export type Principle = { title: string; description: string };

/** The principles by tab, tabs in their fixed order. */
export async function getPrinciples(lang: Locale): Promise<{ group: PrincipleGroup; items: Principle[] }[]> {
  const rows = await sanityClient.fetch(PRINCIPLES_QUERY);
  const groups: PrincipleGroup[] = ["process", "quality", "technical"];
  return groups.map((group) => ({
    group,
    items: rows
      .filter((r) => r.group === group)
      .map((r) => ({
        title: req(pick(r.title, lang), "principle.title"),
        description: req(pick(r.description, lang), "principle.description"),
      })),
  }));
}

export type ContactLink = {
  platform: "contra" | "upwork" | "github" | "linkedin" | "telegram" | "email";
  url: string;
};

// The header, the services and the contacts sections all show these.
let contacts: Promise<ContactLink[]> | undefined;

export function getContacts(): Promise<ContactLink[]> {
  contacts ??= sanityClient.fetch(CONTACTS_QUERY).then((links) =>
    req(links, "contacts document").map((l) => ({
      platform: req(l.platform, "contacts.platform"),
      url: req(l.url, "contacts.url"),
    })),
  );
  return contacts;
}
