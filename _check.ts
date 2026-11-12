import { contextClient } from "./src/lib/insights.ts";
const c: any = contextClient(process.env.SANITY_ORGANIZATION_TOKEN!);
try {
  const r = await c.context.request("GET /organizations/{organizationId}/conversations/{threadId}", { params: { threadId: process.argv[2] } });
  console.log(JSON.stringify(r).slice(0, 600));
} catch (e: any) { console.log("ERR", e.statusCode, e.message?.slice(0, 300)); }
