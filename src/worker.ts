/**
 * The Worker: Astro answers /api/* (every page is a static asset), and a daily
 * cron scores the chat conversations for Insights (wrangler.jsonc `triggers`).
 * The cron lives here only; idelsoft, in the same organization, has none.
 */
import astro from "@astrojs/cloudflare/entrypoints/server";

import { classifyChats } from "@lib/classify";

export default {
  fetch: astro.fetch,

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      classifyChats({ sanityToken: env.SANITY_ORGANIZATION_TOKEN, anthropicKey: env.ANTHROPIC_API_KEY }).then(
        (result) => console.log({ reason: "chats_classified", ...result }),
        (error) => console.error({ reason: "chat_classification_failed", error: String(error) }),
      ),
    );
  },
} satisfies ExportedHandler<Env>;
