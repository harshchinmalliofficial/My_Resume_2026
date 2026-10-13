// Pure request validation. Visitor input is untrusted: shape, size, and characters are enforced here.
export const LIMITS = { maxMessages: 8, maxChars: 500, maxBodyBytes: 16384 };

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type Parsed = { ok: true; messages: ChatMessage[] } | { ok: false; status: number; code: string; error: string };

const bad = (status: number, code: string, error: string): Parsed => ({ ok: false, status, code, error });

// Strips control characters except newline and tab.
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

export function parseChatBody(raw: string): Parsed {
  if (new TextEncoder().encode(raw).length > LIMITS.maxBodyBytes) return bad(413, "too_large", "Request is too large.");
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return bad(400, "bad_request", "Request body must be valid JSON.");
  }
  const list = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(list) || list.length === 0) return bad(400, "bad_request", "Provide a non-empty messages array.");

  const out: ChatMessage[] = [];
  for (const m of list.slice(-LIMITS.maxMessages)) {
    const role = (m as { role?: unknown })?.role;
    const content = (m as { content?: unknown })?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return bad(400, "bad_request", "Each message needs a role and text content.");
    const text = clean(content);
    if (!text) return bad(400, "bad_request", "Messages cannot be empty.");
    if (text.length > LIMITS.maxChars) return bad(400, "too_long", `Messages are limited to ${LIMITS.maxChars} characters.`);
    out.push({ role, content: text });
  }
  while (out.length && out[0].role !== "user") out.shift(); // the model must start with the visitor
  if (!out.length || out[out.length - 1].role !== "user") return bad(400, "bad_request", "The last message must be from the user.");
  return { ok: true, messages: out };
}
