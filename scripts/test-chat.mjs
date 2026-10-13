// Run: npm test  (uses node:test and Node's native TypeScript stripping; no extra dependencies)
import test from "node:test";
import assert from "node:assert/strict";
import { parseChatBody, LIMITS } from "../src/lib/chat/validate.ts";
import { classifyError, ProviderError } from "../src/lib/chat/errors.ts";
import { checkLimits, memoryStore, configFromEnv } from "../src/lib/chat/ratelimit.ts";

const body = (messages) => JSON.stringify({ messages });

test("accepts a valid conversation and drops a leading assistant turn", () => {
  const r = parseChatBody(body([{ role: "assistant", content: "hi" }, { role: "user", content: "What is MCP Gateway?" }]));
  assert.equal(r.ok, true);
  assert.deepEqual(r.messages, [{ role: "user", content: "What is MCP Gateway?" }]);
});
test("rejects malformed JSON, empty arrays, bad roles, empty text", () => {
  for (const raw of ["{", body([]), body([{ role: "system", content: "x" }]), body([{ role: "user", content: "   " }]), JSON.stringify({}), body([{ role: "user", content: 5 }])]) {
    const r = parseChatBody(raw);
    assert.equal(r.ok, false);
    assert.equal(r.status, 400);
  }
});
test("rejects oversized messages and oversized bodies", () => {
  assert.equal(parseChatBody(body([{ role: "user", content: "a".repeat(LIMITS.maxChars + 1) }])).code, "too_long");
  assert.equal(parseChatBody("x".repeat(LIMITS.maxBodyBytes + 1)).status, 413);
});
test("requires the last message to be from the user and strips control characters", () => {
  assert.equal(parseChatBody(body([{ role: "user", content: "a" }, { role: "assistant", content: "b" }])).ok, false);
  assert.equal(parseChatBody(body([{ role: "user", content: "he\u0000llo\u0007" }])).messages[0].content, "hello");
});
test("keeps only the most recent messages", () => {
  const many = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `m${i}` }));
  many.push({ role: "user", content: "last" });
  const r = parseChatBody(body(many));
  assert.ok(r.messages.length <= LIMITS.maxMessages);
  assert.equal(r.messages.at(-1).content, "last");
});
test("classifies provider failures", () => {
  assert.equal(classifyError({ status: 429 }), "quota");
  assert.equal(classifyError(new Error("RESOURCE_EXHAUSTED: quota exceeded")), "quota");
  assert.equal(classifyError({ status: 403 }), "config");
  assert.equal(classifyError(Object.assign(new Error("x"), { name: "TimeoutError" })), "timeout");
  assert.equal(classifyError({ status: 500 }), "upstream");
  assert.equal(classifyError(new ProviderError("empty", "e")), "empty");
});
test("per-visitor limit blocks the sixth request in a minute and isolates visitors", async () => {
  const store = memoryStore();
  const cfg = { perMinute: 5, perHour: 100, perDay: 1000 };
  for (let i = 0; i < 5; i++) assert.equal((await checkLimits(store, "a", cfg, 1_000_000_000_000)).allowed, true);
  const blocked = await checkLimits(store, "a", cfg, 1_000_000_000_000);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.code, "rate_limited");
  assert.ok(blocked.retryAfter > 0 && blocked.retryAfter <= 60);
  assert.equal((await checkLimits(store, "b", cfg, 1_000_000_000_000)).allowed, true);
});
test("global daily ceiling applies across visitors", async () => {
  const store = memoryStore();
  const cfg = { perMinute: 50, perHour: 50, perDay: 3 };
  const t = 1_000_000_000_000;
  for (const v of ["a", "b", "c"]) assert.equal((await checkLimits(store, v, cfg, t)).allowed, true);
  const r = await checkLimits(store, "d", cfg, t);
  assert.equal(r.code, "daily_limit");
});
test("config falls back to defaults on bad env values", () => {
  assert.deepEqual(configFromEnv({ CHAT_RATE_LIMIT_PER_MIN: "abc", CHAT_DAILY_LIMIT: "-4" }), { perMinute: 5, perHour: 30, perDay: 300 });
  assert.equal(configFromEnv({ CHAT_DAILY_LIMIT: "10" }).perDay, 10);
});
