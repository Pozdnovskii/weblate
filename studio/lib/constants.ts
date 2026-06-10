import { defineField } from "sanity";
import type { Locale } from "@i18n/ui";
import { languages, defaultLang } from "@i18n/ui";

export const LANGUAGES = Object.keys(languages) as Locale[];
export const LANGUAGE_TITLES = languages;
export const DEFAULT_LOCALE = defaultLang;

/**
 * Translated field: one sub-field per language under an object.
 * required:
 *   "default" — only the default locale is required (default)
 *   "all"     — all languages required
 *   false     — none required
 */
export function translatedField(
  name: string,
  title: string,
  {
    required = "default" as "all" | "default" | false,
    type = "string",
    group,
    rows,
  }: {
    required?: "all" | "default" | false;
    type?: string;
    group?: string;
    rows?: number;
  } = {},
) {
  return defineField({
    name,
    title,
    type: "object",
    group,
    fields: LANGUAGES.map((lang) =>
      defineField({
        name: lang,
        title: LANGUAGE_TITLES[lang],
        type,
        ...(type === "text" && rows !== undefined ? { rows } : {}),
        validation:
          required === "all" || (required === "default" && lang === DEFAULT_LOCALE)
            ? (r) => r.required()
            : undefined,
      }),
    ),
  });
}
