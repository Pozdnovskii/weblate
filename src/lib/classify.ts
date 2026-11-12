/**
 * Scores the recorded chat conversations for the Insights dashboard: success 1–10,
 * sentiment, and the content the visitor asked for but the site lacks. Sanity's
 * own classifier does the work with our model; it picks the conversations idle
 * for 10 minutes or more that are not scored yet, so running it often is harmless.
 *
 * It cannot filter by `metadata.app`: it takes every conversation in the
 * organization. So this site's daily cron (src/worker.ts) scores idelsoft's too,
 * and idelsoft keeps only a manual `pnpm classify`.
 */
import { createAnthropic } from "@ai-sdk/anthropic";
import { classifyConversations } from "@sanity/context/insights";

import { CHAT_MODEL } from "./chat.ts";
import { contextClient } from "./insights.ts";

export function classifyChats(keys: { sanityToken: string; anthropicKey: string }) {
  return classifyConversations({
    client: contextClient(keys.sanityToken),
    model: createAnthropic({ apiKey: keys.anthropicKey })(CHAT_MODEL),
  });
}
