import { getAbsoluteLocaleUrl, getRelativeLocaleUrl } from "astro:i18n";
import { type Locale, defaultLang } from "./ui";

const LOCALES: Locale[] = ["en", "bg", "es"];

/** A translatedField() object from Studio: one key per locale, `en` required. */
export type Translated<T = string> = Partial<Record<Locale, T>>;

/**
 * Picks a locale out of a translatedField object, falling back to English.
 *
 * This is the JS equivalent of the GROQ `coalesce(field.bg, field.en)` the
 * queries used to do. It moved out of GROQ so the query text can be a single
 * static string: Sanity TypeGen only evaluates literal constants inside
 * template interpolation, so a projection built per-locale by a function is
 * untypeable. Fetching all locales at once also collapses three per-locale
 * round trips into one.
 */
export function pick<T>(
  field: Translated<T> | null | undefined,
  lang: Locale,
): T | null {
  return field?.[lang] ?? field?.[defaultLang] ?? null;
}

/**
 * Like pick(), but for a value nested inside the locale object — mirroring
 * `coalesce(field.bg.a.b, field.en.a.b)`.
 *
 * The difference matters and is easy to get wrong: pick() falls back when the
 * whole *locale entry* is missing, this falls back when the *leaf* is missing.
 * A Bulgarian entry that exists but has an empty slug must still fall back to
 * the English slug — pick(...)?.current would return null instead.
 */
export function pickDeep<T, R>(
  field: Translated<T> | null | undefined,
  lang: Locale,
  get: (v: T) => R | null | undefined,
): R | null {
  const localized = field?.[lang];
  const fromLang = localized == null ? null : (get(localized) ?? null);
  if (fromLang != null) return fromLang;
  const fallback = field?.[defaultLang];
  return fallback == null ? null : (get(fallback) ?? null);
}

/**
 * Generates a relative URL for a specific locale, ensuring there is no trailing slash
 * (unless it's the root path "/"). This aligns with the trailingSlash: "never" config.
 */
export function getCleanRelativeLocaleUrl(locale: Locale, path: string): string {
  const url = getRelativeLocaleUrl(locale, path);
  return url.length > 1 && url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Per-locale absolute URLs for the current path, used for hreflang and the
 * language switcher. Strips ".html" (build.format: "file"), the locale prefix
 * and any trailing slash to get the shared slug, then rebuilds each locale URL.
 * Pages with translated slugs (e.g. articles) pass their own alternateUrls instead.
 */
export function defaultAlternateUrls(url: URL): Record<Locale, string> {
  const slug = url.pathname
    .replace(/index\.html$/, "")
    .replace(/\.html$/, "")
    .replace(/^\/(bg|es)(\/|$)/, "")
    .replace(/^\//, "")
    .replace(/\/$/, "");

  return Object.fromEntries(
    LOCALES.map((l) => [
      l,
      slug ? getAbsoluteLocaleUrl(l, slug) : getAbsoluteLocaleUrl(l),
    ]),
  ) as Record<Locale, string>;
}
