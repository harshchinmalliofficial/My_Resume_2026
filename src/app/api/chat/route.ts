import { createHash } from "node:crypto";
import { HTTP, classifyError } from "@/lib/chat/errors";
import { SYSTEM_PROMPT, offlineAnswer } from "@/lib/chat/knowledge";
import { generateReply } from "@/lib/chat/provider";
import { checkLimits, configFromEnv, memoryStore, upstashStore, type Store } from "@/lib/chat/ratelimit";
import { parseChatBody } from "@/lib/chat/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const json = (body: object, status: number, headers: Record<string, string> = {}) => Response.json(body, { status, headers: { ...NO_STORE, ...headers } });

const memory = memoryStore();
const upstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? upstashStore(process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN) : null;
// Falls back to memory if Redis errors, so a limiter outage never exposes the free-tier quota.
const store: Store = { incr: async (k, t) => (upstash ? upstash.incr(k, t).catch(() => memory.incr(k, t)) : memory.incr(k, t)) };

// Browsers send Origin on cross-site POSTs. Same-origin (host match) and configured origins pass.
function originAllowed(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const u = new URL(origin);
    if (u.host === req.headers.get("host")) return true;
    return (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).includes(u.origin);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!originAllowed(req)) return json({ error: "Origin not allowed.", code: "forbidden" }, 403);
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return json({ error: "Content-Type must be application/json.", code: "bad_request" }, 415);

  const parsed = parseChatBody(await req.text());
  if (!parsed.ok) return json({ error: parsed.error, code: parsed.code }, parsed.status);
  const question = parsed.messages[parsed.messages.length - 1].content;
  const fallback = offlineAnswer(question);

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const visitor = createHash("sha256").update(`${ip}|${process.env.CHAT_HASH_SALT ?? "portfolio"}`).digest("hex").slice(0, 24);
  const limit = await checkLimits(store, visitor, configFromEnv(process.env));
  if (!limit.allowed) {
    const message = limit.code === "daily_limit" ? "The assistant has reached its daily limit for the free tier." : "You are sending messages quickly. Please wait a moment and try again.";
    return json({ error: message, code: limit.code, fallback }, 429, { "Retry-After": String(limit.retryAfter) });
  }

  try {
    const reply = await generateReply(parsed.messages, SYSTEM_PROMPT);
    return json({ reply, source: "ai" }, 200);
  } catch (err) {
    const kind = classifyError(err);
    console.error(`[chat] provider failure: ${kind} (${(err as Error).message})`); // no keys, no visitor text
    const h = HTTP[kind];
    return json({ error: h.message, code: h.code, fallback }, h.status);
  }
}
