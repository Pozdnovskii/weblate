/**
 * The site chat from the terminal, for trying questions and prompt changes.
 *
 *   pnpm ask "your question"
 *   pnpm ask --bg "въпрос"      (the page locale: picks translations and link URLs; default en)
 *
 * Needs ANTHROPIC_API_KEY in .env.
 * The full API responses of the last run go to _internal/ask/last.json (gitignored).
 */
import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, writeFileSync } from "node:fs";
import { CHAT_LOCALES, CHAT_MODEL, type ChatLocale, chatCost, streamChat } from "../src/lib/chat.ts";

const LOG_DIR = "_internal/ask";

const args = process.argv.slice(2);
const flag = args.find((a) => a.startsWith("--"));
const locale = (flag?.slice(2) ?? "en") as ChatLocale;
if (!CHAT_LOCALES.includes(locale)) throw new Error(`locale must be one of ${CHAT_LOCALES.join(", ")}`);
const question = args.filter((a) => a !== flag).join(" ").trim();
if (!question) throw new Error('usage: pnpm ask [--en|--bg|--es] "your question"');

const responses: Anthropic.Message[] = [];
let cost = 0;
const started = Date.now();
let firstText = 0;

for await (const event of streamChat(new Anthropic(), [{ role: "user", content: question }], locale)) {
  if (event.type === "text") {
    if (!firstText) firstText = Date.now() - started;
    process.stdout.write(event.text);
    continue;
  }
  if (event.type === "search") {
    const kind = event.semantic ? "semantic" : "keyword";
    console.log(`[${kind} search, ${event.ms} ms] ${event.titles.join(" | ")}\n`);
    continue;
  }
  const { message } = event;
  responses.push(message);
  cost += chatCost(message.usage);
  if (message.stop_reason === "refusal") console.log(`\n[refused: ${message.stop_details?.category ?? "unknown"}]`);
  if (message.stop_reason === "max_tokens") console.log("\n[cut off: max_tokens]");
}

console.log("\n");

mkdirSync(LOG_DIR, { recursive: true });
writeFileSync(`${LOG_DIR}/last.json`, JSON.stringify({ question, locale, responses }, null, 2));

const usage = responses.reduce(
  (sum, m) => ({ input: sum.input + m.usage.input_tokens, output: sum.output + m.usage.output_tokens }),
  { input: 0, output: 0 },
);
console.log(`— ${CHAT_MODEL}: ${usage.input} in / ${usage.output} out tokens, ≈ $${cost.toFixed(4)}`);
console.log(`— first text after ${firstText} ms, done after ${Date.now() - started} ms`);
console.log(`— full response: ${LOG_DIR}/last.json`);
