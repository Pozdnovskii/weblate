/**
 * The site chat. The visitor's question is run as a semantic search over the
 * site's content in Sanity (the dataset's embeddings), and the matches go to
 * Claude with the question, so it answers in one pass, without tools. Same
 * approach as the idelsoft chat, where attaching the Sanity Context MCP endpoint
 * as a tool cost ~2 s and twice the tokens per reply.
 *
 * Shared by /api/chat and scripts/ask.ts, so it must stay free of Worker- and
 * Astro-only imports (no `astro:i18n`, no path aliases).
 */
import Anthropic from "@anthropic-ai/sdk";

export const CHAT_MODEL = "claude-haiku-5-5";
/** USD per 1M tokens (prompts up to 100K tokens). */
export const CHAT_PRICE = { input: 0.1, output: 0.5 };

export const CHAT_LOCALES = ["en", "bg", "es"] as const;
export type ChatLocale = (typeof CHAT_LOCALES)[number];

const SITE = "https://weblateweb.dev";
/** The public dataset: no token needed to read it. */
const SANITY_QUERY_URL = "https://64abwet3.api.sanity.io/v2026-11-03/data/query/production";

/**
 * What the search looks through. A type here also needs to be in the dataset's
 * embeddings projection (`sanity datasets embeddings enable`), or semantic search
 * never finds it.
 */
const SEARCHED_TYPES = ["thought", "project", "service", "tool"];
const HITS = 5;
/** Messages of the conversation the model reads: the latest, starting with a question. */
const CONTEXT_MESSAGES = 10;
/** Characters of a document's text given to the model; the start carries the gist. */
const TEXT_MAX = 4000;

/** The English page has no prefix (`prefixDefaultLocale: false`). */
const home = (locale: ChatLocale) => (locale === "en" ? `${SITE}/` : `${SITE}/${locale}`);

const URLS: Record<string, (hit: Hit, locale: ChatLocale) => string | null> = {
  thought: (hit, locale) => {
    const slug = loc(hit.slug, locale)?.current;
    return slug ? `${locale === "en" ? SITE : `${SITE}/${locale}`}/thoughts/${slug}` : null;
  },
  project: (_, locale) => `${home(locale)}#projects`,
  service: (_, locale) => `${home(locale)}#services`,
  tool: (_, locale) => `${home(locale)}#tools`,
};

// Every locale is fetched and one is chosen in JS (`loc`), like src/lib/queries.ts.
const PROJECTION = `{
  _type, title, name, description, link, slug,
  "body": { "en": pt::text(body.en), "bg": pt::text(body.bg), "es": pt::text(body.es) },
  faq[]{ question, answer },
  "services": services[]->title,
  "tools": tools[]->name,
  "projects": *[_type == "project" && references(^._id)] | order(order asc){ title, description, link }
}`;
const SEMANTIC_QUERY = `*[_type in $types] | score(text::semanticSimilarity($q)) | order(_score desc)[0...${HITS}]${PROJECTION}`;
/** When semantic search fails (quota used up, embeddings off): keyword matching. */
const KEYWORD_QUERY = `*[_type in $types] | score([
  name, title.en, title.bg, title.es, title, description.en, description.bg, description.es,
  pt::text(body.en), pt::text(body.bg), pt::text(body.es)
] match $q) | order(_score desc)[0...${HITS}]${PROJECTION}`;

/** Per locale only for the contacts link; the rest is the same text. */
const system = (locale: ChatLocale) => `You are the assistant on weblateweb.dev, the personal site of Ivan Pozdnovskii (Иван Поздновски in Bulgarian), a web developer. Speak about Ivan in the third person; you are his site's assistant, not Ivan himself.
About Ivan: he builds fast-loading, SEO-friendly, accessible websites with Astro, Webstudio, Webflow and Shopify, and prefers clean code. To reach him, point to the contacts at the bottom of the home page: ${home(locale)}#contacts
Each visitor message comes with <search_results> found on the site for it. Answer from them and the facts above only. If they do not cover the question, say so plainly. Never make anything up.
Your text goes straight to the visitor as the reply: write in the language of their question, briefly, with no preamble or notes to yourself.
Link the pages you used as Markdown links with the page title as the words, using the url given: [Title](url). A project's own website may be linked the same way. Never write a bare URL.`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

type Localized<T> = Partial<Record<ChatLocale, T | null>> | null;
type Hit = {
  _type: string;
  title: Localized<string> | string | null;
  name: string | null;
  description: Localized<string> | null;
  link: string | null;
  slug: Localized<{ current?: string }>;
  body: Localized<string>;
  faq: { question: Localized<string>; answer: Localized<string> }[] | null;
  services: Localized<string>[] | null;
  tools: (string | null)[] | null;
  projects: { title: string | null; description: Localized<string>; link: string | null }[] | null;
};

export type ChatEvent =
  | { type: "text"; text: string }
  /** The search done before the model was called. */
  | { type: "search"; query: string; semantic: boolean; titles: string[]; ms: number }
  /** The API response, once the reply is complete. */
  | { type: "response"; message: Anthropic.Message };

/**
 * Streams the reply to the last user message: the search, text deltas, the
 * finished API response. `locale` is the page's locale: it picks which
 * translation the model reads and where the links point.
 */
export async function* streamChat(
  client: Anthropic,
  history: ChatMessage[],
  locale: ChatLocale,
): AsyncGenerator<ChatEvent> {
  // A follow-up ("and the second one?") is searched together with the question
  // before it, which carries the topic.
  const users = history.filter((m) => m.role === "user").map((m) => m.content);
  const query = users.slice(-2).join("\n");

  const started = Date.now();
  const { hits, semantic } = await search(query);
  yield { type: "search", query, semantic, titles: hits.map((h) => titleOf(h, locale)), ms: Date.now() - started };

  const recent = history.slice(-CONTEXT_MESSAGES);
  if (recent[0].role === "assistant") recent.shift();
  const question = recent.at(-1)!.content;
  const messages: Anthropic.MessageParam[] = [
    ...recent.slice(0, -1),
    { role: "user", content: `${contextBlock(hits, locale)}\n\n<question>\n${question}\n</question>` },
  ];

  const stream = client.messages.stream({
    model: CHAT_MODEL,
    max_tokens: 8000,
    output_config: { effort: "low" },
    system: system(locale),
    messages,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield { type: "text", text: event.delta.text };
    }
  }

  yield { type: "response", message: await stream.finalMessage() };
}

async function search(q: string): Promise<{ hits: Hit[]; semantic: boolean }> {
  try {
    return { hits: await groq(SEMANTIC_QUERY, q), semantic: true };
  } catch (error) {
    console.error({ reason: "semantic_search_failed", error: String(error) });
    return { hits: await groq(KEYWORD_QUERY, q), semantic: false };
  }
}

async function groq(query: string, q: string): Promise<Hit[]> {
  const response = await fetch(SANITY_QUERY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, params: { q, types: SEARCHED_TYPES } }),
  });
  if (!response.ok) throw new Error(`Sanity query: HTTP ${response.status} ${await response.text()}`);
  return ((await response.json()) as { result: Hit[] }).result;
}

/**
 * The value in `locale`, else English. Falls back per leaf, like `pickDeep`:
 * a present-but-empty translation still gets the English value.
 */
function loc<T>(value: Localized<T> | undefined, locale: ChatLocale): T | null {
  return value?.[locale] || value?.en || null;
}

const titleOf = (hit: Hit, locale: ChatLocale) =>
  (typeof hit.title === "string" ? hit.title : loc(hit.title, locale)) ?? hit.name ?? "";

const escape = (value: string) => value.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

function documentText(hit: Hit, locale: ChatLocale): string {
  const parts = [loc(hit.description, locale), loc(hit.body, locale)?.slice(0, TEXT_MAX)];
  if (hit.link) parts.push(`Website: ${hit.link}`);
  if (hit.services?.length) parts.push(`Services: ${hit.services.map((s) => loc(s, locale)).filter(Boolean).join(", ")}`);
  if (hit.tools?.length) parts.push(`Technologies: ${hit.tools.filter(Boolean).join(", ")}`);
  for (const item of hit.faq ?? []) parts.push(`Q: ${loc(item.question, locale)}\nA: ${loc(item.answer, locale)}`);
  if (hit.projects?.length) {
    const projects = hit.projects.map((p) =>
      [`- ${p.title}`, p.link && `(${p.link})`, loc(p.description, locale) && `: ${loc(p.description, locale)}`]
        .filter(Boolean)
        .join(" "),
    );
    parts.push(`Projects:\n${projects.join("\n")}`);
  }
  return parts.filter(Boolean).join("\n\n");
}

function contextBlock(hits: Hit[], locale: ChatLocale): string {
  const documents = hits.flatMap((hit) => {
    const url = URLS[hit._type]?.(hit, locale);
    if (!url) return [];
    const title = escape(titleOf(hit, locale));
    return [`<document type="${hit._type}" title="${title}" url="${url}">\n${documentText(hit, locale)}\n</document>`];
  });
  return `<search_results>\n${documents.join("\n")}\n</search_results>`;
}

export const chatCost = (usage: Anthropic.Usage) =>
  ((usage.input_tokens + (usage.cache_read_input_tokens ?? 0)) * CHAT_PRICE.input +
    usage.output_tokens * CHAT_PRICE.output) /
  1e6;
