export const prerender = false;

import Anthropic from "@anthropic-ai/sdk";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { CHAT_LOCALES, type ChatLocale, type ChatMessage, chatCost, streamChat } from "@lib/chat";
import { isThreadId, saveConversation } from "@lib/insights";

const MESSAGE_MAX = 1000;
/**
 * Visitor and assistant messages together, the whole conversation as Insights
 * records it; older ones are the client's to drop. The model reads only the
 * last few (see streamChat).
 */
const HISTORY_MAX = 40;
/** Assistant replies come back from the client too; long, but not unbounded. */
const REPLY_MAX = 8000;

const fail = (status: number) => new Response(null, { status });

/** Last item a visitor message, every item a role and non-empty text within the limits. */
function parseHistory(body: unknown): ChatMessage[] | null {
  const messages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > HISTORY_MAX) return null;

  for (const m of messages) {
    if (typeof m !== "object" || m === null) return null;
    const { role, content } = m as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.trim() === "") return null;
    if (content.length > (role === "user" ? MESSAGE_MAX : REPLY_MAX)) return null;
  }
  if (messages[0].role !== "user" || messages.at(-1).role !== "user") return null;

  return messages.map(({ role, content }) => ({ role, content }));
}

/** The page's locale, sent by the widget; anything else falls back to English. */
function parseLocale(body: unknown): ChatLocale {
  const locale = (body as { locale?: unknown }).locale;
  return CHAT_LOCALES.find((l) => l === locale) ?? "en";
}

/**
 * The chat widget's endpoint: same origin only, rate limit per IP, then the reply
 * streamed as plain text. Failures are logged here (Workers log), the client gets a
 * bare status.
 */
export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  if (request.headers.get("origin") !== new URL(request.url).origin) return fail(403);

  const ip = clientAddress || "unknown";
  const { success: withinLimit } = await env.CHAT_RATE_LIMIT.limit({ key: ip });
  if (!withinLimit) {
    console.error({ reason: "rate_limited", ip });
    return fail(429);
  }

  const body = await request.json().catch(() => null);
  const history = parseHistory(body);
  if (!history) return fail(400);
  const locale = parseLocale(body);
  // Without one (an older page still open) the conversation simply isn't recorded.
  const threadId = (body as { threadId?: unknown }).threadId;

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let cost = 0;
      let search = {};
      let reply = "";
      const usage = { input: 0, output: 0 };
      let failure: string | undefined;
      try {
        for await (const event of streamChat(client, history, locale)) {
          if (event.type === "text") {
            reply += event.text;
            controller.enqueue(encoder.encode(event.text));
          } else if (event.type === "search") {
            search = { semantic: event.semantic, searchMs: event.ms };
          } else {
            cost += chatCost(event.message.usage);
            usage.input += event.message.usage.input_tokens;
            usage.output += event.message.usage.output_tokens;
          }
        }
        console.log({ reason: "chat", ip, locale, turns: history.length, ...search, cost: Number(cost.toFixed(4)) });
        controller.close();
      } catch (error) {
        failure = String(error);
        console.error({ reason: "chat_failed", ip, error: failure });
        controller.error(error);
      }

      // After the reply is out, so the visitor never waits on it.
      if (isThreadId(threadId)) {
        locals.cfContext.waitUntil(
          saveConversation(env.SANITY_ORGANIZATION_TOKEN, { threadId, history, reply, error: failure, usage }).catch(
            (error) => console.error({ reason: "conversation_save_failed", error: String(error) }),
          ),
        );
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
};
