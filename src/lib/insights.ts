/**
 * Chat conversations recorded in Sanity Context, for the Insights dashboard
 * (Sanity Dashboard → Context → Insights). Each save sends the whole transcript
 * for the thread and replaces the stored one. Nothing is shared with Sanity
 * itself: `sharing` is left at its default, off.
 *
 * Insights belongs to the organization, which idelsoft shares: `metadata.app`
 * tells this site's conversations from idelsoft's.
 *
 * Needs an organization token with Context Editor access or higher; a Viewer
 * token gets 403 on save.
 */
import { createClient } from "@sanity/client";

import { CHAT_MODEL, type ChatMessage } from "./chat.ts";

const ORGANIZATION_ID = "oH5Bqfh8T";
const APP = "weblate";

/** What the widget may send as a thread id: its own `crypto.randomUUID()`. */
export const isThreadId = (value: unknown): value is string =>
  typeof value === "string" && /^[\w-]{8,64}$/.test(value);

export type Turn = {
  threadId: string;
  /** The conversation so far, ending with the question just answered. */
  history: ChatMessage[];
  reply: string;
  /** Why the reply failed, if it did. */
  error?: string;
  usage: { input: number; output: number };
};

/** The organization's Context API, where conversations are stored. */
export const contextClient = (token: string) =>
  createClient({
    apiVersion: "2026-11-03",
    token,
    context: { organizationId: ORGANIZATION_ID },
    useCdn: false,
    useProjectHostname: false,
  });

export async function saveConversation(token: string, turn: Turn): Promise<void> {
  const messages = [
    ...turn.history.map(({ role, content }) => ({ role, content })),
    { role: "assistant" as const, content: turn.reply || null, error: turn.error ?? null },
  ];

  await contextClient(token).context.request("PUT /organizations/{organizationId}/conversations/{threadId}", {
    params: { threadId: turn.threadId },
    body: {
      messages,
      modelProvider: "anthropic",
      modelId: CHAT_MODEL,
      tokenUsage: {
        inputTokens: turn.usage.input,
        outputTokens: turn.usage.output,
        totalTokens: turn.usage.input + turn.usage.output,
      },
      metadata: { app: APP },
    },
  });
}
