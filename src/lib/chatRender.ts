/**
 * The chat reply's Markdown, the little of it the model writes: paragraphs, "-"
 * and "1." lists, **bold**, [links](url) and bare URLs. Built as DOM nodes, never
 * as HTML, so a reply cannot inject markup.
 *
 * Links: the site's own become paths (so they also work on localhost and
 * workers.dev); a project's website, from the allow-list built from Sanity,
 * opens in a new tab; any other URL stays plain text.
 */

const SITE_HOSTS = new Set(["weblateweb.dev", "www.weblateweb.dev"]);
// A link's words may hold one level of brackets: "[[WIP] Title](url)".
const INLINE = /\*\*(.+?)\*\*|\[((?:[^[\]]|\[[^\]]*\])+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)]+[^\s).,;:!?])/g;
const LIST_ITEM = /^\s*(?:[-*]|\d+\.)\s+/;

export function renderReply(markdown: string, externalHosts: ReadonlySet<string>): DocumentFragment {
  const fragment = document.createDocumentFragment();

  for (const block of markdown.trim().split(/\n{2,}/)) {
    const lines = block.split("\n").filter((line) => line.trim());
    if (lines.length === 0) continue;

    if (lines.every((line) => LIST_ITEM.test(line))) {
      const list = document.createElement(/^\s*\d/.test(lines[0]) ? "ol" : "ul");
      for (const line of lines) {
        const item = document.createElement("li");
        appendAll(item, inline(line.replace(LIST_ITEM, ""), externalHosts));
        list.appendChild(item);
      }
      fragment.appendChild(list);
      continue;
    }

    const paragraph = document.createElement("p");
    lines.forEach((line, index) => {
      if (index > 0) paragraph.appendChild(document.createElement("br"));
      appendAll(paragraph, inline(line, externalHosts));
    });
    fragment.appendChild(paragraph);
  }

  return fragment;
}

function inline(text: string, externalHosts: ReadonlySet<string>): Node[] {
  const nodes: Node[] = [];
  let last = 0;

  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) nodes.push(document.createTextNode(text.slice(last, match.index)));
    last = match.index + match[0].length;

    const [, bold, label, href, bare] = match;
    if (bold !== undefined) {
      const strong = document.createElement("strong");
      appendAll(strong, inline(bold, externalHosts));
      nodes.push(strong);
    } else {
      nodes.push(link(label ?? bare, href ?? bare, externalHosts));
    }
  }

  if (last < text.length) nodes.push(document.createTextNode(text.slice(last)));
  return nodes;
}

// appendChild, not append: the Workers types in scope redeclare append() for HTMLRewriter.
function appendAll(parent: Node, nodes: Node[]) {
  for (const node of nodes) parent.appendChild(node);
}

/** A link to the site or to a project's website, or else just its words. */
function link(label: string, href: string, externalHosts: ReadonlySet<string>): Node {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return document.createTextNode(label);
  }

  const anchor = document.createElement("a");
  if (SITE_HOSTS.has(url.hostname)) {
    anchor.href = url.pathname + url.search + url.hash;
  } else if (url.protocol === "https:" && externalHosts.has(url.hostname)) {
    anchor.href = url.href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  } else {
    return document.createTextNode(label);
  }
  anchor.textContent = label === href ? url.hostname + url.pathname.replace(/\/$/, "") : label;
  return anchor;
}
