// Run: npm test  (node:test + native TypeScript stripping)
import test from "node:test";
import assert from "node:assert/strict";
import { dayPeriod, pickMessage, canShow, dailyIndex } from "../src/lib/personality/select.ts";
import { parseCommand, suggest, COMMANDS } from "../src/lib/personality/commands.ts";
import * as content from "../src/content/personality.ts";

test("dayPeriod maps local hours to the right pool, including boundaries", () => {
  const cases = [[0, "night"], [4, "night"], [5, "morning"], [11, "morning"], [12, "afternoon"], [16, "afternoon"], [17, "evening"], [21, "evening"], [22, "night"], [23, "night"]];
  for (const [h, p] of cases) assert.equal(dayPeriod(h), p, `hour ${h}`);
});

test("pickMessage avoids repeats within a session until the pool is exhausted", () => {
  const pool = [{ id: "a" }, { id: "b" }, { id: "c" }];
  let recent = [];
  const seen = [];
  for (let i = 0; i < 3; i++) {
    const r = pickMessage(pool, recent, () => 0);
    seen.push(r.message.id);
    recent = r.recent;
  }
  assert.deepEqual([...seen].sort(), ["a", "b", "c"]);
  // exhausted: starts over, but not with the message just shown
  const next = pickMessage(pool, recent, () => 0);
  assert.notEqual(next.message.id, seen[2]);
  assert.deepEqual(next.recent, [next.message.id]);
});

test("pickMessage handles empty and single-item pools", () => {
  assert.equal(pickMessage([], []), null);
  const one = pickMessage([{ id: "x" }], ["x"], () => 0.9);
  assert.equal(one.message.id, "x");
});

test("pickMessage never indexes out of range for rng values up to 1", () => {
  const pool = [{ id: "a" }, { id: "b" }];
  assert.ok(pickMessage(pool, [], () => 0.9999999));
  assert.ok(pickMessage(pool, [], () => 1));
});

test("canShow enforces max count, cooldown and dismissal", () => {
  const rule = { max: 2, minGapMs: 60_000 };
  assert.equal(canShow({ shown: 0, lastAt: null, dismissed: false }, rule, 1000), true);
  assert.equal(canShow({ shown: 1, lastAt: 1000, dismissed: false }, rule, 30_000), false, "within cooldown");
  assert.equal(canShow({ shown: 1, lastAt: 1000, dismissed: false }, rule, 61_000), true, "cooldown elapsed");
  assert.equal(canShow({ shown: 2, lastAt: 1000, dismissed: false }, rule, 999_999), false, "max reached");
  assert.equal(canShow({ shown: 0, lastAt: null, dismissed: true }, rule, 1000), false, "dismissed");
});

test("dailyIndex is deterministic per date and in range", () => {
  assert.equal(dailyIndex(2026, 9, 14, 8), dailyIndex(2026, 9, 14, 8));
  assert.notEqual(dailyIndex(2026, 9, 14, 8), dailyIndex(2026, 9, 15, 8));
  for (let d = 1; d < 40; d++) {
    const i = dailyIndex(2026, 0, d, 8);
    assert.ok(i >= 0 && i < 8);
  }
  assert.equal(dailyIndex(2026, 0, 1, 0), 0);
});

test("parseCommand accepts only allowlisted commands, case and spacing insensitive", () => {
  for (const c of COMMANDS) assert.deepEqual(parseCommand(c), { ok: true, name: c, args: [] });
  assert.deepEqual(parseCommand("  PROJECTS   mcp "), { ok: true, name: "projects", args: ["mcp"] });
});

test("parseCommand rejects arbitrary input and never matches by substring or shell syntax", () => {
  for (const bad of ["rm -rf /", "ls", "cat .env", "help; ls", "`help`", "$(help)", "help && exit", "process.env", "<script>", "", "   "]) {
    assert.equal(parseCommand(bad).ok, false, bad);
  }
  assert.equal(parseCommand("x".repeat(500)).ok, false);
});

test("suggest returns a prefix match only", () => {
  assert.equal(suggest("proj"), "projects");
  assert.equal(suggest("zzz"), null);
  assert.equal(suggest(""), null);
});

test("content: pools are non-empty, ids unique, and no em or en dashes in visible copy", () => {
  const pools = [...Object.values(content.greetings), content.chatter, content.resumeViewer, content.resumeClosed, content.tourDone, content.coffee];
  const ids = new Set();
  for (const p of pools) {
    assert.ok(p.length > 0);
    for (const m of p) {
      assert.ok(!ids.has(m.id), `duplicate id ${m.id}`);
      ids.add(m.id);
      assert.ok(!/[–—]/.test(m.text), m.text);
    }
  }
  for (const t of [...content.thoughts, ...Object.values(content.strings)]) assert.ok(!/[–—]/.test(t), t);
});
