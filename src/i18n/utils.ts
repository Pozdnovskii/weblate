import { getAbsoluteLocaleUrl, getRelativeLocaleUrl } from "astro:i18n";
import { type Locale } from "./ui";

const LOCALES: Locale[] = ["en", "bg", "es"];

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
