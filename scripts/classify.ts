/**
 * Scores the chat conversations waiting in Insights now, instead of at the daily
 * cron (src/worker.ts). Scores idelsoft's conversations too: the classifier takes
 * the whole organization. Needs SANITY_ORGANIZATION_TOKEN (Context Editor) and
 * ANTHROPIC_API_KEY in .env.
 *
 *   pnpm classify
 */
import { classifyChats } from "../src/lib/classify.ts";

const result = await classifyChats({
  sanityToken: process.env.SANITY_ORGANIZATION_TOKEN!,
  anthropicKey: process.env.ANTHROPIC_API_KEY!,
});
console.log(`${result.successCount} of ${result.totalFound} classified, ${result.errorCount} failed`);
