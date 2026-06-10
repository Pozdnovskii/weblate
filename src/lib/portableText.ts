// Shared types and helpers for rendering Sanity Portable Text inline content.

export type PTLink = {
  _key: string;
  _type: "link";
  href?: string;
  blank?: boolean;
};

export type PTSpan = {
  _key: string;
  _type: "span";
  text: string;
  marks?: string[];
};

export type TextBlock = {
  _key: string;
  _type: "block";
  style: "normal" | "h2" | "h3" | "h4" | "blockquote";
  listItem?: "bullet" | "number";
  level?: number;
  children: PTSpan[];
  markDefs?: PTLink[];
};

export function escape(text: unknown): string {
  if (text == null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function inlineHTML(
  children: PTSpan[] | null | undefined,
  markDefs: PTLink[] | null | undefined,
): string {
  return (children ?? [])
    .map((span) => {
      let html = escape(span.text);

      for (const mark of span.marks ?? []) {
        const link = (markDefs ?? []).find((m) => m._key === mark);
        if (link) {
          const href = link.href ?? "#";
          const extras = link.blank
            ? ' target="_blank" rel="noopener noreferrer"'
            : "";
          html = `<a href="${escape(href)}"${extras}>${html}</a>`;
        } else if (mark === "strong") html = `<strong>${html}</strong>`;
        else if (mark === "em") html = `<em>${html}</em>`;
        else if (mark === "code") html = `<code>${html}</code>`;
        else if (mark === "underline") html = `<u>${html}</u>`;
        else if (mark === "strike-through") html = `<s>${html}</s>`;
      }

      return html;
    })
    .join("");
}
