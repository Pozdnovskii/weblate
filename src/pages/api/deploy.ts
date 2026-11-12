export const prerender = false;

import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

/**
 * Rebuilds the site: the Deploy button in the Studio navbar posts here, and this
 * calls the Workers Builds deploy hook (`SANITY_DEPLOY_HOOK`, a dashboard
 * secret). Same as canary-real. The hook URL stays out of the Studio bundle,
 * which is public.
 */
const STUDIO = "https://weblate.sanity.studio";

const cors = {
  "Access-Control-Allow-Origin": STUDIO,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
};

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: cors });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Not a lock (anyone can send this header), only a filter for stray requests.
  const origin = request.headers.get("origin");
  if (origin !== STUDIO && !origin?.startsWith("http://localhost:")) {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403, headers: cors });
  }
  // Each build takes minutes: a burst of clicks or requests starts a few, not dozens.
  const { success } = await env.CHAT_RATE_LIMIT.limit({ key: `deploy:${clientAddress}` });
  if (!success) return Response.json({ ok: false, error: "Too many requests" }, { status: 429, headers: cors });

  if (!env.SANITY_DEPLOY_HOOK) {
    return Response.json({ ok: false, error: "Deploy hook not configured" }, { status: 500, headers: cors });
  }
  try {
    const res = await fetch(env.SANITY_DEPLOY_HOOK, { method: "POST" });
    if (!res.ok) return Response.json({ ok: false, error: `HTTP ${res.status}` }, { status: 502, headers: cors });
    return Response.json({ ok: true }, { headers: cors });
  } catch (error) {
    console.error({ reason: "deploy_hook_failed", error: String(error) });
    return Response.json({ ok: false, error: String(error) }, { status: 502, headers: cors });
  }
};
